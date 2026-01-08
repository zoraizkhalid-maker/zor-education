import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/courselevel.css';
import Header from './Header';
import { useLanguage } from './LanguageContext';
import { useAuth } from './context/AuthContext';
import { LoadingScreen } from './Loading';

const CourseLevel = () => {
  const location = useLocation();
  const { selectedCourseId } = location.state || {};

  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();

  const { userData, allCourses, allCoursesLevels, isEnrolledInCourse, enrollInCourse } = useAuth();
  const [courseData, setCourseData] = useState(null);
  const [courseLevels, setCourseLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEnrollmentMessage, setShowEnrollmentMessage] = useState(false);

  useEffect(() => {
    loadCourseData();
  }, [selectedCourseId]);

  const loadCourseData = async () => {
    try {
      setLoading(true);

      const selectedCourse = allCourses.find(
        (course) => course.id === selectedCourseId
      );

      setCourseData(selectedCourse);

      // Check if user is enrolled in this course
      if (selectedCourseId && !isEnrolledInCourse(selectedCourseId)) {
        setShowEnrollmentMessage(true);
        setLoading(false);
        return;
      }

      const courseLevels = allCoursesLevels
        .filter((level) => level.courseId === selectedCourseId)
        .sort((a, b) => (a.level || 0) - (b.level || 0));

      setCourseLevels(courseLevels);
      
      // Debug: Log course levels data to understand subtitle field structure
      console.log('🔍 Course Levels Data for Subtitle Debug:', courseLevels);
      courseLevels.forEach((level, index) => {
        console.log(`📋 Level ${index + 1} Data:`, {
          id: level.id,
          title: level.titles,
          subtitles: level.subtitles,
          descriptions: level.descriptions,
          subtitle: level.subtitle,
          description: level.description,
          level_description: level.level_description,
          allKeys: Object.keys(level)
        });
      });
    } catch (error) {
      console.error('Error loading course data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLevelStatus = (levelId, levelIndex) => {
    console.log('Getting status for level:', levelId, 'at index:', levelIndex);
    console.log('User course_progress:', userData?.course_progress);

    // Get all progress entries for this course
    const courseProgressEntries = userData?.course_progress?.filter(
      progress => progress.course_id === selectedCourseId
    ) || [];

    console.log('Found course progress entries:', courseProgressEntries);

    // If no progress exists for this course
    if (courseProgressEntries.length === 0) {
      // First level is "enrolled" (viewable), all others are locked
      if (levelIndex === 0) {
        console.log('No progress found, first level is enrolled');
        return 'enrolled';
      } else {
        console.log('No progress found, other levels are locked');
        return 'locked';
      }
    }

    // Check if this specific level has progress
    const levelProgress = courseProgressEntries.find(
      progress => progress.level_id === levelId
    );

    if (levelProgress) {
      console.log('Found progress for this level:', levelProgress);
      // Return the actual status from the progress
      return levelProgress.status === 'completed' ? 'completed' : 'in-progress';
    }

    // This level doesn't have progress, check if previous levels are completed
    // Count how many levels before this one are completed
    let completedLevelsCount = 0;

    for (let i = 0; i < levelIndex; i++) {
      const prevLevelId = courseLevels[i]?.id;
      const prevLevelProgress = courseProgressEntries.find(
        progress => progress.level_id === prevLevelId
      );

      if (prevLevelProgress?.status === 'completed') {
        completedLevelsCount++;
      }
    }

    console.log('Completed levels before this one:', completedLevelsCount, 'out of', levelIndex);

    // If all previous levels are completed, this level is unlocked (in-progress)
    if (completedLevelsCount === levelIndex) {
      console.log('All previous levels completed, this level is in-progress');
      return 'in-progress';
    }

    // Otherwise, this level is locked
    console.log('Not all previous levels completed, this level is locked');
    return 'locked';
  };

  const handleNavigation = (levelId, status) => {
    if (status !== 'locked') {
      navigate("/course-lessons", { state: { selectedCourseId: selectedCourseId, selectedLevelId: levelId } });
    }
  };

  const handleBackNavigation = () => {
    navigate("/home");
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <span className={`status-badge completed ${isRTL ? 'rtl' : 'ltr'}`}>
            <span className="status-dot">●</span> {t('completed')}
          </span>
        );
      case 'in-progress':
        return (
          <span className={`status-badge in-progress ${isRTL ? 'rtl' : 'ltr'}`}>
            <span className="status-dot">●</span> {t('inProgress')}
          </span>
        );
      case 'enrolled':
        return (
          <span className={`status-badge enrolled ${isRTL ? 'rtl' : 'ltr'}`}>
            <span className="status-dot">●</span> {isRTL ? 'داخل' : 'Enrolled'}
          </span>
        );
      case 'locked':
        return (
          <span className={`status-badge locked ${isRTL ? 'rtl' : 'ltr'}`}>
            <img src="/assets/22.png" alt="Locked" className="lock-icon" />
            {t('locked')}
          </span>
        );
      default:
        return null;
    }
  };

  const getLevelBadge = (level) => {
    return <span className={`level-badge level-${level} ${isRTL ? 'rtl' : 'ltr'}`}>{t('level')} {level}</span>;
  };

  const getViewButton = (levelId, status) => {
    const isDisabled = status === 'locked';
    return (
      <button
        className={`view-btn ${isDisabled ? 'disabled' : ''} ${isRTL ? 'rtl' : 'ltr'}`}
        disabled={isDisabled}
        onClick={() => handleNavigation(levelId, status)}
      >
        {t('view')}
      </button>
    );
  };

  if (loading) {
    return (
      <div className={`CourseLevel-page ${isRTL ? 'rtl' : 'ltr'}`}>
        <Header />
        <Container className={`cs-structure-container ${isRTL ? 'rtl' : 'ltr'}`}>
          <LoadingScreen />
        </Container>
      </div>
    );
  }

  // Show enrollment message if user is not enrolled
  if (showEnrollmentMessage) {
    const getDisplayTitle = (item) => {
      if (item?.titles && typeof item.titles === "object") {
        const currentLanguage = isRTL ? 'ur' : 'en';
        return item.titles[currentLanguage] || item.titles.en || item.titles.ur || "";
      }
      return "";
    };

    return (
      <div className={`CourseLevel-page ${isRTL ? 'rtl' : 'ltr'}`}>
        <Header />
        <Container className={`cs-structure-container ${isRTL ? 'rtl' : 'ltr'}`}>
          <div className="text-center py-5">
            <Card style={{ maxWidth: '500px', margin: '0 auto', border: '1px solid #ddd', borderRadius: '12px' }}>
              <Card.Body className="p-4">
                <div style={{ marginBottom: '20px' }}>
                  <img 
                    src="/assets/cap.png" 
                    alt="Course" 
                    width="80" 
                    height="80" 
                    style={{ marginBottom: '20px' }}
                  />
                </div>
                <h4 style={{ marginBottom: '15px', color: '#333' }}>
                  {getDisplayTitle(courseData)}
                </h4>
                <p style={{ color: '#666', marginBottom: '25px', fontSize: '16px' }}>
                  {isRTL 
                    ? 'اس کورس میں شروع کرنے کے لیے پہلے داخلہ لیں۔' 
                    : 'Please enroll in this course before accessing the levels.'
                  }
                </p>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  <Button 
                    variant="secondary" 
                    onClick={() => navigate(-1)}
                    style={{ padding: '10px 20px' }}
                  >
                    {t('back')}
                  </Button>
                  <Button 
                    onClick={async () => {
                      const result = await enrollInCourse(selectedCourseId);
                      if (result.success) {
                        setShowEnrollmentMessage(false);
                        loadCourseData();
                      }
                    }}
                    style={{ 
                      backgroundColor: '#78BF52', 
                      border: 'none',
                      padding: '10px 20px'
                    }}
                  >
                    {t('EnrollNow')}
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </div>
        </Container>
      </div>
    );
  }

  if (!courseData || !courseLevels.length) {
    return (
      <div className={`CourseLevel-page ${isRTL ? 'rtl' : 'ltr'}`}>
        <Header />
        <Container className={`cs-structure-container ${isRTL ? 'rtl' : 'ltr'}`}>
          <div className="text-center py-5">
            <p>{t('noDataFound') || 'No course data found'}</p>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className={`CourseLevel-page ${isRTL ? 'rtl' : 'ltr'}`}>
      <Header />
      <Container className={`cs-structure-container ${isRTL ? 'rtl' : 'ltr'}`}>
        <div className={`header-section ${isRTL ? 'rtl' : 'ltr'}`}>
          <div
            className={`back-arrow ${isRTL ? 'rtl' : 'ltr'}`}
            onClick={handleBackNavigation}
          >
            <img
              src="/assets/back.png"
              alt={t('back')}
              className="back-arrow-img"
            />
          </div>
          <h1 className={`header-title ${isRTL ? 'rtl' : 'ltr'}`}>
            {courseData.titles?.[isRTL ? 'ur' : 'en'] || courseData.titles?.en || t('courseStructure')}
          </h1>
        </div>

        <div className={`CourseLevel-list ${isRTL ? 'rtl' : 'ltr'}`}>
          {courseLevels.map((courseLevel, index) => {
            const status = getLevelStatus(courseLevel.id, index);

            return (
              <Row 
                key={courseLevel.id} 
                className={`CourseLevel-item ${isRTL ? 'rtl' : 'ltr'}`}
                onClick={() => handleNavigation(courseLevel.id, status)}
                style={{ cursor: status !== 'locked' ? 'pointer' : 'default' }}
              >
                {/* Desktop Layout */}
                <Col className="d-none d-lg-flex align-items-center" id='courselevel-card' style={{ justifyContent: 'space-between' }}>
                  <div className={`CourseLevel-profile ${isRTL ? 'rtl-flex-reverse' : ''}`}>
                    <div className="CourseLevel-icon">
                      <img
                        src={courseLevel.icon || "/assets/cap.png"}
                        alt={courseLevel.titles?.[isRTL ? 'ur' : 'en'] || courseLevel.titles?.en}
                        className="CourseLevel-icon-img"
                      />
                    </div>
                    <div className={`CourseLevel-content ${isRTL ? 'rtl' : 'ltr'}`}>
                      <h3 className="CourseLevel-title">
                        {courseLevel.titles?.[isRTL ? 'ur' : 'en'] || courseLevel.titles?.en || `Level ${courseLevel.level || index + 1}`}
                      </h3>
                      <p className="CourseLevel-subtitle">
                        {courseLevel.subtitles?.[isRTL ? 'ur' : 'en'] || courseLevel.subtitles?.en || courseLevel.descriptions?.[isRTL ? 'ur' : 'en'] || courseLevel.descriptions?.en || courseLevel.subtitle?.[isRTL ? 'ur' : 'en'] || courseLevel.subtitle?.en || courseLevel.subtitle || courseLevel.description || courseLevel.level_description || 'english english' /* fallback for testing */}
                        {/* Debug info */}
                        {/* {process.env.NODE_ENV === 'development' && (
                          <span style={{ fontSize: '10px', color: 'red', display: 'block' }}>
                            Debug: {JSON.stringify({ 
                              subtitles: courseLevel.subtitles, 
                              descriptions: courseLevel.descriptions, 
                              subtitle: courseLevel.subtitle,
                              allKeys: Object.keys(courseLevel)
                            })}
                          </span>
                        )} */}
                      </p>
                    </div>
                  </div>
                  <div className={`CourseLevel-duration-section ${isRTL ? 'rtl' : 'ltr'}`}>
                    <p className="duration-label">{t('estimatedDuration')}</p>
                    <p className="duration-time">
                      {(() => {
                        const duration = courseLevel.estimated_duration || courseLevel.estimatedDuration;
                        // If it's a translation key like 'duration1', 'duration2', etc., use fallback
                        if (duration && duration.startsWith && duration.startsWith('duration')) {
                          return t('hoursRange') || '1.5 - 2 hours';
                        }
                        return duration || t('hoursRange') || '1.5 - 2 hours';
                      })()} 
                    </p>
                  </div>
                  <div className={`level-section ${isRTL ? 'rtl' : 'ltr'}`}>
                    {getLevelBadge(courseLevel.level || index + 1)}
                  </div>
                  <div className={`status-section ${isRTL ? 'rtl' : 'ltr'}`}>
                    {getStatusBadge(status)}
                  </div>
                  <div className={`view-section ${isRTL ? 'rtl' : 'ltr'}`}>
                    {getViewButton(courseLevel.id, status)}
                  </div>
                </Col>

                {/* Mobile/Tablet Layout */}
                <Col className="d-lg-none">
                  <div className={`CourseLevel-main-row ${isRTL ? 'rtl-flex-reverse' : ''}`}>
                    <div className="CourseLevel-icon">
                      <img
                        src={courseLevel.icon || "/assets/cap.png"}
                        alt={courseLevel.titles?.[isRTL ? 'ur' : 'en'] || courseLevel.titles?.en}
                        className="CourseLevel-icon-img"
                      />
                    </div>
                    <div className={`CourseLevel-content ${isRTL ? 'rtl' : 'ltr'}`}>
                      <h3 className="CourseLevel-title">
                        {courseLevel.titles?.[isRTL ? 'ur' : 'en'] || courseLevel.titles?.en || `Level ${courseLevel.level || index + 1}`}
                      </h3>
                      <p className="CourseLevel-subtitle">
                        {courseLevel.subtitles?.[isRTL ? 'ur' : 'en'] || courseLevel.subtitles?.en || courseLevel.descriptions?.[isRTL ? 'ur' : 'en'] || courseLevel.descriptions?.en || courseLevel.subtitle?.[isRTL ? 'ur' : 'en'] || courseLevel.subtitle?.en || courseLevel.subtitle || courseLevel.description || courseLevel.level_description || 'english english' /* fallback for testing */}
                        {/* Debug info */}
                        {/* {process.env.NODE_ENV === 'development' && (
                          <span style={{ fontSize: '10px', color: 'red', display: 'block' }}>
                            Debug: {JSON.stringify({ 
                              subtitles: courseLevel.subtitles, 
                              descriptions: courseLevel.descriptions, 
                              subtitle: courseLevel.subtitle,
                              allKeys: Object.keys(courseLevel)
                            })}
                          </span>
                        )} */}
                      </p>
                    </div>
                  </div>

                  <div className={`mobile-duration-card ${isRTL ? 'rtl' : 'ltr'}`}>
                    <p className="duration-label">{t('estimatedDuration')}</p>
                    <p className="duration-time">
                      {(() => {
                        const duration = courseLevel.estimated_duration || courseLevel.estimatedDuration;
                        // If it's a translation key like 'duration1', 'duration2', etc., use fallback
                        if (duration && duration.startsWith && duration.startsWith('duration')) {
                          return t('hoursRange') || '1.5 - 2 hours';
                        }
                        return duration || t('hoursRange') || '1.5 - 2 hours';
                      })()} 
                    </p>
                  </div>

                  <div className={`level-status-row ${isRTL ? 'rtl-flex-reverse' : ''}`}>
                    {getLevelBadge(courseLevel.level || index + 1)}
                    {getStatusBadge(status)}
                    {getViewButton(courseLevel.id, status)}
                  </div>
                </Col>
              </Row>
            );
          })}
        </div>
      </Container>
    </div>
  );
};

export default CourseLevel;