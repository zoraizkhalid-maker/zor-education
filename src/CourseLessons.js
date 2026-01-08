import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, ListGroup, Button } from 'react-bootstrap';
import { useLanguage } from './LanguageContext';
import Header from './Header';
import './styles/courselessons.css';
import { useAuth } from './context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { LoadingScreen } from './Loading';

const CourseLessons = ({
    onLessonComplete,
    onCourseComplete,
    onBack,
    initialLesson = null,
    completedLessonsData = []
}) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { selectedCourseId, selectedLevelId } = location.state || {};
    const { t, isRTL } = useLanguage();
    const { updateDocById, userData, refreshUserData, user, allCourses, allCoursesLevels } = useAuth();

    const currentLanguage = isRTL ? 'ur' : 'en';

    const [courseData, setCourseData] = useState(null);
    const [levelData, setLevelData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
    const [currentSubItemIndex, setCurrentSubItemIndex] = useState(0); // For tracking quizzes within lessons
    const [completedLessons, setCompletedLessons] = useState([]);
    const [completedSubItems, setCompletedSubItems] = useState({}); // Track completed quizzes per lesson
    const [courseProgress, setCourseProgress] = useState(0);
    const [sidebarShow, setSidebarShow] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
    const [showCompletion, setShowCompletion] = useState(false);
    const [flattenedItems, setFlattenedItems] = useState([]); // Flattened list for navigation
    const [isReviewMode, setIsReviewMode] = useState(false); // Track if we're reviewing completed course

    const config = {
        icons: {
            completed: "/assets/checkbox1.png",
            notCompleted: "/assets/checkbox.png",
            success: "/assets/success-icon.png",
            error: "/assets/error-icon.png",
            arrowLeft: "/assets/back.png",
            menu: "/assets/next.png",
            close: "/assets/close.png",
            graduationCap: "/assets/23.png"
        }
    };

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            navigate('/course-levels', {
                state: { selectedCourseId }
            });
        }
    };

    const handleViewLessons = () => {
        console.log('handleViewLessons called - entering review mode', {
            isReviewMode,
            showCompletion,
            currentLessonIndex
        });
        
        setShowCompletion(false);
        setCurrentLessonIndex(0);
        setCurrentSubItemIndex(0);
        
        // Keep isReviewMode = true, but ensure we have full lesson structure
        // Re-organize lessons to make sure all items are available
        if (levelData?.lessons) {
            const { hierarchical, flattened } = organizeHierarchicalLessons(levelData.lessons);
            setFlattenedItems(flattened);
            
            // In review mode, mark all items as completed so user can navigate freely
            const allIndices = flattened.map((_, index) => index);
            setCompletedLessons(allIndices);
            
            console.log('Re-organized lessons for review mode:', { 
                flattened, 
                totalItems: flattened.length,
                allIndicesMarkedCompleted: allIndices,
                isReviewModeAfterUpdate: isReviewMode
            });
        }
        
        // Ensure we stay out of completion screen
        console.log('handleViewLessons completed, showCompletion should be false');
    };

    // Clean and validate lesson data
    const cleanLessonData = (lesson) => {
        if (!lesson) return null;
        
        // Clean title if it appears corrupted (contains too many random characters)
        const cleanTitle = (title) => {
            if (!title || typeof title !== 'string') return title;
            
            // If title is very long and contains mostly random characters, use fallback
            if (title.length > 100 || (title.match(/[a-zA-Z]{20,}/g) && !title.includes(' '))) {
                return null; // Will trigger fallback
            }
            
            // Remove any heart emojis or similar characters
            return title.replace(/[❤♥💝💖💗💘💙💚💛💜🧡🤍🖤🤎💟]/g, '').trim();
        };
        
        const cleaned = { ...lesson };
        
        if (cleaned.title) {
            cleaned.title = {
                en: cleanTitle(cleaned.title.en),
                ur: cleanTitle(cleaned.title.ur)
            };
        }
        
        return cleaned;
    };

    // Create flattened navigation list sorted by order
    const organizeHierarchicalLessons = (lessons) => {
        if (!lessons || lessons.length === 0) {
            return { hierarchical: [], flattened: [] };
        }

        // Sort all items by order field
        const sortedItems = [...lessons].sort((a, b) => (a.order || 0) - (b.order || 0));

        const flattened = [];
        let lessonCount = 0;
        let quizCount = 0;

        sortedItems.forEach((item, index) => {
            const cleanedItem = cleanLessonData(item);

            if (item.type === 'lesson') {
                lessonCount++;
                flattened.push({
                    ...cleanedItem,
                    lessonNumber: lessonCount,
                    flatIndex: index,
                    itemType: 'lesson',
                    displayTitle: cleanedItem.title?.[currentLanguage] || cleanedItem.title?.en || `Lesson ${lessonCount}`
                });
            } else if (item.type === 'quiz') {
                quizCount++;
                flattened.push({
                    ...cleanedItem,
                    lessonNumber: quizCount,
                    flatIndex: index,
                    itemType: 'quiz',
                    displayTitle: cleanedItem.title?.[currentLanguage] || cleanedItem.title?.en || `Quiz ${quizCount}`
                });
            }
        });

        console.log('✅ Organized Content:', {
            totalItems: flattened.length,
            lessons: lessonCount,
            quizzes: quizCount,
            items: flattened.map(item => ({
                order: item.order,
                type: item.itemType,
                title: item.displayTitle
            }))
        });

        return { hierarchical: [], flattened };
    };

    const toggleSidebar = () => {
        setSidebarShow(!sidebarShow);
    };

    const handleLessonClick = (flatIndex) => {
        const isAccessible = isItemAccessible(flatIndex);

        if (isAccessible) {
            setCurrentLessonIndex(flatIndex);
            if (isMobile) {
                setSidebarShow(false);
            }
        }
    };

    const isItemAccessible = (flatIndex) => {
        // First item is always accessible
        if (flatIndex === 0) return true;
        
        // Check if previous item is completed
        const previousIndex = flatIndex - 1;
        return completedLessons.includes(previousIndex) || flatIndex <= currentLessonIndex;
    };

    const getCurrentItem = () => {
        return flattenedItems[currentLessonIndex] || null;
    };

    const isLastItem = () => {
        return currentLessonIndex === flattenedItems.length - 1;
    };

    const handleNext = async () => {
        console.log('handleNext called', { 
            flattenedItemsLength: flattenedItems.length, 
            currentLessonIndex,
            isLastItem: isLastItem(),
            isReviewMode 
        });
        
        if (!flattenedItems.length) {
            console.log('No flattened items, returning');
            return;
        }

        const isLastItemNow = isLastItem();
        let nextIndex = currentLessonIndex;
        let statusToSave = isLastItemNow ? 'completed' : 'in-progress';

        // Mark current item as completed first
        const newCompletedLessons = [...new Set([...completedLessons, currentLessonIndex])];
        setCompletedLessons(newCompletedLessons);

        if (!isLastItemNow) {
            nextIndex = currentLessonIndex + 1;
            setCurrentLessonIndex(nextIndex);
            console.log('Moving to next item:', nextIndex);
        } else {
            // All items completed - show completion screen
            console.log('Last item completed, showing completion screen');
            setShowCompletion(true);
        }

        // In review mode, don't update database but still allow navigation
        if (!isReviewMode) {

            try {
                const currentProgress = userData.course_progress || [];

                const existingProgressIndex = currentProgress.findIndex(
                    progress => progress.course_id === selectedCourseId && progress.level_id === selectedLevelId
                );

                const progressData = {
                    course_id: selectedCourseId,
                    level_id: selectedLevelId,
                    currentLessonIndex: nextIndex,
                    completedLessons: newCompletedLessons,
                    status: statusToSave,
                    lastUpdated: new Date().toISOString()
                };

                let updatedProgress;
                if (existingProgressIndex >= 0) {
                    updatedProgress = [...currentProgress];
                    updatedProgress[existingProgressIndex] = progressData;
                } else {
                    updatedProgress = [...currentProgress, progressData];
                }

                await updateDocById('users', user.uid, {
                    course_progress: updatedProgress
                });

                await refreshUserData();
            } catch (error) {
                console.error('Error updating course progress in handleNext:', error);
            }
        }
    };

    const getLessonStatus = (lessonIndex) => {
        const isCompleted = completedLessons.includes(lessonIndex);
        const isCurrent = currentLessonIndex === lessonIndex;
        const isUnlocked = lessonIndex <= currentLessonIndex || completedLessons.includes(lessonIndex);

        return {
            isCompleted,
            isCurrent,
            isUnlocked
        };
    };

    useEffect(() => {
        loadCourseData();
    }, [selectedCourseId, selectedLevelId]);

    useEffect(() => {
        if (levelData && userData && selectedCourseId && selectedLevelId) {
            loadExistingProgress();
        }
    }, [levelData, userData, selectedCourseId, selectedLevelId]);

    useEffect(() => {
        if (flattenedItems.length > 0 && !isReviewMode) {
            const progress = (completedLessons.length / flattenedItems.length) * 100;

            if (completedLessons.length === flattenedItems.length) {
                setShowCompletion(true);
                updateProgressInDatabase('completed');
            }
        }
    }, [completedLessons, flattenedItems, isReviewMode]);

    const loadCourseData = async () => {
        try {
            setLoading(true);
            const selectedCourse = allCourses.find(
                (course) => course.id === selectedCourseId
            );

            setCourseData(selectedCourse);

            const selectedLevel = allCoursesLevels.find(
                (level) => level.courseId === selectedCourseId && level.id === selectedLevelId
            );

            setLevelData(selectedLevel);

            console.log('Loading course data:', {
                selectedCourseId,
                selectedLevelId,
                selectedLevel,
                lessons: selectedLevel?.lessons,
                lessonsCount: selectedLevel?.lessons?.length
            });

            // Organize lessons hierarchically
            if (selectedLevel?.lessons) {
                const { hierarchical, flattened } = organizeHierarchicalLessons(selectedLevel.lessons);
                setFlattenedItems(flattened);
                console.log('Organized lessons:', { 
                    originalLessons: selectedLevel.lessons,
                    hierarchical, 
                    flattened,
                    flattenedCount: flattened.length 
                });
            } else {
                console.log('No lessons found in selectedLevel');
                setFlattenedItems([]);
            }
        } catch (error) {
            console.error('Error loading course data:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadExistingProgress = () => {
        if (!userData?.course_progress || !levelData) return;

        console.log('Checking existing progress for:', selectedCourseId, selectedLevelId);
        console.log('User course_progress:', userData.course_progress);

        const existingProgress = userData.course_progress.find(
            progress => progress.course_id === selectedCourseId && progress.level_id === selectedLevelId
        );

        console.log('Found existing progress:', existingProgress);

        setCourseProgress(existingProgress);
        if (existingProgress) {
            setCurrentLessonIndex(existingProgress.currentLessonIndex || 0);
            setCompletedLessons(existingProgress.completedLessons || []);

            if (existingProgress.status === 'completed') {
                setIsReviewMode(true);
                setShowCompletion(true);
            }
        } else {
            console.log('No existing progress found, starting from beginning');
            setCurrentLessonIndex(0);
            setCompletedLessons([]);
        }
    };

    const autoEnrollInNextLevel = async (updatedProgress) => {
        try {
            // Find all levels for this course
            const courseLevels = allCoursesLevels
                .filter(level => level.courseId === selectedCourseId)
                .sort((a, b) => (a.level || 0) - (b.level || 0));
            
            // Find current level index
            const currentLevelIndex = courseLevels.findIndex(level => level.id === selectedLevelId);
            
            // Check if there's a next level
            if (currentLevelIndex >= 0 && currentLevelIndex < courseLevels.length - 1) {
                const nextLevel = courseLevels[currentLevelIndex + 1];
                
                // Check if next level is already enrolled/completed
                const existingNextLevelProgress = updatedProgress.find(
                    p => p.course_id === selectedCourseId && p.level_id === nextLevel.id
                );
                
                if (!existingNextLevelProgress) {
                    // Auto-enroll in next level
                    const nextLevelEnrollment = {
                        course_id: selectedCourseId,
                        level_id: nextLevel.id,
                        status: 'enrolled',
                        completedLessons: [],
                        enrolled_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    };
                    
                    updatedProgress.push(nextLevelEnrollment);
                }
            }
            
            // Save the updated progress (including current completed level + next level enrollment)
            await updateDocById('users', user.uid, {
                course_progress: updatedProgress
            });
            
        } catch (error) {
            console.error('Error auto-enrolling in next level:', error);
            // Fallback: just save the current progress
            await updateDocById('users', user.uid, {
                course_progress: updatedProgress
            });
        }
    };

    const updateProgressInDatabase = async (status = 'in-progress') => {
        if (!userData?.id || !user?.uid) return;

        try {
            const currentProgress = userData.course_progress || [];

            const existingProgressIndex = currentProgress.findIndex(
                progress => progress.course_id === selectedCourseId && progress.level_id === selectedLevelId
            );

            const progressData = {
                course_id: selectedCourseId,
                level_id: selectedLevelId,
                currentLessonIndex,
                completedLessons,
                status,
                lastUpdated: new Date().toISOString()
            };

            let updatedProgress;
            if (existingProgressIndex >= 0) {
                updatedProgress = [...currentProgress];
                updatedProgress[existingProgressIndex] = progressData;
            } else {
                updatedProgress = [...currentProgress, progressData];
            }

            // If completing a level, automatically enroll in next level
            if (status === 'completed') {
                await autoEnrollInNextLevel(updatedProgress);
            } else {
                await updateDocById('users', user.uid, {
                    course_progress: updatedProgress
                });
            }

            await refreshUserData();
        } catch (error) {
            console.error('Error updating course progress:', error);
        }
    };

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 992;
            setIsMobile(mobile);
            if (!mobile) {
                setSidebarShow(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sidebarShow && isMobile) {
                const sidebar = document.querySelector('.sidebar-col1');
                const menuButton = document.querySelector('.mobile-menu-toggle1');

                if (sidebar &&
                    !sidebar.contains(event.target) &&
                    !menuButton?.contains(event.target)) {
                    setSidebarShow(false);
                }
            }
        };

        if (sidebarShow && isMobile) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [sidebarShow, isMobile]);

    useEffect(() => {
        if (isMobile && sidebarShow) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMobile, sidebarShow]);

    const CompletionComponent = ({ onBack, onViewLessons, courseData, levelData, isRTL, currentLanguage }) => {
        return (
            <Card className={`lesson-card1 completion-card ${isRTL ? 'rtl' : 'ltr'}`}>
                <Card.Body className="text-center">
                    <div className="completion-icon mb-4">
                        <img
                            src="/assets/success-icon.png"
                            alt="Completion"
                            style={{ width: '80px', height: '80px' }}
                        />
                    </div>
                    <h2 className="completion-title mb-3">
                        {currentLanguage === 'ur' ? 'مبارک ہو!' : 'Congratulations!'}
                    </h2>
                    <p className="completion-message mb-4">
                        {currentLanguage === 'ur'
                            ? `آپ نے "Level ${levelData?.level}: ${levelData?.titles?.[currentLanguage]}" کامیابی سے مکمل کر لیا ہے!`
                            : `You have successfully completed "Level ${levelData?.level}: ${levelData?.titles?.[currentLanguage]}"!`
                        }
                    </p>
                    <div className="completion-stats mb-4">
                        <div className="stat-item">
                            <strong>{flattenedItems?.length || 0}</strong>
                            <div>{currentLanguage === 'ur' ? 'اقسام مکمل' : 'Items Completed'}</div>
                        </div>
                    </div>
                    <div className="completion-buttons d-flex gap-3 justify-content-center flex-wrap">
                        <Button
                            variant="outline-success"
                            className="completion-view-lessons-btn"
                            onClick={onViewLessons}
                        >
                            {currentLanguage === 'ur' ? 'اسباق دیکھیں' : 'View Lessons'}
                        </Button>
                        <Button
                            variant="success"
                            className="completion-back-btn"
                            onClick={onBack}
                        >
                            {currentLanguage === 'ur' ? 'واپس' : 'Go Back'}
                        </Button>
                    </div>
                </Card.Body>
            </Card>
        );
    };

    const QuizComponent = ({ quizData, onNext, onBack, isLastLesson, currentLanguage, isRTL }) => {
        const [selectedAnswer, setSelectedAnswer] = useState(null);
        const [showResult, setShowResult] = useState(false);
        const [hasSubmitted, setHasSubmitted] = useState(false);

        const handleAnswerSelect = (answerIndex) => {
            if (!hasSubmitted) {
                setSelectedAnswer(answerIndex);
            }
        };

        const handleSubmit = () => {
            if (selectedAnswer !== null) {
                setShowResult(true);
                setHasSubmitted(true);
            }
        };

        const handleNext = () => {
            onNext();
            setSelectedAnswer(null);
            setShowResult(false);
            setHasSubmitted(false);
        };

        const questionData = quizData.questions?.[0];
        const isCorrect = selectedAnswer === questionData?.correctAnswer;

        // Get explanation based on correct/incorrect answer
        const getExplanation = () => {
            if (!questionData?.explanation) return '';
            if (isCorrect) {
                return questionData.explanation.correct?.[currentLanguage] || questionData.explanation.correct?.en || '';
            } else {
                return questionData.explanation.incorrect?.[currentLanguage] || questionData.explanation.incorrect?.en || '';
            }
        };

        return (
            <div className="quiz-content-wrapper">
                <Card className={`lesson-card1 ${isRTL ? 'rtl' : 'ltr'}`}>
                    <Card.Body className="quiz-card-body">
                        {/* Quiz Header */}
                        <div className="quiz-header-section">
                            <span className="quiz-number-badge">{quizData.lessonNumber || '?'}</span>
                            <h2 className="quiz-title-text">
                                {quizData.title?.[currentLanguage] || quizData.title?.en || 'Quiz'}
                            </h2>
                        </div>

                        {/* Question Box */}
                        <div className="quiz-question-box">
                            <span className="question-icon">❓</span>
                            <p className="quiz-question-text">
                                {questionData?.question?.[currentLanguage] || questionData?.question?.en}
                            </p>
                        </div>

                        {/* Options */}
                        <div className="quiz-options-container">
                            {questionData?.options?.map((option, index) => (
                                <div
                                    key={index}
                                    className={`quiz-option-card ${selectedAnswer === index ? 'selected' : ''} ${hasSubmitted && selectedAnswer === index ? (isCorrect ? 'correct' : 'incorrect') : ''} ${hasSubmitted && index === questionData?.correctAnswer ? 'correct-answer' : ''}`}
                                    onClick={() => !hasSubmitted && handleAnswerSelect(index)}
                                >
                                    <div className={`option-radio ${selectedAnswer === index ? 'checked' : ''} ${hasSubmitted && selectedAnswer === index ? (isCorrect ? 'radio-correct' : 'radio-incorrect') : ''}`}>
                                        {selectedAnswer === index && <div className="radio-inner" />}
                                    </div>
                                    <span className="option-text">
                                        {option[currentLanguage] || option.en}
                                    </span>
                                    {hasSubmitted && index === questionData?.correctAnswer && (
                                        <span className="correct-badge">✓</span>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Result Box */}
                        {showResult && (
                            <div className={`quiz-result-box ${isCorrect ? 'result-correct' : 'result-incorrect'}`}>
                                <div className="result-icon">
                                    {isCorrect ? '🎉' : '💡'}
                                </div>
                                <div className="result-content">
                                    <div className="result-title">
                                        {isCorrect
                                            ? (currentLanguage === 'ur' ? 'بہت بہترین! درست!' : 'Great Job! Correct!')
                                            : (currentLanguage === 'ur' ? 'اوپس! غلط!' : 'Oops! Incorrect!')
                                        }
                                    </div>
                                    <div className="result-explanation">
                                        {getExplanation()}
                                    </div>
                                </div>
                            </div>
                        )}
                    </Card.Body>
                </Card>

                {/* Fixed Button at Bottom */}
                <div className="quiz-nav-fixed">
                    {!hasSubmitted && selectedAnswer !== null && (
                        <Button
                            onClick={handleSubmit}
                            className="quiz-submit-btn"
                            variant="success"
                        >
                            {currentLanguage === 'ur' ? 'جمع کریں' : 'Submit'}
                        </Button>
                    )}
                    {showResult && (
                        <Button
                            onClick={handleNext}
                            className="quiz-next-btn"
                            variant="success"
                        >
                            {currentLanguage === 'ur' ? 'اگلا' : 'Next'}
                            <span className="next-arrow">→</span>
                        </Button>
                    )}
                </div>
            </div>
        );
    };

    const renderLessonContent = () => {
        if (showCompletion) {
            return (
                <CompletionComponent
                    onBack={handleBack}
                    onViewLessons={handleViewLessons}
                    courseData={courseData}
                    levelData={levelData}
                    isRTL={isRTL}
                    currentLanguage={currentLanguage}
                />
            );
        }

        if (!levelData?.lessons || !flattenedItems || currentLessonIndex >= flattenedItems.length) {
            return (
                <Card className={`lesson-card1 ${isRTL ? 'rtl' : 'ltr'}`}>
                    <Card.Body>
                        <h2 className="lesson-main-title1">
                            {currentLanguage === 'ur' ? 'لیسن لوڈ ہو رہا ہے...' : 'Loading lesson...'}
                        </h2>
                        {process.env.NODE_ENV === 'development' && (
                            <p style={{ fontSize: '12px', color: 'red' }}>
                                Debug: currentLessonIndex={currentLessonIndex}, flattenedItems.length={flattenedItems?.length}, levelData.lessons.length={levelData?.lessons?.length}
                            </p>
                        )}
                    </Card.Body>
                </Card>
            );
        }

        const currentItem = getCurrentItem();

        if (currentItem?.type === 'quiz') {
            return (
                <QuizComponent
                    quizData={currentItem}
                    onNext={handleNext}
                    onBack={handleBack}
                    isLastLesson={isLastItem()}
                    currentLanguage={currentLanguage}
                    isRTL={isRTL}
                />
            );
        }
        
        if (!currentItem) {
            return <div>Loading content...</div>;
        }

        if (currentItem.type === 'lesson') {
            return (
                <div className="lesson-content-wrapper">
                    <Card className={`lesson-card1 ${isRTL ? 'rtl' : 'ltr'}`}>
                        <Card.Body className="lesson-card-body">
                            <div className="lesson-header-section">
                                <span className="lesson-number-badge">{currentItem.lessonNumber}</span>
                                <h2 className="lesson-title-text">
                                    {currentItem.title?.[currentLanguage] || currentItem.title?.en || currentItem.displayTitle}
                                </h2>
                            </div>

                            <div className="lesson-content-section">
                                <div className="lesson-text-content" style={{ whiteSpace: 'pre-wrap' }}>
                                    {currentItem.content?.[currentLanguage] || currentItem.content?.en}
                                </div>
                            </div>

                            {currentItem.analogy && (currentItem.analogy.en || currentItem.analogy.ur) && (
                                <div className="lesson-analogy-box">
                                    <div className="analogy-header">
                                        <span className="analogy-icon">💡</span>
                                        <span className="analogy-label">{currentLanguage === 'ur' ? 'مثال' : 'Analogy'}</span>
                                    </div>
                                    <div className="analogy-content" style={{ whiteSpace: 'pre-wrap' }}>
                                        {currentItem.analogy?.[currentLanguage] || currentItem.analogy?.en}
                                    </div>
                                </div>
                            )}
                        </Card.Body>
                    </Card>

                    <div className="lesson-nav-fixed">
                        <Button
                            onClick={handleNext}
                            className="lesson-next-btn"
                            variant="success"
                        >
                            {currentLanguage === 'ur' ? 'اگلا' : 'Next'}
                            <span className="next-arrow">→</span>
                        </Button>
                    </div>
                </div>
            );
        }

        return (
            <Card className={`lesson-card1 ${isRTL ? 'rtl' : 'ltr'}`}>
                <Card.Body>
                    <h2 className="lesson-main-title1">
                        {currentLanguage === 'ur' ? 'نامعلوم قسم کا سبق' : 'Unknown lesson type'}
                    </h2>
                </Card.Body>
            </Card>
        );
    };

    if (loading) {
        return (
            <div className={`course-lessons-page ${isRTL ? 'rtl' : 'ltr'}`}>
                <Header />
                <Container fluid className={`course-lessons-container1 ${isRTL ? 'rtl' : 'ltr'}`}>
                    <LoadingScreen />
                </Container>
            </div>
        );
    }


    return (
        <div className={`course-lessons-page ${isRTL ? 'rtl' : 'ltr'}`}>
            <Header />
            <Container fluid className={`course-lessons-container1 ${isRTL ? 'rtl' : 'ltr'}`}>
                <Row className="mobile-responsive">
                    {/* Mobile Menu Toggle */}
                    {isMobile && !sidebarShow && !showCompletion && (
                        <Button
                            variant="success"
                            className="mobile-menu-toggle1"
                            onClick={toggleSidebar}
                            aria-label={currentLanguage === 'ur' ? 'مینو ٹوگل' : 'Toggle Menu'}
                        >
                            <img
                                src={config.icons.menu}
                                alt={currentLanguage === 'ur' ? 'مینو' : 'Menu'}
                                style={{
                                    width: '16px',
                                    height: '16px',
                                    transform: isRTL ? 'scaleX(-1)' : 'none'
                                }}
                            />
                        </Button>
                    )}

                    {/* Sidebar Overlay for Mobile */}
                    {isMobile && (
                        <div
                            className={`sidebar-overlay1 ${sidebarShow ? 'show1' : ''}`}
                            onClick={() => setSidebarShow(false)}
                        />
                    )}

                    {/* Sidebar */}
                    {!showCompletion && (
                        <Col lg={3} md={4} className={`sidebar-col1 ${sidebarShow ? 'show1' : ''} ${isRTL ? 'rtl' : 'ltr'}`}>
                            <div className="sidebar1">
                                <div className={`sidebar-header1 ${isRTL ? 'rtl' : 'ltr'}`}>
                                    {/* Back Button */}
                                    <Button
                                        variant="link"
                                        className={`back-btn1 p-0 ${isRTL ? 'rtl' : 'ltr'}`}
                                        onClick={handleBack}
                                    >
                                        <img
                                            src={config.icons.arrowLeft}
                                            alt={currentLanguage === 'ur' ? 'واپس' : 'Back'}
                                            style={{
                                                width: isMobile ? '18px' : '24px',
                                                height: isMobile ? '18px' : '24px',
                                                transform: isRTL ? 'scaleX(-1)' : 'none',
                                                
                                            }}
                                        />
                                        <span className={`${isRTL ? 'me-2' : 'ms-2'} data-title1`}>
                                            {courseData?.titles?.[currentLanguage]}
                                        </span>
                                    </Button>

                                    {/* Course Header Card */}
                                    <Card className={`course-header-card1 ${isRTL ? 'rtl' : 'ltr'}`}>
                                        <div className={`course-header-content1 ${isRTL ? 'rtl-flex-reverse' : ''}`}>
                                            <div className="course-icon1">
                                                <img
                                                    src={config.icons.graduationCap}
                                                    alt={currentLanguage === 'ur' ? 'گریجویشن کیپ' : 'Graduation Cap'}
                                                    style={{ width: '22px', height: '22px' }}
                                                />
                                            </div>
                                            <div className={`course-info1 ${isRTL ? 'rtl' : 'ltr'}`}>
                                                <div className="course-level1">
                                                    {currentLanguage === 'ur' ? `لیول ${levelData?.level}` : `Level ${levelData?.level}`}
                                                </div>
                                                <div className="course-title1">
                                                    {levelData?.titles?.[currentLanguage]}
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </div>

                                <div className={`lessons-list1 ${isRTL ? 'rtl' : 'ltr'}`}>
                                    <ListGroup variant="flush">
                                        {flattenedItems.map((item, index) => {
                                            const isCompleted = completedLessons.includes(index);
                                            const isCurrent = index === currentLessonIndex;
                                            const isUnlocked = isItemAccessible(index);
                                            
                                            return (
                                                <ListGroup.Item
                                                    key={`${item.id}-${index}`}
                                                    className={`lesson-item1 ${isCurrent ? 'active1' : ''} ${isCompleted ? 'completed1' : ''} ${!isUnlocked ? 'locked1' : ''} ${isRTL ? 'rtl' : 'ltr'} ${item.itemType === 'quiz' ? 'quiz-item1' : ''}`}
                                                    onClick={() => isUnlocked && handleLessonClick(index)}
                                                    style={{
                                                        cursor: isUnlocked ? 'pointer' : 'not-allowed',
                                                        opacity: isUnlocked ? 1 : 0.6,
                                                    }}
                                                    role="button"
                                                    tabIndex={isUnlocked ? 0 : -1}
                                                >
                                                    <div className={`lesson-content1 ${isRTL ? 'rtl-flex-reverse' : ''}`}>
                                                        <div className="lesson-icon1">
                                                            {isCompleted ? (
                                                                <img
                                                                    src={config.icons.completed}
                                                                    alt={currentLanguage === 'ur' ? 'مکمل' : 'Completed'}
                                                                    className="checkbox-icon1"
                                                                />
                                                            ) : (
                                                                <img
                                                                    src={config.icons.notCompleted}
                                                                    alt={currentLanguage === 'ur' ? 'نامکمل' : 'Not Completed'}
                                                                    className="checkbox-icon1"
                                                                />
                                                            )}
                                                        </div>
                                                        <div className={`lesson-text1 ${isRTL ? 'rtl' : 'ltr'}`}>
                                                            <div className="lesson-title1">
                                                                <span className="lesson-number1">{item.lessonNumber}</span>
                                                                {item.title?.[currentLanguage] || item.title?.en || item.displayTitle}
                                                            </div>
                                                            <div className="lesson-subtitle1">
                                                                {item.itemType === 'lesson'
                                                                    ? (currentLanguage === 'ur' ? 'سبق' : 'Lesson')
                                                                    : (currentLanguage === 'ur' ? 'کوئز' : 'Quiz')
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                </ListGroup.Item>
                                            );
                                        })}
                                    </ListGroup>
                                </div>
                            </div>
                        </Col>
                    )}

                    {/* Main Content */}
                    <Col lg={showCompletion ? 12 : 9} md={showCompletion ? 12 : 8} className={`content-col1 ${isRTL ? 'rtl' : 'ltr'}`}>
                        <div className="main-content1">
                            {renderLessonContent()}
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default CourseLessons;