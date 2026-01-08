import React, { createContext, useState, useEffect, useContext } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, getDocs, collection, updateDoc, arrayUnion, setDoc, addDoc, serverTimestamp, deleteDoc, query, orderBy, where } from 'firebase/firestore';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { auth, db, storage } from '../firebase/firebaseConfig';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [allCourses, setAllCourses] = useState([]);
    const [allCoursesLevels, setAllCoursesLevels] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
            setIsLoading(true);
            try {
                if (authUser) {
                    setUser(authUser);
                    const userDoc = await getDoc(doc(db, 'users', authUser.uid));
                    const userData = userDoc.exists() ? userDoc.data() : null;
                    setUserData(userData);

                    // Only fetch courses/levels if we don't have them yet or user changed
                    if (allCourses.length === 0 || allCoursesLevels.length === 0) {
                        await Promise.all([
                            fetchAllCourses(),
                            fetchAllCourseLevels()
                        ]);
                    }

                    // Fetch notifications for regular users (debounced)
                    if (userData?.role !== 'Admin') {
                        setTimeout(async () => {
                            await fetchNotifications();
                        }, 1000);
                    }

                    // Navigate only once per session
                    if (userData?.role === 'Admin') {
                        navigate('/dashboard')
                    } else {
                        navigate('/home');
                    }
                } else {
                    setUser(null);
                    setUserData(null);
                    setAllCourses([]);
                    setAllCoursesLevels([]);
                }
            } catch (error) {
                console.error('Error in onAuthStateChanged:', error);
            } finally {
                setIsLoading(false);
            }
        });

        return () => unsubscribe();
    }, [allCourses.length, allCoursesLevels.length]);

    const login = async (email, password) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
                const data = userDoc.data();
                setUserData(data);

                return { success: true };
            } else {
                console.warn('No user data found.');
                setUserData(null);
                return { success: false, error: "No user data found." };
            }
        } catch (error) {
            console.log('Error logging in:', error);

            let errorMessage = "Something went wrong, please try again later.";

            if (error.code === "auth/invalid-credential") {
                errorMessage = "Invalid email or password";
            } else if (error.code === "auth/user-not-found") {
                errorMessage = "No user found with this email";
            } else if (error.code === "auth/wrong-password") {
                errorMessage = "Incorrect password";
            } else if (error.code === "auth/too-many-requests") {
                errorMessage = "Too many failed login attempts, Try again later.";
            } else if (error.code === "auth/network-request-failed") {
                errorMessage = "Network error, Please check your internet connection.";
            } else if (error.code === "auth/user-disabled") {
                errorMessage = "This account has been disabled";
            } else if (error.code === "auth/invalid-email") {
                errorMessage = "Please enter a valid email address";
            }

            toast.error(`Authentication Failed! ${errorMessage}`, {
                position: "top-right",
                autoClose: 3000,
            });

            return { success: false, error: errorMessage };
        }
    };

    const signUp = async (data) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, data?.email, data?.password);
            const user = userCredential.user;

            await setDoc(doc(db, 'users', user.uid), {
                first_name: data?.firstName,
                last_name: data?.lastName,
                email: data?.email,
                full_name: `${data?.firstName} ${data?.lastName}`,
                role: 'user',
                created_at: serverTimestamp(),
                updated_at: serverTimestamp(),
                is_active: true
            });

            toast.success("Account created successfully!", {
                position: "top-right",
                autoClose: 3000,
            });

            return { success: true };
        } catch (error) {
            console.error('Error creating account:', error);

            let errorMessage = "Something went wrong, please try again later.";

            if (error.code === "auth/email-already-in-use") {
                errorMessage = "An account with this email already exists";
            } else if (error.code === "auth/invalid-email") {
                errorMessage = "Please enter a valid email address";
            } else if (error.code === "auth/operation-not-allowed") {
                errorMessage = "Email/password accounts are not enabled";
            } else if (error.code === "auth/weak-password") {
                errorMessage = "Password is too weak. Please choose a stronger password";
            } else if (error.code === "auth/network-request-failed") {
                errorMessage = "Network error, Please check your internet connection";
            }

            toast.error(`Signup Failed! ${errorMessage}`, {
                position: "top-right",
                autoClose: 3000,
            });

            return { success: false, error: errorMessage };
        }
    };

    const signInWithGoogle = async () => {
        try {
            const provider = new GoogleAuthProvider();
            provider.addScope('profile');
            provider.addScope('email');

            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Check if this is a new user by looking for their document in Firestore
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            
            if (!userDoc.exists()) {
                // New Google user - create their document
                const displayName = user.displayName || '';
                const nameParts = displayName.split(' ');
                const firstName = nameParts[0] || '';
                const lastName = nameParts.slice(1).join(' ') || '';

                await setDoc(doc(db, 'users', user.uid), {
                    first_name: firstName,
                    last_name: lastName,
                    email: user.email,
                    full_name: displayName,
                    role: 'user',
                    profile_picture: user.photoURL || '',
                    provider: 'google',
                    created_at: serverTimestamp(),
                    updated_at: serverTimestamp(),
                    is_active: true
                });

                toast.success("Google account created successfully!", {
                    position: "top-right",
                    autoClose: 3000,
                });
            } else {
                // Existing user - just sign them in
                const userData = userDoc.data();
                setUserData(userData);

                toast.success("Welcome back!", {
                    position: "top-right",
                    autoClose: 2000,
                });
            }

            return { success: true };
        } catch (error) {
            console.error('Error signing in with Google:', error);

            let errorMessage = "Google sign-in failed. Please try again.";

            if (error.code === "auth/popup-closed-by-user") {
                errorMessage = "Sign-in was cancelled. Please try again.";
            } else if (error.code === "auth/popup-blocked") {
                errorMessage = "Popup was blocked. Please allow popups and try again.";
            } else if (error.code === "auth/account-exists-with-different-credential") {
                errorMessage = "An account already exists with this email using a different sign-in method.";
            } else if (error.code === "auth/network-request-failed") {
                errorMessage = "Network error. Please check your internet connection.";
            } else if (error.code === "auth/too-many-requests") {
                errorMessage = "Too many failed attempts. Please try again later.";
            }

            toast.error(`Google Sign-in Failed! ${errorMessage}`, {
                position: "top-right",
                autoClose: 3000,
            });

            return { success: false, error: errorMessage };
        }
    };

    // Metadata Functions for Sync Optimization
    const updateMetadata = async (collectionName) => {
        try {
            const metadataRef = doc(db, 'metadata', 'collections');
            const updateData = {
                [`${collectionName}_last_updated`]: serverTimestamp(),
                last_updated: serverTimestamp()
            };
            
            await setDoc(metadataRef, updateData, { merge: true });
            console.log(`📝 Updated metadata for ${collectionName}`);
        } catch (error) {
            console.error('Error updating metadata:', error);
        }
    };

    const getMetadata = async () => {
        try {
            const metadataRef = doc(db, 'metadata', 'collections');
            const metadataDoc = await getDoc(metadataRef);
            
            if (metadataDoc.exists()) {
                return metadataDoc.data();
            } else {
                // Initialize metadata if it doesn't exist
                const initialMetadata = {
                    courses_last_updated: serverTimestamp(),
                    levels_last_updated: serverTimestamp(),
                    lessons_last_updated: serverTimestamp(),
                    notifications_last_updated: serverTimestamp(),
                    last_updated: serverTimestamp()
                };
                await setDoc(metadataRef, initialMetadata);
                return initialMetadata;
            }
        } catch (error) {
            console.error('Error getting metadata:', error);
            return null;
        }
    };

    // Offline Storage Functions
    const storeOfflineData = async (dataType, data) => {
        try {
            const storageKey = `zor_offline_${dataType}`;
            localStorage.setItem(storageKey, JSON.stringify({
                data,
                timestamp: Date.now(),
                version: '1.0'
            }));
            console.log(`💾 Stored ${data.length} ${dataType} items offline`);
        } catch (error) {
            console.error(`Error storing offline ${dataType}:`, error);
        }
    };

    const getOfflineData = (dataType) => {
        try {
            const storageKey = `zor_offline_${dataType}`;
            const stored = localStorage.getItem(storageKey);
            if (stored) {
                const parsed = JSON.parse(stored);
                console.log(`📖 Retrieved ${parsed.data.length} ${dataType} items from offline storage`);
                return parsed;
            }
            return null;
        } catch (error) {
            console.error(`Error getting offline ${dataType}:`, error);
            return null;
        }
    };

    const clearOfflineData = () => {
        try {
            const keys = Object.keys(localStorage).filter(key => key.startsWith('zor_offline_'));
            keys.forEach(key => localStorage.removeItem(key));
            console.log('🗑️ Cleared all offline data');
        } catch (error) {
            console.error('Error clearing offline data:', error);
        }
    };

    // Complete Download System
    const downloadAllContent = async () => {
        try {
            console.log('📥 Starting complete content download...');
            setIsLoading(true);

            // Download all data in parallel
            const [coursesResult, levelsResult, notificationsResult] = await Promise.all([
                fetchAllCourses(),
                fetchAllCourseLevels(),
                userData?.role !== 'Admin' ? fetchNotifications() : Promise.resolve({ success: true, notifications: [] })
            ]);

            // Store everything offline
            if (coursesResult.success) {
                await storeOfflineData('courses', coursesResult.data || allCourses);
            }
            if (levelsResult.success) {
                await storeOfflineData('levels', levelsResult.data || allCoursesLevels);
            }
            if (notificationsResult.success) {
                await storeOfflineData('notifications', notificationsResult.notifications || notifications);
            }

            // Store sync timestamp
            localStorage.setItem('zor_last_sync', Date.now().toString());

            toast.success("All content downloaded for offline use!", {
                position: "top-right",
                autoClose: 3000,
            });

            console.log('✅ Complete download finished');
            return { success: true };
        } catch (error) {
            console.error('❌ Error in complete download:', error);
            toast.error("Failed to download content offline", {
                position: "top-right",
                autoClose: 3000,
            });
            return { success: false, error: error.message };
        } finally {
            setIsLoading(false);
        }
    };

    // Smart Sync Check
    const checkForUpdates = async () => {
        try {
            console.log('🔍 Checking for updates...');
            
            // Get server metadata (1 read only!)
            const serverMetadata = await getMetadata();
            if (!serverMetadata) return { hasUpdates: false };

            // Get local sync timestamps
            const lastSync = parseInt(localStorage.getItem('zor_last_sync') || '0');
            const localCourseSync = parseInt(localStorage.getItem('zor_courses_sync') || '0');
            const localLevelSync = parseInt(localStorage.getItem('zor_levels_sync') || '0');
            const localNotificationSync = parseInt(localStorage.getItem('zor_notifications_sync') || '0');

            // Compare timestamps
            const serverCourseTime = serverMetadata.courses_last_updated?.toDate?.() || new Date(0);
            const serverLevelTime = serverMetadata.levels_last_updated?.toDate?.() || new Date(0);
            const serverNotificationTime = serverMetadata.notifications_last_updated?.toDate?.() || new Date(0);

            const updates = {
                hasUpdates: false,
                courses: serverCourseTime.getTime() > localCourseSync,
                levels: serverLevelTime.getTime() > localLevelSync,
                notifications: serverNotificationTime.getTime() > localNotificationSync
            };

            updates.hasUpdates = updates.courses || updates.levels || updates.notifications;

            console.log('📊 Update check result:', updates);
            return updates;
        } catch (error) {
            console.error('❌ Error checking for updates:', error);
            return { hasUpdates: false };
        }
    };

    // Sync Updates
    const syncUpdates = async (updateFlags) => {
        try {
            console.log('🔄 Syncing updates...', updateFlags);
            
            const promises = [];
            
            if (updateFlags.courses) {
                console.log('📚 Syncing courses...');
                promises.push(
                    fetchAllCourses().then(result => {
                        if (result.success) {
                            storeOfflineData('courses', result.data || allCourses);
                            localStorage.setItem('zor_courses_sync', Date.now().toString());
                        }
                    })
                );
            }

            if (updateFlags.levels) {
                console.log('📊 Syncing levels...');
                promises.push(
                    fetchAllCourseLevels().then(result => {
                        if (result.success) {
                            storeOfflineData('levels', result.data || allCoursesLevels);
                            localStorage.setItem('zor_levels_sync', Date.now().toString());
                        }
                    })
                );
            }

            if (updateFlags.notifications && userData?.role !== 'Admin') {
                console.log('🔔 Syncing notifications...');
                promises.push(
                    fetchNotifications().then(result => {
                        if (result.success) {
                            storeOfflineData('notifications', result.notifications || notifications);
                            localStorage.setItem('zor_notifications_sync', Date.now().toString());
                        }
                    })
                );
            }

            await Promise.all(promises);
            localStorage.setItem('zor_last_sync', Date.now().toString());

            console.log('✅ Sync completed');
            return { success: true };
        } catch (error) {
            console.error('❌ Error syncing updates:', error);
            return { success: false, error: error.message };
        }
    };

    // Background Sync
    const performBackgroundSync = async () => {
        try {
            console.log('🔄 Performing background sync...');
            
            const updateCheck = await checkForUpdates();
            if (updateCheck.hasUpdates) {
                console.log('📥 Updates found, syncing...');
                await syncUpdates(updateCheck);
                
                // Show subtle notification about updates
                if (updateCheck.courses || updateCheck.levels) {
                    toast.info("New content available!", {
                        position: "bottom-right",
                        autoClose: 2000,
                    });
                }
            } else {
                console.log('✅ No updates needed');
            }
        } catch (error) {
            console.error('❌ Background sync error:', error);
        }
    };

    // Manual Sync - Triggered by user action
    const triggerManualSync = async () => {
        try {
            console.log('🔄 Manual sync triggered by user...');
            toast.info("Checking for updates...", { autoClose: 1000 });
            
            const updateCheck = await checkForUpdates();
            if (updateCheck.hasUpdates) {
                console.log('📥 Updates found, syncing...');
                toast.success("Updates found! Downloading new content...", { autoClose: 2000 });
                
                await syncUpdates(updateCheck);
                
                toast.success("All content updated successfully!", {
                    position: "top-center",
                    autoClose: 3000,
                });
                
                // Refresh all data
                await fetchAllCourses();
                await fetchAllCourseLevels();
                await fetchNotifications();
            } else {
                console.log('✅ No updates available');
                toast.info("You're already up to date!", {
                    position: "top-center",
                    autoClose: 2000,
                });
            }
            
            return updateCheck;
        } catch (error) {
            console.error('❌ Manual sync error:', error);
            toast.error("Sync failed. Please try again.", {
                position: "top-center",
                autoClose: 3000,
            });
            return { success: false, error: error.message };
        }
    };

    // Notification Functions
    const createNotification = async (type, title, message, metadata = {}) => {
        try {
            console.log('🔔 Creating notification:', {
                type,
                title,
                message,
                userUid: user?.uid,
                userRole: userData?.role,
                metadata
            });

            if (!user || !user.uid) {
                console.error('❌ Cannot create notification - no user');
                return { success: false, error: 'No user authenticated' };
            }

            const notificationData = {
                type,
                title,
                message,
                targetUsers: "all", // Target all regular users
                createdAt: serverTimestamp(),
                createdBy: user.uid,
                metadata,
                readBy: [] // Array of user IDs who have read this notification
            };

            console.log('📤 Sending notification to Firestore:', notificationData);

            const docRef = await addDoc(collection(db, 'notifications'), notificationData);
            console.log('✅ Notification created successfully with ID:', docRef.id);
            
            // Update metadata for sync optimization
            await updateMetadata('notifications');
            
            return { success: true, id: docRef.id };
        } catch (error) {
            console.error('❌ Error creating notification:', error);
            console.error('Error details:', error.message);
            console.error('Error code:', error.code);
            return { success: false, error: error.message };
        }
    };

    const fetchNotifications = async () => {
        console.log('📥 Fetching notifications for user:', {
            userUid: user?.uid,
            userRole: userData?.role,
            isAdmin: userData?.role === 'Admin'
        });

        if (!user || userData?.role === 'Admin') {
            console.log('⏭️ Skipping notifications fetch - admin user or no user');
            return;
        }
        
        try {
            console.log('🔍 Querying notifications collection...');
            const notificationsRef = collection(db, 'notifications');
            // Temporarily remove orderBy to avoid index requirement
            const q = query(
                notificationsRef,
                where('targetUsers', '==', 'all')
            );
            
            const querySnapshot = await getDocs(q);
            const fetchedNotifications = [];
            
            querySnapshot.forEach((doc) => {
                fetchedNotifications.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            // Sort by createdAt manually since we can't use orderBy without index
            fetchedNotifications.sort((a, b) => {
                const aTime = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
                const bTime = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
                return bTime - aTime; // Descending order (newest first)
            });
            
            console.log('📋 Fetched notifications:', {
                count: fetchedNotifications.length,
                notifications: fetchedNotifications
            });
            
            setNotifications(fetchedNotifications);
            
            // Calculate unread count
            const unreadCount = fetchedNotifications.filter(
                notification => !notification.readBy.includes(user.uid)
            ).length;
            
            console.log('🔢 Unread count:', unreadCount);
            setUnreadNotificationCount(unreadCount);
            
            return { success: true, notifications: fetchedNotifications };
        } catch (error) {
            console.error('❌ Error fetching notifications:', error);
            console.error('Error details:', error.message);
            console.error('Error code:', error.code);
            return { success: false, error: error.message };
        }
    };

    const markNotificationAsRead = async (notificationId) => {
        try {
            const notificationRef = doc(db, 'notifications', notificationId);
            await updateDoc(notificationRef, {
                readBy: arrayUnion(user.uid)
            });
            
            // Update local state
            setNotifications(prev => 
                prev.map(notification => 
                    notification.id === notificationId 
                        ? { ...notification, readBy: [...notification.readBy, user.uid] }
                        : notification
                )
            );
            
            // Update unread count
            setUnreadNotificationCount(prev => Math.max(0, prev - 1));
            
            return { success: true };
        } catch (error) {
            console.error('Error marking notification as read:', error);
            return { success: false, error: error.message };
        }
    };

    const markAllNotificationsAsRead = async () => {
        try {
            const unreadNotifications = notifications.filter(
                notification => !notification.readBy.includes(user.uid)
            );
            
            const updatePromises = unreadNotifications.map(notification => {
                const notificationRef = doc(db, 'notifications', notification.id);
                return updateDoc(notificationRef, {
                    readBy: arrayUnion(user.uid)
                });
            });
            
            await Promise.all(updatePromises);
            
            // Update local state
            setNotifications(prev => 
                prev.map(notification => ({
                    ...notification,
                    readBy: notification.readBy.includes(user.uid) 
                        ? notification.readBy 
                        : [...notification.readBy, user.uid]
                }))
            );
            
            setUnreadNotificationCount(0);
            
            return { success: true };
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            return { success: false, error: error.message };
        }
    };

    const createCourse = async (courseData) => {
        try {
            const docRef = await addDoc(collection(db, 'courses'), {
                ...courseData,
                created_at: serverTimestamp(),
                updated_at: serverTimestamp()
            });

            toast.success("Course created successfully!", {
                position: "top-right",
                autoClose: 2000,
            });

            // Create notification for new course
            console.log('🎯 Checking if should create course notification:', {
                userRole: userData?.role,
                isAdmin: userData?.role === 'Admin'
            });
            
            if (userData?.role === 'Admin') {
                console.log('📢 Admin creating course notification...');
                const notificationResult = await createNotification(
                    'course_added',
                    'New Course Available! 📚',
                    `Check out the new course: ${courseData.titles?.en || courseData.titles?.ur || 'New Course'}`,
                    {
                        courseId: docRef.id,
                        courseName: courseData.titles?.en || courseData.titles?.ur || 'New Course'
                    }
                );
                console.log('📢 Course notification result:', notificationResult);
            } else {
                console.log('⚠️ Not creating notification - user is not admin');
            }

            await fetchAllCourses();
            
            // Update metadata for sync optimization
            await updateMetadata('courses');

            return { success: true, id: docRef.id };
        } catch (error) {
            console.error('Error creating course:', error);
            toast.error("Failed to create course. Please try again.", {
                position: "top-right",
                autoClose: 3000,
            });
            return { success: false, error: error.message };
        }
    };

    const updateCourse = async (courseId, courseData) => {
        try {
            const courseRef = doc(db, 'courses', courseId);
            await updateDoc(courseRef, {
                ...courseData,
                updated_at: serverTimestamp()
            });

            toast.success("Course updated successfully!", {
                position: "top-right",
                autoClose: 2000,
            });

            return { success: true };
        } catch (error) {
            console.error('Error updating course:', error);
            toast.error("Failed to update course. Please try again.", {
                position: "top-right",
                autoClose: 3000,
            });
            return { success: false, error: error.message };
        }
    };

    const deleteCourse = async (courseId) => {
        try {
            console.log('Starting cascade delete for course:', courseId);

            // First, delete all levels and their lessons
            const levelsRef = collection(db, 'courses', courseId, 'levels');
            const levelsSnapshot = await getDocs(levelsRef);
            
            console.log('Found levels to delete:', levelsSnapshot.size);

            // Delete each level document (this will cascade delete all lessons within each level)
            const deletePromises = levelsSnapshot.docs.map(async (levelDoc) => {
                console.log('Deleting level:', levelDoc.id);
                await deleteDoc(levelDoc.ref);
            });

            await Promise.all(deletePromises);

            // Finally, delete the main course document
            const courseRef = doc(db, 'courses', courseId);
            await deleteDoc(courseRef);

            console.log('Course and all related data deleted successfully');

            // Refresh the local data
            await fetchAllCourses();
            await fetchAllCourseLevels();

            toast.success("Course and all related content deleted successfully!", {
                position: "top-right",
                autoClose: 2000,
            });

            return { success: true };
        } catch (error) {
            console.error('Error deleting course:', error);
            toast.error("Failed to delete course. Please try again.", {
                position: "top-right",
                autoClose: 3000,
            });
            return { success: false, error: error.message };
        }
    };

    const fetchAllCourses = async () => {
        try {
            const coursesRef = collection(db, "courses");
            const q = query(coursesRef, orderBy("created_at", "asc"));
            const querySnapshot = await getDocs(q);

            const courses = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            setAllCourses(courses);
            return { success: true, data: courses };
        } catch (error) {
            console.error("Error fetching courses:", error);
            return { success: false, error: error.message };
        }
    };


    const createCourseLevel = async (courseId, levelData) => {
        try {
            const levelRef = collection(db, 'courses', courseId, 'levels');
            const docRef = await addDoc(levelRef, {
                ...levelData,
                lessons: [],
                created_at: serverTimestamp(),
                updated_at: serverTimestamp()
            });

            toast.success("Course level created successfully!", {
                position: "top-right",
                autoClose: 2000,
            });

            // Create notification for new level
            if (userData?.role === 'Admin') {
                // Get course name for better notification
                const courseDoc = await getDoc(doc(db, 'courses', courseId));
                const courseName = courseDoc.data()?.titles?.en || courseDoc.data()?.titles?.ur || 'Course';
                
                await createNotification(
                    'level_added',
                    'New Level Added! 📊',
                    `New level "${levelData.titles?.en || levelData.titles?.ur || `Level ${levelData.level}`}" added to ${courseName}`,
                    {
                        courseId,
                        courseName,
                        levelId: docRef.id,
                        levelName: levelData.titles?.en || levelData.titles?.ur || `Level ${levelData.level}`,
                        level: levelData.level
                    }
                );
            }

            await fetchAllCourseLevels();
            
            // Update metadata for sync optimization
            await updateMetadata('levels');

            return { success: true, id: docRef.id };
        } catch (error) {
            console.error('Error creating course level:', error);
            toast.error("Failed to create course level. Please try again.", {
                position: "top-right",
                autoClose: 3000,
            });
            return { success: false, error: error.message };
        }
    };

    const updateCourseLevel = async (courseId, levelId, levelData) => {
        try {
            const levelRef = doc(db, 'courses', courseId, 'levels', levelId);
            await updateDoc(levelRef, {
                ...levelData,
                updated_at: serverTimestamp()
            });

            toast.success("Course level updated successfully!", {
                position: "top-right",
                autoClose: 2000,
            });

            return { success: true };
        } catch (error) {
            console.error('Error updating course level:', error);
            toast.error("Failed to update course level. Please try again.", {
                position: "top-right",
                autoClose: 3000,
            });
            return { success: false, error: error.message };
        }
    };

    const deleteCourseLevel = async (courseId, levelId) => {
        try {
            const levelRef = doc(db, 'courses', courseId, 'levels', levelId);
            await deleteDoc(levelRef);

            toast.success("Course level deleted successfully!", {
                position: "top-right",
                autoClose: 2000,
            });

            return { success: true };
        } catch (error) {
            console.error('Error deleting course level:', error);
            toast.error("Failed to delete course level. Please try again.", {
                position: "top-right",
                autoClose: 3000,
            });
            return { success: false, error: error.message };
        }
    };

    const fetchCourseLevels = async (courseId) => {
        try {
            const levelsRef = collection(db, 'courses', courseId, 'levels');
            const q = query(levelsRef, orderBy('level', 'asc'));
            const querySnapshot = await getDocs(q);

            const levels = [];
            querySnapshot.forEach((doc) => {
                levels.push({
                    id: doc.id,
                    courseId: courseId,
                    ...doc.data()
                });
            });

            return { success: true, data: levels };
        } catch (error) {
            console.error('Error fetching course levels:', error);
            return { success: false, error: error.message };
        }
    };

    const fetchAllCourseLevels = async () => {
        try {
            const coursesSnapshot = await getDocs(collection(db, "courses"));
            const courses = coursesSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            const levelPromises = courses.map(async (course) => {
                const levelsRef = collection(db, "courses", course.id, "levels");
                const levelsSnapshot = await getDocs(levelsRef);

                return levelsSnapshot.docs.map((levelDoc) => ({
                    id: levelDoc.id,
                    courseId: course.id,
                    courseName: course.titles || {},
                    ...levelDoc.data(),
                }));
            });

            const allLevelsNested = await Promise.all(levelPromises);

            const allLevels = allLevelsNested.flat();

            setAllCoursesLevels(allLevels);
            return { success: true, data: allLevels };
        } catch (error) {
            console.error("Error fetching all course levels:", error);
            return { success: false, error: error.message };
        }
    };

    const addLessonsToLevel = async (courseId, levelId, lessons) => {
        try {
            const levelRef = doc(db, 'courses', courseId, 'levels', levelId);
            
            // Get current level data to determine next order numbers
            const levelDoc = await getDoc(levelRef);
            const currentLessons = levelDoc.exists() ? (levelDoc.data().lessons || []) : [];

            // First pass: Create lesson ID mappings
            const tempIdToRealIdMap = {};
            const baseTimestamp = Date.now();
            
            const lessonsWithMetadata = lessons.map((lesson, index) => {
                const newRealId = `${baseTimestamp}_${index}`;
                
                // Map temp lesson ID to real lesson ID for quizzes
                if (lesson.tempId) {
                    tempIdToRealIdMap[lesson.tempId] = newRealId;
                }
                
                // Calculate next order number based on existing content
                let nextOrder;
                if (lesson.type === 'quiz' && lesson.parentLessonId) {
                    // For quizzes, find the highest order among quizzes with same parentLessonId
                    const existingQuizzesForLesson = currentLessons.filter(l => 
                        l.type === 'quiz' && l.parentLessonId === lesson.parentLessonId
                    );
                    const maxQuizOrder = existingQuizzesForLesson.length > 0 
                        ? Math.max(...existingQuizzesForLesson.map(q => q.order || 0))
                        : 0;
                    nextOrder = maxQuizOrder + 1 + index; // +index for multiple quizzes being added
                    
                    console.log(`🔢 Quiz ordering: parentLessonId=${lesson.parentLessonId}, existingQuizzes=${existingQuizzesForLesson.length}, maxOrder=${maxQuizOrder}, nextOrder=${nextOrder}`);
                } else {
                    // For lessons, find the highest order among all lessons
                    const existingLessons = currentLessons.filter(l => l.type === 'lesson');
                    const maxLessonOrder = existingLessons.length > 0 
                        ? Math.max(...existingLessons.map(l => l.order || 0))
                        : 0;
                    nextOrder = maxLessonOrder + 1 + index; // +index for multiple lessons being added
                    
                    console.log(`🔢 Lesson ordering: existingLessons=${existingLessons.length}, maxOrder=${maxLessonOrder}, nextOrder=${nextOrder}`);
                }
                
                const cleanLesson = {
                    ...lesson,
                    id: newRealId,
                    order: nextOrder,
                    created_at: new Date().toISOString()
                };
                
                // Remove temporary fields
                delete cleanLesson.tempId;
                
                return cleanLesson;
            });
            
            // Second pass: Update quiz parentLessonId to match real lesson IDs
            const correctedLessons = lessonsWithMetadata.map(item => {
                if (item.type === 'quiz' && item.parentLessonId) {
                    // If parentLessonId matches a temp ID, update it to real ID
                    if (tempIdToRealIdMap[item.parentLessonId]) {
                        return {
                            ...item,
                            parentLessonId: tempIdToRealIdMap[item.parentLessonId]
                        };
                    }
                }
                return item;
            });

            await updateDoc(levelRef, {
                lessons: arrayUnion(...correctedLessons),
                updated_at: serverTimestamp()
            });

            toast.success(`Successfully added ${lessons.length} items!`, {
                position: "top-right",
                autoClose: 2000,
            });

            // Create notifications for new lessons and quizzes
            if (userData?.role === 'Admin' && lessons.length > 0) {
                // Get course and level info for better notifications
                const courseDoc = await getDoc(doc(db, 'courses', courseId));
                const levelDoc = await getDoc(levelRef);
                const courseName = courseDoc.data()?.titles?.en || courseDoc.data()?.titles?.ur || 'Course';
                const levelName = levelDoc.data()?.titles?.en || levelDoc.data()?.titles?.ur || `Level ${levelDoc.data()?.level}`;

                // Group lessons and quizzes for separate notifications
                const newLessons = lessons.filter(item => item.type === 'lesson');
                const newQuizzes = lessons.filter(item => item.type === 'quiz');

                // Helper to get title from both formats (title or titles)
                const getItemTitle = (item) => {
                    const titleObj = item.title || item.titles;
                    return titleObj?.en || titleObj?.ur || (item.type === 'lesson' ? 'Lesson' : 'Quiz');
                };

                // Create notification for lessons
                if (newLessons.length > 0) {
                    const lessonTitle = newLessons.length === 1 ? 'New Lesson Added! 📖' : `${newLessons.length} New Lessons Added! 📖`;
                    const lessonMessage = newLessons.length === 1
                        ? `New lesson "${getItemTitle(newLessons[0])}" added to ${courseName} - ${levelName}`
                        : `${newLessons.length} new lessons added to ${courseName} - ${levelName}`;

                    await createNotification(
                        'lesson_added',
                        lessonTitle,
                        lessonMessage,
                        {
                            courseId,
                            courseName,
                            levelId,
                            levelName,
                            itemCount: newLessons.length
                        }
                    );
                }

                // Create notification for quizzes
                if (newQuizzes.length > 0) {
                    const quizTitle = newQuizzes.length === 1 ? 'New Quiz Added! ❓' : `${newQuizzes.length} New Quizzes Added! ❓`;
                    const quizMessage = newQuizzes.length === 1
                        ? `New quiz "${getItemTitle(newQuizzes[0])}" added to ${courseName} - ${levelName}`
                        : `${newQuizzes.length} new quizzes added to ${courseName} - ${levelName}`;

                    await createNotification(
                        'quiz_added',
                        quizTitle,
                        quizMessage,
                        {
                            courseId,
                            courseName,
                            levelId,
                            levelName,
                            itemCount: newQuizzes.length
                        }
                    );
                }
            }

            await fetchAllCourseLevels();
            
            // Update metadata for sync optimization
            await updateMetadata('lessons');

            return { success: true };
        } catch (error) {
            console.error('Error adding lessons to level:', error);
            toast.error("Failed to add lessons. Please try again.", {
                position: "top-right",
                autoClose: 3000,
            });
            return { success: false, error: error.message };
        }
    };

    const updateLessonInLevel = async (courseId, levelId, updatedItem) => {
        try {
            const levelRef = doc(db, 'courses', courseId, 'levels', levelId);
            const levelDoc = await getDoc(levelRef);

            if (levelDoc.exists()) {
                const currentLessons = levelDoc.data().lessons || [];
                const updatedLessons = currentLessons.map(lesson => 
                    lesson.id === updatedItem.id 
                        ? { ...updatedItem, updated_at: new Date().toISOString() }
                        : lesson
                );

                await updateDoc(levelRef, {
                    lessons: updatedLessons,
                    updated_at: serverTimestamp()
                });

                toast.success(`${updatedItem.type === 'quiz' ? 'Quiz' : 'Lesson'} updated successfully!`, {
                    position: "top-right",
                    autoClose: 2000,
                });

                return { success: true };
            } else {
                throw new Error('Level not found');
            }
        } catch (error) {
            console.error('Error updating lesson/quiz:', error);
            toast.error(`Failed to update ${updatedItem.type === 'quiz' ? 'quiz' : 'lesson'}. Please try again.`, {
                position: "top-right",
                autoClose: 3000,
            });
            return { success: false, error: error.message };
        }
    };

    const deleteLessonFromLevel = async (courseId, levelId, lessonId) => {
        try {
            const levelRef = doc(db, 'courses', courseId, 'levels', levelId);
            const levelDoc = await getDoc(levelRef);

            if (levelDoc.exists()) {
                const currentLessons = levelDoc.data().lessons || [];
                const updatedLessons = currentLessons.filter(lesson => lesson.id !== lessonId);

                await updateDoc(levelRef, {
                    lessons: updatedLessons,
                    updated_at: serverTimestamp()
                });

                toast.success("Lesson deleted successfully!", {
                    position: "top-right",
                    autoClose: 2000,
                });

                return { success: true };
            } else {
                return { success: false, error: "Level not found" };
            }
        } catch (error) {
            console.error('Error deleting lesson:', error);
            toast.error("Failed to delete lesson. Please try again.", {
                position: "top-right",
                autoClose: 3000,
            });
            return { success: false, error: error.message };
        }
    };

    const fetchAllLessons = async () => {
        try {
            const coursesSnapshot = await getDocs(collection(db, 'courses'));
            const allLessons = [];

            for (const courseDoc of coursesSnapshot.docs) {
                const levelsRef = collection(db, 'courses', courseDoc.id, 'levels');
                const levelsSnapshot = await getDocs(levelsRef);

                levelsSnapshot.forEach((levelDoc) => {
                    const lessons = levelDoc.data().lessons || [];
                    lessons.forEach((lesson) => {
                        allLessons.push({
                            ...lesson,
                            levelId: levelDoc.id,
                            courseId: courseDoc.id,
                            courseName: courseDoc.data().titles || {},
                            levelName: levelDoc.data().titles || {}
                        });
                    });
                });
            }

            return { success: true, data: allLessons };
        } catch (error) {
            console.error('Error fetching all lessons:', error);
            return { success: false, error: error.message };
        }
    };

    const fetchDocsByCollection = async (collectionName) => {
        try {
            const collectionRef = collection(db, collectionName);
            const querySnapshot = await getDocs(collectionRef);

            const docs = [];
            querySnapshot.forEach((doc) => {
                docs.push({ id: doc.id, ...doc.data() });
            });

            console.log(`${collectionName} documents fetched successfully!`);
            return { success: true, data: docs };
        } catch (error) {
            console.error('Error fetching documents by collection:', error);
            return { success: false, error: error.message };
        }
    };

    const fetchDocByPath = async (...pathSegments) => {
        try {
            const docRef = doc(db, ...pathSegments);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                console.log(`Document at path "${pathSegments.join("/")}" fetched successfully!`);
                return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
            } else {
                console.warn(`No document found at path: ${pathSegments.join("/")}`);
                return { success: false, error: "Document not found" };
            }
        } catch (error) {
            console.error("Error fetching document by path:", error);
            return { success: false, error: error.message };
        }
    };

    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
            setUser(null);
            setUserData(null);

            toast.success("Signed Out! You have successfully signed out.", {
                position: "top-right",
                autoClose: 1500,
                onClose: () => {
                    navigate("/", { replace: true })
                },
            });
        } catch (error) {
            console.error('Error signing out:', error);

            toast.error("Sign Out Failed! An error occurred while signing out. Please try again.", {
                position: "top-right",
                autoClose: 3000,
            });
        }
    };

    const refreshUserData = async () => {
        try {
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);
            setUserData(userDoc.data());

            if (userDoc.exists()) {
                console.log('user data refresh successfully!');
                return { success: true, data: userDoc.data() };
            } else {
                return { success: false, error: 'User not found' };
            }
        } catch (error) {
            console.error('Error refresh user data:', error);
            return { success: false, error: error.message };
        }
    };

    const updateDocById = async (collectionName, docId, updatedFields) => {
        try {
            const docRef = doc(db, collectionName, docId);
            await updateDoc(docRef, updatedFields);
            console.log(`Document in collection ${collectionName} with ID ${docId} successfully updated.`);
            return { success: true };
        } catch (error) {
            console.error(`Error updating document in collection ${collectionName} with ID ${docId}:`, error);
            return { success: false, error: error.message };
        }
    };

    const uploadFile = async (file, path) => {
        try {
            const storageRef = ref(storage, path);
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            return { success: true, downloadURL };
        } catch (error) {
            console.error('Error uploading file:', error);
            return { success: false, error: error.message };
        }
    };

    const enrollInCourse = async (courseId) => {
        try {
            console.log('Starting enrollment for course:', courseId);
            console.log('User:', user?.uid);
            console.log('UserData exists:', !!userData);
            console.log('AllCoursesLevels count:', allCoursesLevels.length);
            
            if (!user || !userData) {
                console.error('User not authenticated');
                toast.error("Please login to enroll in courses", {
                    position: "top-right",
                    autoClose: 3000,
                });
                return { success: false, error: 'User not authenticated' };
            }

            // Wait for course levels to be loaded if they're not available yet
            if (allCoursesLevels.length === 0) {
                console.log('Course levels not loaded yet, fetching...');
                await fetchAllCourseLevels();
            }

            const currentProgress = userData.course_progress || [];
            console.log('Current progress count:', currentProgress.length);
            
            // Check if already enrolled
            const isAlreadyEnrolled = currentProgress.some(progress => progress.course_id === courseId);
            if (isAlreadyEnrolled) {
                console.log('Already enrolled');
                toast.info("You are already enrolled in this course!", {
                    position: "top-right",
                    autoClose: 2000,
                });
                return { success: false, error: 'Already enrolled in this course' };
            }

            // Get first level of the course
            const courseLevels = allCoursesLevels.filter(level => level.courseId === courseId);
            console.log('Found course levels for courseId', courseId, ':', courseLevels.length);
            
            if (courseLevels.length === 0) {
                console.error('No levels found for course:', courseId);
                toast.error("This course has no levels available yet.", {
                    position: "top-right",
                    autoClose: 3000,
                });
                return { success: false, error: 'Course has no levels available' };
            }

            const firstLevel = courseLevels.sort((a, b) => a.level - b.level)[0];
            console.log('First level found:', firstLevel?.id);

            // Create enrollment progress entry
            const enrollmentProgress = {
                course_id: courseId,
                level_id: firstLevel.id,
                status: 'enrolled',
                completedLessons: [],
                enrolled_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const updatedProgress = [...currentProgress, enrollmentProgress];

            // Update user document
            console.log('Updating user document...');
            await updateDoc(doc(db, 'users', user.uid), {
                course_progress: updatedProgress,
                updated_at: new Date().toISOString()
            });

            console.log('Document updated successfully');

            // Update local userData
            setUserData(prev => ({
                ...prev,
                course_progress: updatedProgress
            }));

            toast.success("Successfully enrolled in course!", {
                position: "top-right",
                autoClose: 2000,
            });

            return { success: true };
        } catch (error) {
            console.error('Error enrolling in course:', error);
            console.error('Error details:', error.code, error.message);
            
            let errorMessage = "Failed to enroll in course. Please try again.";
            if (error.code === 'permission-denied') {
                errorMessage = "Permission denied. Please check your account status.";
            } else if (error.code === 'not-found') {
                errorMessage = "User account not found. Please login again.";
            }
            
            toast.error(errorMessage, {
                position: "top-right",
                autoClose: 3000,
            });
            return { success: false, error: error.message };
        }
    };

    const isEnrolledInCourse = (courseId) => {
        if (!userData?.course_progress) return false;
        return userData.course_progress.some(progress => progress.course_id === courseId);
    };

    const value = {
        user,
        userData,
        allCourses,
        allCoursesLevels,
        notifications,
        unreadNotificationCount,
        isLoading,
        isAdmin: userData?.role === 'Admin',
        login,
        signUp,
        signInWithGoogle,
        signOut,
        fetchDocsByCollection,
        fetchDocByPath,
        refreshUserData,
        updateDocById,
        uploadFile,
        createCourse,
        updateCourse,
        deleteCourse,
        fetchAllCourses,
        createCourseLevel,
        updateCourseLevel,
        deleteCourseLevel,
        fetchCourseLevels,
        fetchAllCourseLevels,
        addLessonsToLevel,
        updateLessonInLevel,
        deleteLessonFromLevel,
        fetchAllLessons,
        enrollInCourse,
        isEnrolledInCourse,
        // Notification functions
        createNotification,
        fetchNotifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        // Offline & Sync functions
        downloadAllContent,
        checkForUpdates,
        syncUpdates,
        performBackgroundSync,
        triggerManualSync,
        storeOfflineData,
        getOfflineData,
        clearOfflineData,
        getMetadata,
        updateMetadata
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};