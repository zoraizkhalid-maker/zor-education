import React, { useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/courselevel.css';
import Header from './Header';
import { useLanguage } from './LanguageContext';

const CourseLevel = () => {
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();
  
  // Define courses structure without translations
  const coursesStructure = [
    {
      id: 1,
      titleKey: 'courseTitle1',
      subtitleKey: 'courseSubtitle1',
      level: 1,
      status: "completed",
      icon: "/assets/cap.png"
    },
    {
      id: 2,
      titleKey: 'courseTitle2',
      subtitleKey: 'courseSubtitle2',
      level: 2,
      status: "in-progress",
      icon: "/assets/cap.png"
    },
    {
      id: 3,
      titleKey: 'courseTitle3',
      subtitleKey: 'courseSubtitle3',
      level: 3,
      status: "locked",
      icon: "/assets/cap.png"
    },
    {
      id: 4,
      titleKey: 'courseTitle4',
      subtitleKey: 'courseSubtitle4',
      level: 3,
      status: "locked",
      icon: "/assets/cap.png"
    },
    {
      id: 5,
      titleKey: 'courseTitle5',
      subtitleKey: 'courseSubtitle5',
      level: 3,
      status: "locked",
      icon: "/assets/cap.png"
    },
    {
      id: 6,
      titleKey: 'courseTitle1',
      subtitleKey: 'courseSubtitle1',
      level: 3,
      status: "locked",
      icon: "/assets/cap.png"
    },
    {
      id: 7,
      titleKey: 'courseTitle2',
      subtitleKey: 'courseSubtitle2',
      level: 3,
      status: "locked",
      icon: "/assets/cap.png"
    },
    {
      id: 8,
      titleKey: 'courseTitle3',
      subtitleKey: 'courseSubtitle3',
      level: 3,
      status: "locked",
      icon: "/assets/cap.png"
    },
    {
      id: 9,
      titleKey: 'courseTitle4',
      subtitleKey: 'courseSubtitle4',
      level: 3,
      status: "locked",
      icon: "/assets/cap.png"
    },
    {
      id: 10,
      titleKey: 'courseTitle5',
      subtitleKey: 'courseSubtitle5',
      level: 3,
      status: "locked",
      icon: "/assets/cap.png"
    },
    {
      id: 11,
      titleKey: 'courseTitle1',
      subtitleKey: 'courseSubtitle1',
      level: 3,
      status: "locked",
      icon: "/assets/cap.png"
    }
  ];

  const handleNavigation = (courseId, status) => {
    if (status !== 'locked') {
      navigate(`/course-lessons/${courseId}`);
    }
  };

  const handleBackNavigation = () => {
    navigate(-1); // Go back to previous page
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

  const getViewButton = (courseId, status) => {
    const isDisabled = status === 'locked';
    return (
      <button
        className={`view-btn ${isDisabled ? 'disabled' : ''} ${isRTL ? 'rtl' : 'ltr'}`}
        disabled={isDisabled}
        onClick={() => handleNavigation(courseId, status)}
      >
        {t('view')}
      </button>
    );
  };

  return (
    <div className={`course-page ${isRTL ? 'rtl' : 'ltr'}`}>
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
              // style={isRTL ? { transform: 'scaleX()' } : {}}
            />
          </div>
          <h1 className={`header-title ${isRTL ? 'rtl' : 'ltr'}`}>
            {t('structureForCSCoding')}
          </h1>
        </div>

        <div className={`course-list ${isRTL ? 'rtl' : 'ltr'}`}>
          {coursesStructure.map((course) => (
            <Row key={course.id} className={`course-item ${isRTL ? 'rtl' : 'ltr'}`}>
              {/* Desktop Layout */}
              <Col className="d-none d-lg-flex align-items-center" id='course-card'>
                <div className={`course-profile ${isRTL ? 'rtl-flex-reverse' : ''}`}>
                  <div className="course-icon">
                    <img
                      src={course.icon}
                      alt={t(course.titleKey)}
                      className="course-icon-img"
                    />
                  </div>
                  <div className={`course-content ${isRTL ? 'rtl' : 'ltr'}`}>
                    <h3 className="course-title">{t(course.titleKey)}</h3>
                    <p className="course-subtitle">{t(course.subtitleKey)}</p>
                  </div>
                </div>
                <div className={`course-duration-section ${isRTL ? 'rtl' : 'ltr'}`}>
                  <p className="duration-label">{t('estimatedDuration')}</p>
                  <p className="duration-time">{t('hoursRange')}</p>
                </div>
                <div className={`level-section ${isRTL ? 'rtl' : 'ltr'}`}>
                  {getLevelBadge(course.level)}
                </div>
                <div className={`status-section ${isRTL ? 'rtl' : 'ltr'}`}>
                  {getStatusBadge(course.status)}
                </div>
                <div className={`view-section ${isRTL ? 'rtl' : 'ltr'}`}>
                  {getViewButton(course.id, course.status)}
                </div>
              </Col>

              {/* Mobile/Tablet Layout */}
              <Col className="d-lg-none">
                <div className={`course-main-row ${isRTL ? 'rtl-flex-reverse' : ''}`}>
                  <div className="course-icon">
                    <img
                      src={course.icon}
                      alt={t(course.titleKey)}
                      className="course-icon-img"
                    />
                  </div>
                  <div className={`course-content ${isRTL ? 'rtl' : 'ltr'}`}>
                    <h3 className="course-title">{t(course.titleKey)}</h3>
                    <p className="course-subtitle">{t(course.subtitleKey)}</p>
                  </div>
                </div>

                <div className={`mobile-duration-card ${isRTL ? 'rtl' : 'ltr'}`}>
                  <p className="duration-label">{t('estimatedDuration')}</p>
                  <p className="duration-time">{t('hoursRange')}</p>
                </div>

                <div className={`level-status-row ${isRTL ? 'rtl-flex-reverse' : ''}`}>
                  {getLevelBadge(course.level)}
                  {getStatusBadge(course.status)}
                  {getViewButton(course.id, course.status)}
                </div>
              </Col>
            </Row>
          ))}
        </div>
      </Container>
    </div>
  );
};

export default CourseLevel;