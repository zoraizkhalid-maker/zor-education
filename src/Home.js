import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal } from 'react-bootstrap';
import Header from './Header';
import Avatar from './components/Avatar';
import { useLanguage } from './LanguageContext';
import { useAuth } from './context/AuthContext';
import './styles/home.css';
import './styles/home1.css';
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { userData, allCourses, allCoursesLevels, enrollInCourse, isEnrolledInCourse } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [courses, setCourses] = useState([]);
  const [courseLevels, setCourseLevels] = useState([]);
  const [enrollmentModal, setEnrollmentModal] = useState({ show: false, courseId: null, courseName: '' });
  const [currentProgressIndex, setCurrentProgressIndex] = useState(0);
  const [showUpdatesModal, setShowUpdatesModal] = useState(false);
  const { t, isRTL, currentLanguage } = useLanguage();
  const navigate = useNavigate();

  // Latest updates content
  const latestUpdates = {
    version: "1.3.0",
    date: "November 2024",
    updates: {
      en: [
        "Sync Content Button: Click the refresh icon in the header to manually sync and download all courses, levels, and lessons for offline access",
        "Offline Learning: Access all your downloaded content even without internet connection",
        "Auto Sync: Content automatically syncs in the background when you're online",
        "Progress Tracking: Your learning progress is saved and synced across devices",
        "Storage Management: Downloaded content is stored locally on your device for quick access"
      ],
      ur: [
        "مواد کو ہم آہنگ کریں بٹن: ہیڈر میں ریفریش آئیکن پر کلک کریں تاکہ دستی طور پر تمام کورسز، لیولز اور اسباق کو آف لائن رسائی کے لیے ہم آہنگ اور ڈاؤن لوڈ کریں",
        "آف لائن سیکھنا: انٹرنیٹ کنکشن کے بغیر بھی اپنے تمام ڈاؤن لوڈ شدہ مواد تک رسائی حاصل کریں",
        "خودکار ہم آہنگی: جب آپ آن لائن ہوں تو مواد خودکار طور پر پس منظر میں ہم آہنگ ہوتا ہے",
        "پیشرفت کی نگرانی: آپ کی سیکھنے کی پیشرفت محفوظ ہے اور ڈیوائسز میں ہم آہنگ ہوتی ہے",
        "اسٹوریج مینجمنٹ: ڈاؤن لوڈ شدہ مواد تیز رسائی کے لیے آپ کی ڈیوائس پر مقامی طور پر محفوظ ہے"
      ]
    }
  };

  const getAllEnrolledCoursesProgress = () => {
    if (!userData?.course_progress || !courseLevels.length || !courses.length) {
      return [];
    }

    const progressByCourse = userData.course_progress.reduce((acc, progress) => {
      if (!acc[progress.course_id]) {
        acc[progress.course_id] = [];
      }
      acc[progress.course_id].push(progress);
      return acc;
    }, {});

    const allEnrolledCourses = [];

    for (const [courseId, progressEntries] of Object.entries(progressByCourse)) {
      const course = courses.find(c => c.id === courseId);
      if (!course) continue;

      const courseLevelsList = courseLevels
        .filter(level => level.courseId === courseId)
        .sort((a, b) => a.level - b.level);

      if (courseLevelsList.length === 0) continue;

      let selectedCourseData = null;

      // Check for in-progress courses first
      const inProgressEntry = progressEntries.find(progress => progress.status === 'in-progress');
      
      if (inProgressEntry) {
        const currentLevel = courseLevelsList.find(level => level.id === inProgressEntry.level_id);
        if (currentLevel) {
          const completedLevelsCount = progressEntries.filter(p => p.status === 'completed').length;
          
          selectedCourseData = {
            course,
            currentLevel,
            courseProgress: inProgressEntry,
            completedLevels: completedLevelsCount,
            totalLevels: courseLevelsList.length,
            isInProgress: true
          };
        }
      }

      // If no in-progress, check for enrolled courses (including completed ones)
      if (!selectedCourseData) {
        const enrolledEntry = progressEntries.find(progress => progress.status === 'enrolled');
        const completedEntries = progressEntries.filter(progress => progress.status === 'completed');
        const completedLevelsCount = completedEntries.length;
        
        // Debug course visibility logic
        console.log(`🔍 Course ${course.titles?.en} visibility check:`, {
          enrolledEntry: !!enrolledEntry,
          completedLevelsCount,
          totalLevels: courseLevelsList.length,
          shouldShow: enrolledEntry || completedLevelsCount > 0,
          isFullyCompleted: completedLevelsCount >= courseLevelsList.length,
          progressEntries: progressEntries.map(p => ({ level_id: p.level_id, status: p.status }))
        });
        
        // Show course if there's an enrolled entry OR if there are completed levels
        if (enrolledEntry || completedLevelsCount > 0) {
          let currentLevel;
          let courseProgress;
          let isCompleted = false;
          
          if (completedLevelsCount >= courseLevelsList.length) {
            // Course fully completed - show last level as current
            currentLevel = courseLevelsList[courseLevelsList.length - 1];
            courseProgress = completedEntries[completedEntries.length - 1];
            isCompleted = true;
          } else if (completedLevelsCount > 0) {
            // Some levels completed, show next available level
            currentLevel = courseLevelsList[completedLevelsCount];
            courseProgress = enrolledEntry || completedEntries[0];
          } else {
            // Just enrolled, show first level
            currentLevel = courseLevelsList[0];
            courseProgress = enrolledEntry;
          }
          
          if (currentLevel) {
            selectedCourseData = {
              course,
              currentLevel,
              courseProgress,
              completedLevels: completedLevelsCount,
              totalLevels: courseLevelsList.length,
              isInProgress: false,
              isCompleted
            };
          }
        }
      }

      if (selectedCourseData) {
        const levelProgress = selectedCourseData.isInProgress && selectedCourseData.courseProgress
          ? (selectedCourseData.currentLevel.lessons
              ? Math.round((selectedCourseData.courseProgress.completedLessons.length / selectedCourseData.currentLevel.lessons.length) * 100)
              : 0)
          : 0;

        const overallProgress = selectedCourseData.totalLevels > 0
          ? Math.min(100, Math.round((selectedCourseData.completedLevels / selectedCourseData.totalLevels) * 100))
          : 0;

        const courseData = {
          course: selectedCourseData.course,
          currentLevel: selectedCourseData.currentLevel,
          levelProgress,
          overallProgress,
          completedLevels: selectedCourseData.completedLevels,
          totalLevels: selectedCourseData.totalLevels,
          courseProgress: selectedCourseData.courseProgress,
          isInProgress: selectedCourseData.isInProgress,
          isCompleted: selectedCourseData.isCompleted || false
        };
        
        console.log(`📊 Adding course to progress list:`, {
          courseName: course.titles?.en,
          overallProgress: overallProgress,
          completedLevels: selectedCourseData.completedLevels,
          totalLevels: selectedCourseData.totalLevels,
          isCompleted: selectedCourseData.isCompleted || false
        });
        
        allEnrolledCourses.push(courseData);
      }
    }

    return allEnrolledCourses;
  };

  const getCurrentProgressData = () => {
    const allEnrolled = getAllEnrolledCoursesProgress();
    return allEnrolled.length > 0 ? allEnrolled[currentProgressIndex] : null;
  };

  const getCompletedCoursesCount = () => {
    if (!userData?.course_progress || !courseLevels.length) {
      return 0;
    }

    const courseIds = [...new Set(userData.course_progress.map(p => p.course_id))];
    let completedCoursesCount = 0;

    courseIds.forEach(courseId => {
      const courseLevelsList = courseLevels.filter(level => level.courseId === courseId);
      const courseProgressEntries = userData.course_progress.filter(p => p.course_id === courseId);
      const completedLevelsCount = courseProgressEntries.filter(p => p.status === 'completed').length;

      if (completedLevelsCount === courseLevelsList.length && courseLevelsList.length > 0) {
        completedCoursesCount++;
      }
    });

    return completedCoursesCount;
  };

  const hasProgressForCourse = (courseId) => {
    return userData?.course_progress?.some(progress => progress.course_id === courseId) || false;
  };

  const handleEnrollClick = async (courseId, courseName) => {
    const result = await enrollInCourse(courseId);
    if (result.success) {
      // Enrollment successful - the progress box will update automatically due to userData change
    }
  };

  const handleCourseClick = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    const courseName = getDisplayTitle(course);
    
    if (!isEnrolledInCourse(courseId)) {
      setEnrollmentModal({ show: true, courseId, courseName });
    } else {
      navigate("/course-levels", { state: { selectedCourseId: courseId } });
    }
  };

  const navigateProgressCourse = (direction) => {
    const allEnrolled = getAllEnrolledCoursesProgress();
    if (direction === 'next' && currentProgressIndex < allEnrolled.length - 1) {
      setCurrentProgressIndex(currentProgressIndex + 1);
    } else if (direction === 'prev' && currentProgressIndex > 0) {
      setCurrentProgressIndex(currentProgressIndex - 1);
    }
  };

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    setCourses(allCourses);
    setCourseLevels(allCoursesLevels);
  }, []);

  // Show updates modal on login
  useEffect(() => {
    if (userData) {
      const lastSeenVersion = localStorage.getItem('zor_last_seen_update_version');
      const currentVersion = latestUpdates.version;

      // Show modal if it's a new version or first time
      if (lastSeenVersion !== currentVersion) {
        // Delay showing modal slightly for better UX
        setTimeout(() => {
          setShowUpdatesModal(true);
        }, 1000);
      }
    }
  }, [userData]);

  const handleCloseUpdatesModal = () => {
    setShowUpdatesModal(false);
    // Save the version so modal doesn't show again for this version
    localStorage.setItem('zor_last_seen_update_version', latestUpdates.version);
  };

  const getDisplayTitle = (item) => {
    if (item.titles && typeof item.titles === "object") {
      return (
        item.titles[currentLanguage] || item.titles.en || item.titles.ur || ""
      );
    }
    return "";
  };

  const getCourseLevelCount = (courseId) => {
    return courseLevels.filter(level => level.courseId === courseId).length;
  };

  const itemsPerSlide = isMobile ? 1 : 4;
  const totalSlides = Math.ceil(courses.length / itemsPerSlide);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const getCurrentCourses = () => {
    const startIndex = currentSlide * itemsPerSlide;
    return courses.slice(startIndex, startIndex + itemsPerSlide);
  };

  const handleContinue = () => {
    const progressData = getCurrentProgressData();
    if (progressData) {
      navigate("/course-lessons", {
        state: {
          selectedCourseId: progressData.course.id,
          selectedLevelId: progressData.currentLevel.id
        }
      });
    }
  };

  const handleViewAllLevels = () => {
    const progressData = getCurrentProgressData();
    if (progressData) {
      navigate("/course-levels", {
        state: {
          selectedCourseId: progressData.course.id
        }
      });
    }
  };

  const handleViewAllClick = () => {
    navigate("/explore-courses");
  };


  const currentProgressData = getCurrentProgressData();
  const completedCoursesCount = getCompletedCoursesCount();

  return (
    <>
      <Header />

      <div className="background-section-home" style={{
        backgroundImage: 'url("./assets/overlay.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        top: 0,
        left: 0,
        width: '100%',
        height: '21vh',
        zIndex: -1
      }}>
      </div>

      <div className={`cards-overlay-section-home ${isRTL ? 'rtl' : 'ltr'}`}>
        <Container>
          <Row className="justify-content-center align-items-stretch">
            <Col xs={12} lg={10} xl={12}>
              <Row className="g-4 h-100">
                <Col xs={12} md={4}>
                  <Card className={`profile-card-home ${isRTL ? 'rtl' : 'ltr'} h-100`}>
                    <Card.Body className="text-center d-flex flex-column justify-content-center">
                      <div className="profile-image-wrapper-home">
                        <Avatar
                          name={userData?.full_name || userData?.first_name || userData?.display_name || t('profileName')}
                          profilePic={userData?.profile_pic}
                          size={80}
                          className=""
                        />
                      </div>
                      <h4 className="profile-name-home">
                        {userData?.full_name || userData?.first_name || t('profileName')}
                      </h4>
                      <p className="profile-email-home">
                        {userData?.email || t('profileEmail')}
                      </p>

                      <div className={`course-completed-info-home ${isRTL ? '' : 'ltr-flex-normal'}`}>
                        <div className="completion-icon-home">
                          <img src="/assets/2.png" alt="icon" width="16" height="16" />
                        </div>
                        <span className="completion-text-home">
                          {t('courseCompleted')} <strong>{completedCoursesCount}</strong>
                        </span>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>

                <Col xs={12} md={8}>
                  {currentProgressData ? (
                    <Card className={`progress-card-home ${isRTL ? 'rtl' : 'ltr'} h-100`}>
                      <Card.Body>
                        <Row>
                          <Col xs={12} lg={7}>
                            <div className="progress-content-home">
                              <div className={`progress-header ${isRTL ? 'rtl-flex-reverse' : ''}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                <div>
                                  <h3 className="progress-title-home">{t('yourCourseProgress')}</h3>
                                  <p className="progress-subtitle-home">
                                    {t('trackProgressSubtitle')}
                                  </p>
                                </div>
                                {(() => {
                                  const allEnrolled = getAllEnrolledCoursesProgress();
                                  return allEnrolled.length > 1 && (
                                    <div className={`course-navigation ${isRTL ? 'rtl-flex-reverse' : ''}`} style={{ display: 'flex', gap: '8px' }}>
                                      <button
                                        onClick={() => navigateProgressCourse('prev')}
                                        disabled={currentProgressIndex === 0}
                                        className={`nav-btn ${currentProgressIndex === 0 ? 'disabled' : ''}`}
                                        style={{
                                          background: 'transparent',
                                          border: '1px solid #ddd',
                                          borderRadius: '6px',
                                          padding: '6px 8px',
                                          cursor: currentProgressIndex === 0 ? 'not-allowed' : 'pointer',
                                          opacity: currentProgressIndex === 0 ? 0.5 : 1
                                        }}
                                      >
                                        <img
                                          src="/assets/prev.png"
                                          alt="Previous"
                                          width="16"
                                          height="16"
                                          style={{ transform: isRTL ? 'scaleX(-1)' : 'none' }}
                                        />
                                      </button>
                                      <button
                                        onClick={() => navigateProgressCourse('next')}
                                        disabled={currentProgressIndex === allEnrolled.length - 1}
                                        className={`nav-btn ${currentProgressIndex === allEnrolled.length - 1 ? 'disabled' : ''}`}
                                        style={{
                                          background: 'transparent',
                                          border: '1px solid #ddd',
                                          borderRadius: '6px',
                                          padding: '6px 8px',
                                          cursor: currentProgressIndex === allEnrolled.length - 1 ? 'not-allowed' : 'pointer',
                                          opacity: currentProgressIndex === allEnrolled.length - 1 ? 0.5 : 1
                                        }}
                                      >
                                        <img
                                          src="/assets/next.png"
                                          alt="Next"
                                          width="16"
                                          height="16"
                                          style={{ transform: isRTL ? 'scaleX(-1)' : 'none' }}
                                        />
                                      </button>
                                    </div>
                                  );
                                })()}
                              </div>

                              <div className="course-info-home">
                                <div className={`course-header-home ${isRTL ? 'rtl-flex-reverse' : ''}`}>
                                  <div className="course-icon-home">
                                    <img
                                      src={currentProgressData.course.image || "/assets/cap.png"}
                                      alt="icon"
                                      width="24"
                                      height="24"
                                      style={{ borderRadius: '4px' }}
                                    />
                                  </div>
                                  <div className="course-details-home">
                                    <h5 className="course-name-home">
                                      {getDisplayTitle(currentProgressData.course)}
                                    </h5>
                                    <p className="course-levels-home">
                                      {currentProgressData.completedLevels}/{currentProgressData.totalLevels} {t('levelsCompleted')}
                                    </p>
                                  </div>
                                </div>

                                <div className="current-level-home">
                                  <h6 className="level-title-home">
                                    {currentLanguage === 'ur' ? 'لیول' : 'Level'} {currentProgressData.currentLevel.level}: {getDisplayTitle(currentProgressData.currentLevel)}
                                  </h6>
                                  <p className="milestone-text-home">
                                    {currentProgressData.isInProgress ? (
                                      // Level is in progress - show remaining lessons
                                      currentLanguage === 'ur'
                                        ? `اگلا مرحلہ: ${(currentProgressData.currentLevel.lessons?.length || 0) - (currentProgressData.courseProgress.completedLessons?.length || 0)} اسباق باقی`
                                        : `Next milestone: ${(currentProgressData.currentLevel.lessons?.length || 0) - (currentProgressData.courseProgress.completedLessons?.length || 0)} lessons left`
                                    ) : (
                                      // Level hasn't been started yet
                                      currentLanguage === 'ur'
                                        ? `نیا لیول: ${currentProgressData.currentLevel.lessons?.length || 0} اسباق شروع کرنے کے لیے`
                                        : `New level: ${currentProgressData.currentLevel.lessons?.length || 0} lessons to start`
                                    )}
                                  </p>
                                  <p className="encouragement-text-home">
                                    {currentLanguage === 'ur'
                                      ? 'بہترین پیش قدمی! آپ بنیادی باتیں سیکھ رہے ہیں۔'
                                      : 'Great progress! You\'re mastering the fundamentals.'
                                    }
                                  </p>
                                </div>

                                <div className={`action-buttons-home ${isRTL ? 'rtl-flex-reverse' : ''}`}>
                                  <Button className="continue-course-btn-home" onClick={handleContinue}>
                                    {t('continueCourse')}
                                  </Button>
                                  <Button variant="outline-secondary" className="view-levels-btn-home" onClick={handleViewAllLevels}>
                                    {t('viewAllLevels')}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </Col>
                          <Col xs={12} lg={5}>
                            <div className="progress-circle-container-home">
                              <div className="progress-circle-home">
                                <svg className="progress-ring-home" width="190" height="190">
                                  <circle
                                    className="progress-ring-background-home"
                                    stroke="#F0F0F0"
                                    strokeWidth="12"
                                    fill="transparent"
                                    r="83"
                                    cx="95"
                                    cy="95"
                                  />
                                  <circle
                                    className="progress-ring-progress-home"
                                    stroke="#78BF52"
                                    strokeWidth="12"
                                    fill="transparent"
                                    r="83"
                                    cx="95"
                                    cy="95"
                                    strokeDasharray="521.5"
                                    strokeDashoffset={521.5 - (521.5 * currentProgressData.overallProgress) / 100}
                                    strokeLinecap="round"
                                  />
                                </svg>
                                <div className="progress-text-home">
                                  <div className="progress-percentage-home">{currentProgressData.overallProgress}%</div>
                                  <div className="progress-label-home">{t('courseCompletedLabel')}</div>
                                </div>
                              </div>
                            </div>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  ) : (
                    <Card className="progress-card-home1">
                      <div
                        className="progress-card-background1"
                        style={{
                          backgroundImage: 'url("/assets/20.png")',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat',
                          borderRadius: '12px', 
                        }}
                      >
                        <Card.Body>
                          <div className="progress-content-home1">
                            <div className="no-course-container-home1">
                              <div className="course-book-icon-home1">
                                <img src="/assets/21.png" alt="Course Book" width="124" height="114" />
                              </div>
                              <h3 className="no-course-title-home1">
                                {t('noCourseEnrolled')}
                              </h3>
                              <p className="no-course-subtitle-home1">
                                {t('noCourseSubtitle')}
                              </p>
                              <Button className="browse-courses-btn-home1" onClick={handleViewAllClick}>
                                {t('browseCourses')}
                              </Button>
                            </div>
                          </div>
                        </Card.Body>
                      </div>
                    </Card>
                  )}
                </Col>
              </Row>
            </Col>
          </Row>
        </Container>
      </div>

      <div className={`explore-courses-section-home ${isRTL ? 'rtl' : 'ltr'}`}>
        <Container>
          <div className={`section-header-home ${isRTL ? 'rtl-flex-reverse' : ''}`}>
            <h2 className="section-title-home">{t('exploreCourses')}</h2>
            <div className={`section-controls-home ${isRTL ? 'rtl-flex-reverse' : ''}`}>
              <button
                className="view-all-btn-home"
                onClick={handleViewAllClick}
              >
                {t('viewAll')}
              </button>
              <div className={`slider-controls-home ${isRTL ? 'rtl-flex-reverse' : ''}`}>
                <button
                  className={`slider-btn-home prev-btn-home ${currentSlide === 0 ? 'disabled' : ''}`}
                  onClick={prevSlide}
                  disabled={currentSlide === 0}
                  aria-label={t('previous')}
                >
                  <img
                    src="/assets/prev.png"
                    alt={t('previous')}
                    width="20"
                    height="20"
                    style={{ transform: isRTL ? 'scaleX(-1)' : 'none' }}
                  />
                </button>
                <button
                  className={`slider-btn-home next-btn-home ${currentSlide === totalSlides - 1 ? 'disabled' : ''}`}
                  onClick={nextSlide}
                  disabled={currentSlide === totalSlides - 1}
                  aria-label={t('next')}
                >
                  <img
                    src="/assets/next.png"
                    alt={t('next')}
                    width="20"
                    height="20"
                    style={{ transform: isRTL ? 'scaleX(-1)' : 'none' }}
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="courses-slider-home">
            {isMobile ? (
              <div className="courses-container-mobile-home">
                {getCurrentCourses().map((course, index) => (
                  <div key={course.id} className="mobile-course-slide">
                    <Card
                      className={`course-card-home ${isRTL ? 'rtl' : 'ltr'}`}
                      onClick={() => handleCourseClick(course.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="course-image-container-home">
                        <div
                          className="course-image-home"
                          style={{ backgroundImage: `url("${course.image || '/assets/cap.png'}")`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                        >
                        </div>
                      </div>
                      <Card.Body className="course-content-home">
                        <h5 className="course-card-title-home">{getDisplayTitle(course)}</h5>
                        <p className="course-number-home">
                          {t('courseNumber')} #{course.courseNumber || String(courses.findIndex(c => c.id === course.id) + 1).padStart(4, '0')}
                        </p>
                        <div className={`course-lessons-home ${isRTL ? 'rtl-flex-reverse' : ''}`}>
                          <img
                            src="/assets/8.png"
                            alt="Lessons Icon"
                            width="14"
                            height="14"
                            className="lessons-icon-home"
                          />
                          <span className="lessons-text-home">
                            {getCourseLevelCount(course.id)} {t('lessons')}
                          </span>
                        </div>

                        {!isEnrolledInCourse(course.id) && (
                          <Button
                            className="enroll-btn-home"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEnrollClick(course.id, getDisplayTitle(course));
                            }}
                            style={{
                              fontSize: '14px',
                              marginTop: '10px',
                              padding: '8px 14px',
                              backgroundColor: '#78BF52',
                              border: 'none',
                              borderRadius: '12px',
                              color: '#ffffff'
                            }}
                          >
                            {t('EnrollNow')}
                          </Button>
                        )}
                      </Card.Body>
                    </Card>
                  </div>
                ))}
              </div>
            ) : (
              <div className="courses-container-home">
                <Row className="g-4">
                  {getCurrentCourses().map((course, index) => (
                    <Col xs={12} sm={6} md={4} lg={3} key={course.id}>
                      <Card
                        className={`course-card-home ${isRTL ? 'rtl' : 'ltr'}`}
                        onClick={() => handleCourseClick(course.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="course-image-container-home">
                          <div
                            className="course-image-home"
                            style={{ backgroundImage: `url("${course.image || '/assets/cap.png'}")`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                          >
                          </div>
                        </div>
                        <Card.Body className="course-content-home">
                          <h5 className="course-card-title-home">{getDisplayTitle(course)}</h5>
                          <p className="course-number-home">
                            {t('courseNumber')} #{course.courseNumber || String(courses.findIndex(c => c.id === course.id) + 1).padStart(4, '0')}
                          </p>
                          <div className={`course-lessons-home ${isRTL ? 'rtl-flex-reverse' : ''}`}>
                            <img
                              src="/assets/8.png"
                              alt="Lessons Icon"
                              width="14"
                              height="14"
                              className="lessons-icon-home"
                            />
                            <span className="lessons-text-home">
                              {getCourseLevelCount(course.id)} {t('lessons')}
                            </span>
                          </div>

                          {!isEnrolledInCourse(course.id) && (
                            <Button
                              className="enroll-btn-home"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEnrollClick(course.id, getDisplayTitle(course));
                              }}
                              style={{
                                fontSize: '14px',
                                marginTop: '10px',
                                padding: '8px 14px',
                                backgroundColor: '#78BF52',
                                border: 'none',
                                borderRadius: '12px',
                                color: '#ffffff'
                              }}
                            >
                              {t('EnrollNow')}
                            </Button>
                          )}
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </div>
            )}
          </div>
        </Container>
      </div>

      {/* Enrollment Modal */}
      <Modal 
        show={enrollmentModal.show} 
        onHide={() => setEnrollmentModal({ show: false, courseId: null, courseName: '' })}
        centered
      >
        <Modal.Header closeButton className={isRTL ? 'rtl' : 'ltr'}>
          <Modal.Title>{t('courseEnrollment')}</Modal.Title>
        </Modal.Header>
        <Modal.Body className={`text-center ${isRTL ? 'rtl' : 'ltr'}`}>
          <div style={{ padding: '20px 0' }}>
            <img 
              src="/assets/cap.png" 
              alt="Course" 
              width="80" 
              height="80" 
              style={{ marginBottom: '20px' }}
            />
            <h5 style={{ marginBottom: '15px' }}>
              {enrollmentModal.courseName}
            </h5>
            <p style={{ color: '#666', marginBottom: '25px' }}>
              {currentLanguage === 'ur' 
                ? 'اس کورس میں شروع کرنے کے لیے پہلے داخلہ لیں۔' 
                : 'Please enroll in this course before starting.'
              }
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer className={`justify-content-center ${isRTL ? 'rtl' : 'ltr'}`}>
          <Button 
            variant="secondary" 
            onClick={() => setEnrollmentModal({ show: false, courseId: null, courseName: '' })}
            style={{ marginRight: isRTL ? '0' : '10px', marginLeft: isRTL ? '10px' : '0' }}
          >
            {t('cancel')}
          </Button>
          <Button 
            style={{ 
              backgroundColor: '#78BF52', 
              border: 'none',
              marginLeft: isRTL ? '0' : '10px', 
              marginRight: isRTL ? '10px' : '0' 
            }}
            onClick={async () => {
              const result = await enrollInCourse(enrollmentModal.courseId);
              if (result.success) {
                setEnrollmentModal({ show: false, courseId: null, courseName: '' });
                // Navigate to course levels after successful enrollment
                navigate("/course-levels", { state: { selectedCourseId: enrollmentModal.courseId } });
              }
            }}
          >
            {t('EnrollNow')}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Latest Updates Modal */}
      <Modal
        show={showUpdatesModal}
        onHide={handleCloseUpdatesModal}
        centered
        size="lg"
      >
        <Modal.Header closeButton className={isRTL ? 'rtl' : 'ltr'}>
          <Modal.Title style={{
            fontSize: '24px',
            fontWeight: '600'
          }}>
            {currentLanguage === 'ur' ? 'تازہ ترین اپ ڈیٹس' : 'Latest Updates'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className={`${isRTL ? 'rtl' : 'ltr'}`}>
          <div style={{ padding: '10px 0' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              paddingBottom: '15px',
              borderBottom: '2px solid #f0f0f0'
            }}>
              <div>
                <h5 style={{ margin: 0, color: '#78BF52', fontWeight: '600' }}>
                  {currentLanguage === 'ur' ? 'ورژن' : 'Version'} {latestUpdates.version}
                </h5>
                <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                  {latestUpdates.date}
                </p>
              </div>
            </div>

            <h6 style={{
              fontWeight: '600',
              marginBottom: '15px',
              color: '#333'
            }}>
              {currentLanguage === 'ur' ? 'نیا کیا ہے:' : "What's New:"}
            </h6>

            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0
            }}>
              {latestUpdates.updates[currentLanguage].map((update, index) => (
                <li key={index} style={{
                  padding: '12px 15px',
                  marginBottom: '10px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  borderLeft: '4px solid #78BF52',
                  fontSize: '15px',
                  lineHeight: '1.6',
                  transition: 'transform 0.2s',
                  cursor: 'default'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(5px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
                >
                  {update}
                </li>
              ))}
            </ul>

            <div style={{
              marginTop: '25px',
              padding: '15px',
              backgroundColor: '#e8f5e9',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <p style={{
                margin: 0,
                fontSize: '14px',
                color: '#2e7d32',
                fontWeight: '500'
              }}>
                {currentLanguage === 'ur'
                  ? 'ZOR استعمال کرنے کا شکریہ! ہم مسلسل بہتری لا رہے ہیں۔'
                  : 'Thank you for using ZOR! We are continuously improving.'}
              </p>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className={`justify-content-center ${isRTL ? 'rtl' : 'ltr'}`}>
          <Button
            style={{
              backgroundColor: '#78BF52',
              border: 'none',
              padding: '10px 30px',
              fontSize: '16px',
              fontWeight: '500'
            }}
            onClick={handleCloseUpdatesModal}
          >
            {currentLanguage === 'ur' ? 'سمجھ گیا' : 'Got it!'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Home;