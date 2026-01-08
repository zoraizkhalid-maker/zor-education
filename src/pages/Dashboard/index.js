import React, { useState, useEffect } from "react";
import { Container, Tabs, Tab } from "react-bootstrap";
import Header from "../../Header";
import { useLanguage } from "../../LanguageContext";
import { useAuth } from "../../context/AuthContext";
import CourseManagement from "./CourseManagement";
import LevelManagement from "./LevelManagement";
import LessonsManagement from "./LessonsManagement";
import "../../styles/dashboard.css";

const Dashboard = () => {
  const { t, isRTL } = useLanguage();
  const {
    fetchAllCourses,
    fetchAllCourseLevels,
    fetchAllLessons,
  } = useAuth();

  const [activeTab, setActiveTab] = useState("courses");
  const [courses, setCourses] = useState([]);
  const [courseLevels, setCourseLevels] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setIsLoading(true);
    await Promise.all([
      loadCourses(),
      loadCourseLevels(),
      loadLessons()
    ]);
    setIsLoading(false);
  };

  const loadCourses = async () => {
    const result = await fetchAllCourses();
    if (result.success) {
      setCourses(result.data);
    }
  };

  const loadCourseLevels = async () => {
    const result = await fetchAllCourseLevels();
    if (result.success) {
      setCourseLevels(result.data);
    }
  };

  const loadLessons = async () => {
    const result = await fetchAllLessons();
    if (result.success) {
      setLessons(result.data);
    }
  };

  // Helper function to get only course levels that have valid courses
  const getValidCourseLevels = () => {
    const validCourseIds = courses.filter(course => course && course.id).map(course => course.id);
    return courseLevels.filter(level => level && level.courseId && validCourseIds.includes(level.courseId));
  };

  return (
    <div className={`dashboard-page ${isRTL ? "rtl" : "ltr"}`}>
      <Header />

      <Container fluid className="dashboard-container">
        <div className="dashboard-header">
          <h1 className="dashboard-title">{t("adminDashboard")}</h1>
        </div>

        <Tabs
          activeKey={activeTab}
          onSelect={setActiveTab}
          className="dashboard-tabs"
        >
          <Tab eventKey="courses" title={t("coursesManagement")}>
            <CourseManagement
              courses={courses}
              courseLevels={courseLevels}
              lessons={lessons}
              loadCourses={loadCourses}
              loadCourseLevels={loadCourseLevels}
              loadLessons={loadLessons}
              getValidCourseLevels={getValidCourseLevels}
            />
          </Tab>

          <Tab eventKey="levels" title={t("levelsManagement") || "Course Levels Management"}>
            <LevelManagement
              courses={courses}
              courseLevels={courseLevels}
              lessons={lessons}
              loadCourseLevels={loadCourseLevels}
              loadLessons={loadLessons}
              getValidCourseLevels={getValidCourseLevels}
            />
          </Tab>

          <Tab eventKey="lessons" title={t("lessonsManagement")}>
            <LessonsManagement
              courses={courses}
              courseLevels={courseLevels}
              lessons={lessons}
              loadLessons={loadLessons}
              loadCourseLevels={loadCourseLevels}
              getValidCourseLevels={getValidCourseLevels}
            />
          </Tab>
        </Tabs>
      </Container>
    </div>
  );
};

export default Dashboard;
