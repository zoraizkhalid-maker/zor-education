import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/explorecourse.css';
import Header from './Header';
import { useLanguage } from './LanguageContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

const ExploreCourses = () => {
  const { allCourses, allCoursesLevels, userData, isEnrolledInCourse } = useAuth();
  const { t, isRTL, currentLanguage } = useLanguage();
  const navigate = useNavigate();

  const handleCourseClick = (courseId) => {
    // Always allow navigation - CourseLevel.js will handle enrollment validation
    navigate("/course-levels", { state: { selectedCourseId: courseId } });
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
    return allCoursesLevels.filter(level => level.courseId === courseId).length;
  };


  return (
    <>
      <Header />
      <div className={`explore-courses-container-explore ${isRTL ? 'rtl-explore' : ''}`}>
        <div className="container">
          <div className="row">
            <div className="col-12">
              <h1 className="explore-courses-header-explore">
                {t('exploreCourses')}
              </h1>
            </div>
          </div>

          <div className="row g-4">
            {allCourses.map((course, index) => (
              <div key={course.id} className="col-xl-3 col-lg-4 col-md-6 col-sm-6 col-12">
                <div
                  className="card course-card-explore h-100"
                  onClick={() => handleCourseClick(course.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="course-image-container-explore">
                    <img
                      src={course.image || "./assets/9.png"}
                      alt={getDisplayTitle(course)}
                      className="course-image-explore"
                      onError={(e) => {
                        e.target.src = './assets/9.png';
                      }}
                    />
                  </div>

                  <div className={`course-content-explore ${isRTL ? 'rtl-content' : ''}`}>
                    <h3 className="course-title-explore">
                      {getDisplayTitle(course)}
                    </h3>
                    <p className="course-number-explore">
                      {t('courseNumber')} #{course.courseNumber || String(index + 1).padStart(4, '0')}
                    </p>
                    <div className={`course-lessons-explore ${isRTL ? 'rtl-lessons' : ''}`}>
                      <img
                        src="./assets/8.png"
                        alt={t('lessons')}
                        className="lessons-icon-explore"
                        onError={(e) => {
                          e.target.src = './assets/10.png';
                        }}
                      />
                      {isRTL ? `${t('lessons')} ${getCourseLevelCount(course.id)}` : `${getCourseLevelCount(course.id)} ${t('lessons')}`}
                    </div>

                    {/* Show enrollment status */}
                    {isEnrolledInCourse(course.id) && (
                      <div className="enrollment-status-explore">
                        <span className="enrolled-badge-explore">
                          {t('enrolled') || 'Enrolled'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Show message if no courses available */}
          {allCourses.length === 0 && (
            <div className="row">
              <div className="col-12 text-center py-5">
                <div className="no-courses-message-explore">
                  <img 
                    src="./assets/21.png" 
                    alt="No courses" 
                    width="124" 
                    height="114"
                    className="mb-3"
                  />
                  <h3>{t('noCourseEnrolled') || 'No courses available'}</h3>
                  <p>{t('noCourseSubtitle') || 'Check back later for new courses'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ExploreCourses;