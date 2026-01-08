// home page when user is not enrolled in any course using static data

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import Header from './Header';
import Avatar from './components/Avatar';
import './styles/home1.css';
import { useNavigate } from "react-router-dom";
import { useLanguage } from './LanguageContext';

// Dynamic courses data function that uses translations
const getCoursesData = (t) => [
  {
    id: 1,
    title: t('exploreCourseTitle1'),
    courseNumber: "#3",
    lessons: 17,
    image: "/assets/9.png",
  },
  {
    id: 2,
    title: t('exploreCourseTitle2'),
    courseNumber: "#4",
    lessons: 22,
    image: "/assets/11.png",
  },
  {
    id: 3,
    title: t('exploreCourseTitle3'),
    courseNumber: "#5",
    lessons: 18,
    image: "/assets/12.png",
  },
  {
    id: 4,
    title: t('exploreCourseTitle4'),
    courseNumber: "#6",
    lessons: 15,
    image: "/assets/13.png",
  },
  {
    id: 5,
    title: t('exploreCourseTitle5'),
    courseNumber: "#7",
    lessons: 20,
    image: "/assets/14.png",
  },
  {
    id: 6,
    title: t('exploreCourseTitle6'),
    courseNumber: "#8",
    lessons: 25,
    image: "/assets/9.png",
  }
];

const Home1 = () => {
  const { t, currentLanguage, isRTL } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Get translated courses data
  const coursesData = getCoursesData(t);

  // Check if screen is mobile
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const itemsPerSlide = isMobile ? 1 : 4;
  const totalSlides = Math.ceil(coursesData.length / itemsPerSlide);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const getCurrentCourses = () => {
    const startIndex = currentSlide * itemsPerSlide;
    return coursesData.slice(startIndex, startIndex + itemsPerSlide);
  };

  const navigate = useNavigate();

  const handleContinue = () => {
    navigate("/course");
  };

  const handleViewAllClick = () => {
    navigate("/explore-courses");
  };

  const handleCourseClick = (courseId) => {
    navigate("/course", { state: { selectedCourseId: courseId } });
  };

  return (
    <div className={`home1-container ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Header Component */}
      <Header />

      {/* Background Image Section */}
      <div className="background-section-home1" style={{
        backgroundImage: 'url("./assets/overlay.png")',
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        top: 0,
        left: 0,
        width: '100%',
        height: '21vh',
        zIndex: -1
      }}>
      </div>

      {/* Cards Overlay Section */}
      <div className="cards-overlay-section-home1">
        <Container>
          <Row className="justify-content-center align-items-center">
            <Col xs={12} lg={10} xl={12}>
              <Row className="g-4">
                {/* Profile Card */}
                <Col xs={12} md={4}>
                  <Card className="profile-card-home1">
                    <Card.Body className="text-center">
                      <div className="profile-image-wrapper-home1">
                        <Avatar
                          name={t('profileName')}
                          profilePic={null}
                          size={80}
                          className=""
                        />
                      </div>
                      <h4 className="profile-name-home1">{t('profileName')}</h4>
                      <p className="profile-email-home1">{t('profileEmail')}</p>

                      <div className="course-completed-info-home1">
                        <div className="completion-icon-home1">
                          <img src="/assets/2.png" alt="icon" width="16" height="16" />
                        </div>
                        <span className="completion-text-home1">
                          {t('courseCompleted')} <strong>{t('courseCompletedCount')}</strong>
                        </span>
                      </div>

                      {/* <Button className="view-profile-btn-home1">
                        {t('viewProfileBtn')}
                      </Button> */}
                    </Card.Body>
                  </Card>
                </Col>

                {/* Course Progress Card */}
                <Col xs={12} md={8}>
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
                </Col>
              </Row>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Explore Courses Section */}
      <div className="explore-courses-section-home1">
        <Container>
          <div className="section-header-home1">
            <h2 className="section-title-home1">{t('exploreCourses')}</h2>
            <div className="section-controls-home1">
              <button
                className="view-all-btn-home1"
                onClick={handleViewAllClick}
              >
                {t('viewAll')}
              </button>
              <div className="slider-controls-home1">
                <button
                  className={`slider-btn-home1 prev-btn-home1 ${currentSlide === 0 ? 'disabled' : ''}`}
                  onClick={prevSlide}
                  disabled={currentSlide === 0}
                >
                  <img
                    src={isRTL ? "/assets/next.png" : "/assets/prev.png"}
                    alt={t('previous')}
                    width="20"
                    height="20"
                  />
                </button>
                <button
                  className={`slider-btn-home1 next-btn-home1 ${currentSlide === totalSlides - 1 ? 'disabled' : ''}`}
                  onClick={nextSlide}
                  disabled={currentSlide === totalSlides - 1}
                >
                  <img
                    src={isRTL ? "/assets/prev.png" : "/assets/next.png"}
                    alt={t('next')}
                    width="20"
                    height="20"
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="courses-slider-home1">
            {isMobile ? (
              // Mobile: Show current slide only
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
                          style={{ backgroundImage: `url("${course.image}")`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                        >
                        </div>
                      </div>
                      <Card.Body className="course-content-home">
                        <h5 className="course-card-title-home">{t(course.titleKey)}</h5>
                        <p className="course-number-home">
                          {t('courseNumber')} {course.courseNumber}
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
                            {course.lessons} {t('lessons')}
                          </span>
                        </div>
                      </Card.Body>
                    </Card>
                  </div>
                ))}
              </div>
            ) : (
              // Desktop: Original Bootstrap grid
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
                            style={{ backgroundImage: `url("${course.image}")`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                          >
                          </div>
                        </div>
                        <Card.Body className="course-content-home">
                          <h5 className="course-card-title-home">{t(course.titleKey)}</h5>
                          <p className="course-number-home">
                            {t('courseNumber')} {course.courseNumber}
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
                              {course.lessons} {t('lessons')}
                            </span>
                          </div>
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
    </div>
  );
};

export default Home1;