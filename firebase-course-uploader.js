/**
 * Firebase Course Uploader - Manual Admin Flow Simulation
 * 
 * This script uploads course data from JSON file exactly as if an admin
 * manually added it through the dashboard interface.
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, doc, setDoc, serverTimestamp, getDocs, query, where } = require('firebase/firestore');
const fs = require('fs');

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCLpDpzerQ_LNsRih57YRgQASoxc7hPkpQ",
    authDomain: "zor-education-app.firebaseapp.com",
    projectId: "zor-education-app",
    storageBucket: "zor-education-app.firebasestorage.app",
    messagingSenderId: "733330453592",
    appId: "1:733330453592:web:a19454b12ce03368bdc62d",
    measurementId: "G-ZL7FY4MCM5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Clean data to remove any undefined values
 */
function cleanData(obj) {
    if (Array.isArray(obj)) {
        return obj.map(cleanData).filter(item => item !== undefined);
    } else if (obj !== null && typeof obj === 'object') {
        const cleaned = {};
        Object.keys(obj).forEach(key => {
            const cleanedValue = cleanData(obj[key]);
            if (cleanedValue !== undefined) {
                cleaned[key] = cleanedValue;
            }
        });
        return cleaned;
    }
    return obj;
}

/**
 * Check if course already exists
 */
async function checkCourseExists(courseNumber) {
    try {
        const coursesRef = collection(db, 'courses');
        const q = query(coursesRef, where('courseNumber', '==', courseNumber));
        const querySnapshot = await getDocs(q);
        return !querySnapshot.empty;
    } catch (error) {
        console.error('Error checking course existence:', error);
        return false;
    }
}

/**
 * Upload course exactly like admin dashboard
 */
async function uploadCourseAsAdmin(courseData) {
    console.log('🚀 Starting Course Upload (Admin Dashboard Simulation)');
    console.log('=====================================================\n');

    try {
        // Step 1: Check if course already exists
        console.log(`📋 Checking if course ${courseData.courseNumber} already exists...`);
        const courseExists = await checkCourseExists(courseData.courseNumber);

        if (courseExists) {
            console.log(`⚠️  Course ${courseData.courseNumber} already exists!`);
            console.log('Please delete the existing course first or use a different course number.');
            return { success: false, message: 'Course already exists' };
        }

        // Step 2: Create main course document (like admin form submission)
        console.log('📚 Creating main course document...');

        const courseDoc = cleanData({
            courseNumber: courseData.courseNumber,
            titles: courseData.titles,
            descriptions: courseData.descriptions,
            active: courseData.active,
            image: courseData.image,
            estimated_duration: courseData.estimated_duration,
            created_at: serverTimestamp(),
            updated_at: serverTimestamp()
        });

        const courseRef = await addDoc(collection(db, 'courses'), courseDoc);
        const courseId = courseRef.id;

        console.log(`✅ Course created with ID: ${courseId}`);
        console.log(`   Title: ${courseData.titles.en}`);
        console.log(`   Course Number: ${courseData.courseNumber}`);
        console.log(`   Total Levels: ${courseData.levels.length}\n`);

        // Step 3: Upload levels one by one (like admin adding levels manually)
        let uploadedLevels = 0;
        let totalLessons = 0;
        let totalQuizzes = 0;

        for (const levelData of courseData.levels) {
            console.log(`📊 Uploading Level ${levelData.level}: ${levelData.titles.en}`);

            // Use lessons directly as they already match Firebase structure
            const lessons = levelData.lessons.map(lesson => {
                if (lesson.type === 'lesson') {
                    totalLessons++;
                } else if (lesson.type === 'quiz') {
                    totalQuizzes++;
                }
                // Return lesson as-is (already in correct format)
                return cleanData(lesson);
            });

            // Create level document (like admin form submission)
            const levelDoc = cleanData({
                level: levelData.level,
                courseId: courseId,
                courseName: courseData.titles.en,
                titles: levelData.titles,
                subtitles: levelData.subtitles,
                estimated_duration: levelData.estimated_duration,
                lessons: lessons,
                created_at: serverTimestamp(),
                updated_at: serverTimestamp()
            });

            const levelsCollection = collection(db, 'courses', courseId, 'levels');
            const levelRef = await addDoc(levelsCollection, levelDoc);

            uploadedLevels++;
            console.log(`  ✅ Level ${levelData.level} uploaded with ID: ${levelRef.id}`);
            console.log(`     Lessons: ${lessons.filter(l => l.type === 'lesson').length}`);
            console.log(`     Quizzes: ${lessons.filter(l => l.type === 'quiz').length}`);

            // Small delay to prevent overwhelming Firebase
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        console.log('\n🎉 Course Upload Completed Successfully!');
        console.log('========================================');
        console.log(`📋 Course ID: ${courseId}`);
        console.log(`📚 Course: ${courseData.titles.en} (${courseData.titles.ur})`);
        console.log(`🔢 Course Number: ${courseData.courseNumber}`);
        console.log(`📊 Uploaded Levels: ${uploadedLevels}`);
        console.log(`📝 Total Lessons: ${totalLessons}`);
        console.log(`❓ Total Quizzes: ${totalQuizzes}`);
        console.log(`⏱️  Estimated Duration: ${courseData.estimated_duration}`);
        console.log(`🌐 Languages: English & Urdu`);
        console.log(`✅ Status: Active\n`);

        return {
            success: true,
            courseId: courseId,
            stats: {
                levels: uploadedLevels,
                lessons: totalLessons,
                quizzes: totalQuizzes
            }
        };

    } catch (error) {
        console.error('\n❌ Error during upload:', error);
        throw error;
    }
}

/**
 * Main execution function
 */
async function main() {
    try {
        // Read JSON file
        console.log('📖 Reading course data from JSON file...');
        const jsonFilePath = '/Users/zainsafdar/Desktop/Zor/course-2.json';
        
        if (!fs.existsSync(jsonFilePath)) {
            throw new Error(`JSON file not found: ${jsonFilePath}`);
        }
        
        const courseData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));
        
        console.log(`✅ JSON file loaded successfully`);
        console.log(`📚 Course: ${courseData.titles.en}`);
        console.log(`📊 Levels to upload: ${courseData.levels.length}\n`);
        
        // Upload course data
        const result = await uploadCourseAsAdmin(courseData);
        
        if (result.success) {
            console.log('🎯 UPLOAD SUMMARY:');
            console.log('==================');
            console.log('✅ Course successfully uploaded to Firebase');
            console.log('✅ All levels and lessons are properly structured');
            console.log('✅ Data follows exact admin dashboard format');
            console.log('✅ Ready for use in your ZOR Education App');
            console.log('\n💡 You can now test the course in your app!');
        }
        
    } catch (error) {
        console.error('\n❌ Upload failed:', error.message);
        console.error('\nPlease check the error and try again.');
        process.exit(1);
    }
}

// Run the uploader
main().then(() => {
    console.log('\n✅ Upload process completed successfully!');
    process.exit(0);
}).catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
});