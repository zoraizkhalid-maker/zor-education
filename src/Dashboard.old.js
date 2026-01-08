import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Modal,
  Form,
  Table,
  Badge,
  Tabs,
  Tab,
  Accordion,
} from "react-bootstrap";
import { Plus, Edit, Trash2, Eye, Save, X, Copy } from "lucide-react";
import Header from "./Header";
import { useLanguage } from "./LanguageContext";
import "./styles/dashboard.css";

const Dashboard = () => {
  const { t, isRTL, currentLanguage } = useLanguage();

  // State management
  const [activeTab, setActiveTab] = useState("courses");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [bulkLessons, setBulkLessons] = useState([]);
  const [bulkQuizzes, setBulkQuizzes] = useState([]);
  const [selectedLevelId, setSelectedLevelId] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState(""); // For filtering levels in bulk form

  // Course state (simplified - only image and title)
  const [courses, setCourses] = useState([
    {
      id: 1,
      titles: { en: "Introduction to Computers", ur: "کمپیوٹر کا تعارف" },
      image: "/assets/cap.png",
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      titles: { en: "Advanced Programming", ur: "ایڈوانس پروگرامنگ" },
      image: "/assets/cap.png",
      createdAt: new Date().toISOString(),
    },
  ]);

  // Course Levels state (contains the detailed information that courses had before)
  const [courseLevels, setCourseLevels] = useState([
    {
      id: 1,
      courseId: 1,
      titles: { en: "Basic Computer Concepts", ur: "بنیادی کمپیوٹر تصورات" },
      subtitles: { en: "Foundation Level", ur: "بنیادی سطح" },
      level: 1,
      status: "completed",
      estimatedDuration: "duration1",
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      courseId: 1,
      titles: {
        en: "Intermediate Computer Skills",
        ur: "درمیانی کمپیوٹر مہارات",
      },
      subtitles: { en: "Intermediate Level", ur: "درمیانی سطح" },
      level: 2,
      status: "inProgress",
      estimatedDuration: "duration2",
      createdAt: new Date().toISOString(),
    },
    {
      id: 3,
      courseId: 2,
      titles: {
        en: "Programming Fundamentals",
        ur: "پروگرامنگ کی بنیادی باتیں",
      },
      subtitles: { en: "Entry Level Programming", ur: "ابتدائی پروگرامنگ" },
      level: 1,
      status: "locked",
      estimatedDuration: "duration2",
      createdAt: new Date().toISOString(),
    },
  ]);

  // Lesson state (now linked to course levels instead of courses)
  const [lessons, setLessons] = useState([
    {
      id: 1,
      levelId: 1, // Changed from courseId to levelId
      titles: { en: "What is a Computer?", ur: "کمپیوٹر کیا ہے؟" },
      subtitleKey: "lesson",
      type: "lesson",
      order: 1,
      content: {
        descriptions: {
          en: "Learn about computers and their basic functions",
          ur: "کمپیوٹر اور اس کے بنیادی کام کے بارے میں جانیں",
        },
        points: [
          {
            en: "Understanding computer basics",
            ur: "کمپیوٹر کی بنیادی باتیں سمجھنا",
          },
          { en: "Learning computer components", ur: "کمپیوٹر کے اجزاء سیکھنا" },
        ],
      },
    },
  ]);

  const [formData, setFormData] = useState({});

  // Load/save data
  useEffect(() => {
    const savedCourses = localStorage.getItem("admin_courses");
    const savedLevels = localStorage.getItem("admin_course_levels");
    const savedLessons = localStorage.getItem("admin_lessons");

    if (savedCourses) setCourses(JSON.parse(savedCourses));
    if (savedLevels) setCourseLevels(JSON.parse(savedLevels));
    if (savedLessons) setLessons(JSON.parse(savedLessons));
  }, []);

  useEffect(() => {
    localStorage.setItem("admin_courses", JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem("admin_course_levels", JSON.stringify(courseLevels));
  }, [courseLevels]);

  useEffect(() => {
    localStorage.setItem("admin_lessons", JSON.stringify(lessons));
  }, [lessons]);

  // Create empty structures with bilingual support
  const createEmptyLesson = () => ({
    titles: { en: "", ur: "" },
    subtitleKey: "lesson",
    type: "lesson",
    content: {
      descriptions: { en: "", ur: "" },
      points: [{ en: "", ur: "" }],
    },
  });

  const createEmptyQuiz = () => ({
    titles: { en: "", ur: "" },
    subtitleKey: "mcq",
    type: "quiz",
    content: {
      descriptions: { en: "", ur: "" },
      questions: [createEmptyQuestion()],
    },
  });

  const createEmptyQuestion = () => ({
    questions: { en: "", ur: "" },
    options: [
      { en: "", ur: "" },
      { en: "", ur: "" },
      { en: "", ur: "" },
      { en: "", ur: "" },
    ],
    correctAnswer: 0,
    explanations: { en: "", ur: "" },
  });

  const createEmptyCourse = () => ({
    titles: { en: "", ur: "" },
    image: "/assets/cap.png",
  });

  const createEmptyLevel = () => ({
    titles: { en: "", ur: "" },
    subtitles: { en: "", ur: "" },
    level: 1,
    status: "locked",
    estimatedDuration: "duration1",
  });

  // Helper function to get display content based on current language
  const getDisplayTitle = (item) => {
    if (item.titles && typeof item.titles === "object") {
      return (
        item.titles[currentLanguage] || item.titles.en || item.titles.ur || ""
      );
    }
    return item.titleKey ? t(item.titleKey) : "";
  };

  const getDisplaySubtitle = (item) => {
    if (item.subtitles && typeof item.subtitles === "object") {
      return (
        item.subtitles[currentLanguage] ||
        item.subtitles.en ||
        item.subtitles.ur ||
        ""
      );
    }
    return item.subtitleKey ? t(item.subtitleKey) : "";
  };

  // Get filtered course levels based on selected course
  const getFilteredCourseLevels = () => {
    if (!selectedCourseId) return courseLevels;
    return courseLevels.filter(level => level.courseId === parseInt(selectedCourseId));
  };

  // Modal handlers
  const openModal = (type, item = null) => {
    setModalType(type);
    setSelectedItem(item);

    if (type === "bulk") {
      setBulkLessons([createEmptyLesson()]);
      setBulkQuizzes([createEmptyQuiz()]);
      setSelectedLevelId("");
      setSelectedCourseId("");
    } else if (type === "add-course") {
      setFormData(createEmptyCourse());
    } else if (type === "edit-course") {
      setFormData({ ...item });
    } else if (type === "add-level") {
      const newFormData = createEmptyLevel();
      // Pre-select course if coming from courses table
      if (item && item.id) {
        newFormData.courseId = item.id;
      }
      setFormData(newFormData);
    } else if (type === "add-level-standalone") {
      setFormData(createEmptyLevel());
    } else if (type === "edit-level") {
      setFormData({ ...item });
    } else if (type === "view") {
      setFormData({ ...item });
    }

    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
    setFormData({});
    setBulkLessons([]);
    setBulkQuizzes([]);
    setSelectedLevelId("");
    setSelectedCourseId("");
  };

  // Form input handlers
  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Bilingual field update handler
  const updateBilingualField = (field, language, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        [language]: value,
      },
    }));
  };

  // Handle course selection change in bulk form
  const handleCourseSelectionChange = (courseId) => {
    setSelectedCourseId(courseId);
    setSelectedLevelId(""); // Reset level selection when course changes
  };

  // Lesson operations
  const addLesson = () => {
    setBulkLessons((prev) => [...prev, createEmptyLesson()]);
  };

  const removeLesson = (index) => {
    if (bulkLessons.length > 1) {
      setBulkLessons((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // Bilingual lesson field update
  const updateLessonBilingual = (index, field, language, value) => {
    setBulkLessons((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;

        const keys = field.split(".");
        if (keys.length === 1) {
          return {
            ...item,
            [field]: {
              ...item[field],
              [language]: value,
            },
          };
        } else {
          const [parent, child] = keys;
          return {
            ...item,
            [parent]: {
              ...item[parent],
              [child]: {
                ...item[parent][child],
                [language]: value,
              },
            },
          };
        }
      })
    );
  };

  // Update lesson points array
  const updateLessonPoint = (lessonIndex, pointIndex, language, value) => {
    setBulkLessons((prev) =>
      prev.map((lesson, i) => {
        if (i !== lessonIndex) return lesson;

        return {
          ...lesson,
          content: {
            ...lesson.content,
            points: lesson.content.points.map((point, j) => {
              if (j !== pointIndex) return point;
              return {
                ...point,
                [language]: value,
              };
            }),
          },
        };
      })
    );
  };

  const addLessonPoint = (lessonIndex) => {
    setBulkLessons((prev) =>
      prev.map((lesson, i) => {
        if (i !== lessonIndex) return lesson;

        return {
          ...lesson,
          content: {
            ...lesson.content,
            points: [...lesson.content.points, { en: "", ur: "" }],
          },
        };
      })
    );
  };

  const removeLessonPoint = (lessonIndex, pointIndex) => {
    setBulkLessons((prev) =>
      prev.map((lesson, i) => {
        if (i !== lessonIndex) return lesson;

        if (lesson.content.points.length <= 1) return lesson;

        return {
          ...lesson,
          content: {
            ...lesson.content,
            points: lesson.content.points.filter((_, j) => j !== pointIndex),
          },
        };
      })
    );
  };

  // Quiz operations
  const addQuiz = () => {
    setBulkQuizzes((prev) => [...prev, createEmptyQuiz()]);
  };

  const removeQuiz = (index) => {
    if (bulkQuizzes.length > 1) {
      setBulkQuizzes((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // Bilingual quiz field update
  const updateQuizBilingual = (index, field, language, value) => {
    setBulkQuizzes((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;

        const keys = field.split(".");
        if (keys.length === 1) {
          return {
            ...item,
            [field]: {
              ...item[field],
              [language]: value,
            },
          };
        } else {
          const [parent, child] = keys;
          return {
            ...item,
            [parent]: {
              ...item[parent],
              [child]: {
                ...item[parent][child],
                [language]: value,
              },
            },
          };
        }
      })
    );
  };

  const addQuestion = (quizIndex) => {
    setBulkQuizzes((prev) =>
      prev.map((quiz, i) => {
        if (i !== quizIndex) return quiz;

        return {
          ...quiz,
          content: {
            ...quiz.content,
            questions: [...quiz.content.questions, createEmptyQuestion()],
          },
        };
      })
    );
  };

  const removeQuestion = (quizIndex, questionIndex) => {
    setBulkQuizzes((prev) =>
      prev.map((quiz, i) => {
        if (i !== quizIndex) return quiz;

        if (quiz.content.questions.length <= 1) return quiz;

        return {
          ...quiz,
          content: {
            ...quiz.content,
            questions: quiz.content.questions.filter(
              (_, j) => j !== questionIndex
            ),
          },
        };
      })
    );
  };

  const updateQuestion = (quizIndex, questionIndex, field, language, value) => {
    setBulkQuizzes((prev) =>
      prev.map((quiz, i) => {
        if (i !== quizIndex) return quiz;

        return {
          ...quiz,
          content: {
            ...quiz.content,
            questions: quiz.content.questions.map((question, j) => {
              if (j !== questionIndex) return question;

              if (field === "correctAnswer") {
                return { ...question, [field]: value };
              }

              return {
                ...question,
                [field]: {
                  ...question[field],
                  [language]: value,
                },
              };
            }),
          },
        };
      })
    );
  };

  const updateQuestionOption = (
    quizIndex,
    questionIndex,
    optionIndex,
    language,
    value
  ) => {
    setBulkQuizzes((prev) =>
      prev.map((quiz, i) => {
        if (i !== quizIndex) return quiz;

        return {
          ...quiz,
          content: {
            ...quiz.content,
            questions: quiz.content.questions.map((question, j) => {
              if (j !== questionIndex) return question;
              return {
                ...question,
                options: question.options.map((option, k) => {
                  if (k !== optionIndex) return option;
                  return {
                    ...option,
                    [language]: value,
                  };
                }),
              };
            }),
          },
        };
      })
    );
  };

  const duplicateLesson = (index) => {
    const lessonToCopy = { ...bulkLessons[index] };
    setBulkLessons((prev) => [...prev, lessonToCopy]);
  };

  const duplicateQuiz = (index) => {
    const quizToCopy = { ...bulkQuizzes[index] };
    setBulkQuizzes((prev) => [...prev, quizToCopy]);
  };

  // Validation function (English required, Urdu optional but available)
  const validateBilingualFields = (items, type) => {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.titles?.en) {
        alert(`${type} ${i + 1}: English title is required`);
        return false;
      }

      if (type === "Lesson") {
        if (!item.content.descriptions?.en) {
          alert(`${type} ${i + 1}: English description is required`);
          return false;
        }
        // Check if at least one point has English content
        const hasEnglishPoint = item.content.points.some((point) => point.en);
        if (!hasEnglishPoint) {
          alert(`${type} ${i + 1}: At least one English point is required`);
          return false;
        }
      }

      if (type === "Quiz") {
        if (!item.content.descriptions?.en) {
          alert(`${type} ${i + 1}: English quiz description is required`);
          return false;
        }

        // Validate questions
        for (let j = 0; j < item.content.questions.length; j++) {
          const question = item.content.questions[j];
          if (!question.questions?.en) {
            alert(
              `${type} ${i + 1}, Question ${
                j + 1
              }: English question is required`
            );
            return false;
          }

          // Check if all options have English content
          const hasAllEnglishOptions = question.options.every(
            (option) => option.en
          );
          if (!hasAllEnglishOptions) {
            alert(
              `${type} ${i + 1}, Question ${
                j + 1
              }: All English options are required`
            );
            return false;
          }

          if (!question.explanations?.en) {
            alert(
              `${type} ${i + 1}, Question ${
                j + 1
              }: English explanation is required`
            );
            return false;
          }
        }
      }
    }
    return true;
  };

  const validateCourseFields = () => {
    if (!formData.titles?.en) {
      alert("English title is required");
      return false;
    }
    return true;
  };

  const validateLevelFields = () => {
    if (!formData.titles?.en) {
      alert("English title is required");
      return false;
    }
    if (!formData.subtitles?.en) {
      alert("English subtitle is required");
      return false;
    }
    if (!formData.courseId) {
      alert("Please select a course");
      return false;
    }
    return true;
  };

  // Save operations
  const saveAllData = () => {
    if (!selectedLevelId) {
      alert("Please select a course level");
      return;
    }

    // Validate bilingual fields
    if (
      !validateBilingualFields(bulkLessons, "Lesson") ||
      !validateBilingualFields(bulkQuizzes, "Quiz")
    ) {
      return;
    }

    const timestamp = Date.now();
    let counter = 0;

    // Prepare all items (lessons and quizzes)
    const allItems = [];

    // Add lessons with automatic sequential ordering
    bulkLessons.forEach((lesson, index) => {
      allItems.push({
        ...lesson,
        id: timestamp + counter++,
        levelId: parseInt(selectedLevelId), // Changed from courseId to levelId
        order: counter,
        createdAt: new Date().toISOString(),
      });
    });

    // Add quizzes with automatic sequential ordering
    bulkQuizzes.forEach((quiz, index) => {
      allItems.push({
        ...quiz,
        id: timestamp + counter++,
        levelId: parseInt(selectedLevelId), // Changed from courseId to levelId
        order: counter,
        createdAt: new Date().toISOString(),
      });
    });

    // Save all items at once
    setLessons((prev) => [...prev, ...allItems]);
    closeModal();
  };

  const saveData = () => {
    if (modalType === "bulk") {
      saveAllData();
    } else if (modalType === "add-course") {
      if (!validateCourseFields()) return;

      const newCourse = {
        ...formData,
        id: Date.now(),
        createdAt: new Date().toISOString(),
      };
      setCourses((prev) => [...prev, newCourse]);
      closeModal();
    } else if (modalType === "edit-course") {
      if (!validateCourseFields()) return;

      setCourses((prev) =>
        prev.map((course) =>
          course.id === selectedItem.id
            ? {
                ...formData,
                id: selectedItem.id,
                updatedAt: new Date().toISOString(),
              }
            : course
        )
      );
      closeModal();
    } else if (modalType === "add-level" || modalType === "add-level-standalone") {
      if (!validateLevelFields()) return;

      const newLevel = {
        ...formData,
        id: Date.now(),
        createdAt: new Date().toISOString(),
      };
      setCourseLevels((prev) => [...prev, newLevel]);
      closeModal();
    } else if (modalType === "edit-level") {
      if (!validateLevelFields()) return;

      setCourseLevels((prev) =>
        prev.map((level) =>
          level.id === selectedItem.id
            ? {
                ...formData,
                id: selectedItem.id,
                updatedAt: new Date().toISOString(),
              }
            : level
        )
      );
      closeModal();
    }
  };

  // Delete operations
  const deleteItem = (id, type) => {
    if (!window.confirm(t("confirmDelete"))) return;

    if (type === "course") {
      setCourses((prev) => prev.filter((course) => course.id !== id));
      // Delete all levels and lessons associated with this course
      const levelIds = courseLevels
        .filter((level) => level.courseId === id)
        .map((level) => level.id);
      setCourseLevels((prev) => prev.filter((level) => level.courseId !== id));
      setLessons((prev) =>
        prev.filter((lesson) => !levelIds.includes(lesson.levelId))
      );
    } else if (type === "level") {
      setCourseLevels((prev) => prev.filter((level) => level.id !== id));
      // Delete all lessons associated with this level
      setLessons((prev) => prev.filter((lesson) => lesson.levelId !== id));
    } else if (type === "lesson") {
      setLessons((prev) => prev.filter((lesson) => lesson.id !== id));
    }
  };

  const getTotalItems = () => {
    return bulkLessons.length + bulkQuizzes.length;
  };

  const getTotalQuestions = () => {
    return bulkQuizzes.reduce(
      (total, quiz) => total + quiz.content.questions.length,
      0
    );
  };

  // Helper function to get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "completed":
        return "success";
      case "inProgress":
        return "warning";
      default:
        return "secondary";
    }
  };

  // Helper function to get type badge color
  const getTypeBadgeColor = (type) => {
    return type === "quiz" ? "warning" : "primary";
  };

  const translateDuration = (duration) => {
    const translated = t(duration);
    if (translated !== duration) {
      return translated;
    }

    if (duration.includes("hours")) {
      return duration.replace(/hours?/g, t("hours"));
    }

    return duration;
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
          {/* Courses Tab - Simplified to show only image and title */}
          <Tab eventKey="courses" title={t("coursesManagement")}>
            <div className="tab-content-wrapper">
              <div className="tab-header">
                <h3>
                  {t("courses")} ({courses.length})
                </h3>
                <Button
                  variant="success"
                  onClick={() => openModal("add-course")}
                >
                  <Plus size={16} className={isRTL ? "ms-1" : "me-1"} />
                  {t("addCourse")}
                </Button>
              </div>

              <Card className="data-table-card">
                <Card.Body>
                  <Table responsive hover>
                    <thead>
                      <tr>
                        <th>{t("id")}</th>
                        <th>{t("image")}</th>
                        <th>{t("title")}</th>
                        <th>{t("courseLevels")}</th>
                        <th>{t("actions")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courses.map((course) => (
                        <tr key={course.id}>
                          <td>{course.id}</td>
                          <td>
                            <img
                              src={course.image}
                              alt={getDisplayTitle(course)}
                              style={{
                                width: "40px",
                                height: "40px",
                                objectFit: "cover",
                                borderRadius: "5px",
                              }}
                            />
                          </td>
                          <td>{getDisplayTitle(course)}</td>
                          <td>
                            {
                              courseLevels.filter(
                                (l) => l.courseId === course.id
                              ).length
                            }
                          </td>
                          <td>
                            <div className="action-buttons">
                              <Button
                                variant="outline-success"
                                size="sm"
                                onClick={() => openModal("add-level", course)}
                                title="Add Course Level"
                              >
                                <Plus size={14} />
                              </Button>
                              <Button
                                variant="outline-info"
                                size="sm"
                                onClick={() => openModal("view", course)}
                                title={t("view")}
                              >
                                <Eye size={14} />
                              </Button>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => openModal("edit-course", course)}
                                title={t("editCourse")}
                              >
                                <Edit size={14} />
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => deleteItem(course.id, "course")}
                                title={t("delete")}
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </div>
          </Tab>

          {/* Course Levels Tab - Contains the detailed information that was in courses */}
          <Tab eventKey="levels" title="Course Levels Management">
            <div className="tab-content-wrapper">
              <div className="tab-header">
                <h3>Course Levels ({courseLevels.length})</h3>
                <Button
                  variant="success"
                  onClick={() => openModal("add-level-standalone")}
                >
                  <Plus size={16} className={isRTL ? "ms-1" : "me-1"} />
                  Add Course Level
                </Button>
              </div>

              <Card className="data-table-card">
                <Card.Body>
                  <Table responsive hover>
                    <thead>
                      <tr>
                        <th>{t("id")}</th>
                        <th>{t("course")}</th>
                        <th>{t("title")}</th>
                        <th>{t("level")}</th>
                        <th>{t("status")}</th>
                        <th>{t("duration")}</th>
                        <th>{t("lessons")}</th>
                        <th>{t("actions")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courseLevels.map((level) => {
                        const course = courses.find(
                          (c) => c.id === level.courseId
                        );
                        return (
                          <tr key={level.id}>
                            <td>{level.id}</td>
                            <td>
                              {course ? getDisplayTitle(course) : t("unknown")}
                            </td>
                            <td>{getDisplayTitle(level)}</td>
                            <td>
                              <Badge
                                bg="info"
                                style={{
                                  padding: "10px 16px",
                                  fontSize: "10px",
                                }}
                              >
                                {t("level")} {level.level}
                              </Badge>
                            </td>
                            <td>
                              <Badge
                                bg={getStatusBadgeColor(level.status)}
                                style={{
                                  padding: "10px 16px",
                                  fontSize: "10px",
                                }}
                              >
                                {t(level.status)}
                              </Badge>
                            </td>
                            <td>
                              {translateDuration(level.estimatedDuration)}
                            </td>
                            <td>
                              {
                                lessons.filter((l) => l.levelId === level.id)
                                  .length
                              }
                            </td>
                            <td>
                              <div className="action-buttons">
                                <Button
                                  variant="outline-success"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedLevelId(level.id);
                                    openModal("bulk");
                                  }}
                                  title="Add Content"
                                >
                                  <Plus size={14} />
                                </Button>
                                <Button
                                  variant="outline-info"
                                  size="sm"
                                  onClick={() => openModal("view", level)}
                                  title={t("view")}
                                >
                                  <Eye size={14} />
                                </Button>
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() => openModal("edit-level", level)}
                                  title="Edit Level"
                                >
                                  <Edit size={14} />
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => deleteItem(level.id, "level")}
                                  title={t("delete")}
                                >
                                  <Trash2 size={14} />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </div>
          </Tab>

          {/* Lessons Tab - Now shows lessons linked to course levels */}
          <Tab eventKey="lessons" title={t("lessonsManagement")}>
            <div className="tab-content-wrapper">
              <div className="tab-header">
                <h3>
                  {t("lessons")} ({lessons.length})
                </h3>
                <Button variant="success" onClick={() => openModal("bulk")}>
                  <Plus size={16} className={isRTL ? "ms-1" : "me-1"} />
                  {t("addLessonsQuizzes")}
                </Button>
              </div>

              <Card className="data-table-card">
                <Card.Body>
                  <Table responsive hover>
                    <thead>
                      <tr>
                        <th>{t("id")}</th>
                        <th>{t("course")}</th>
                        <th>Course Level</th>
                        <th>{t("title")}</th>
                        <th>{t("type")}</th>
                        <th>{t("order")}</th>
                        <th>{t("questions")}</th>
                        <th>{t("actions")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lessons.map((lesson) => {
                        const level = courseLevels.find(
                          (l) => l.id === lesson.levelId
                        );
                        const course = level
                          ? courses.find((c) => c.id === level.courseId)
                          : null;
                        const questionCount =
                          lesson.type === "quiz" && lesson.content.questions
                            ? lesson.content.questions.length
                            : 0;

                        return (
                          <tr key={lesson.id}>
                            <td>{lesson.id}</td>
                            <td>
                              {course ? getDisplayTitle(course) : t("unknown")}
                            </td>
                            <td>
                              {level ? getDisplayTitle(level) : t("unknown")}
                            </td>
                            <td>{getDisplayTitle(lesson)}</td>
                            <td>
                              <Badge bg={getTypeBadgeColor(lesson.type)}>
                                {t(lesson.type)}
                              </Badge>
                            </td>
                            <td>{lesson.order}</td>
                            <td>{questionCount || "-"}</td>
                            <td>
                              <div className="action-buttons">
                                <Button
                                  variant="outline-info"
                                  size="sm"
                                  onClick={() => openModal("view", lesson)}
                                  title={t("view")}
                                >
                                  <Eye size={14} />
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() =>
                                    deleteItem(lesson.id, "lesson")
                                  }
                                  title={t("delete")}
                                >
                                  <Trash2 size={14} />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </div>
          </Tab>
        </Tabs>

        {/* Modal */}
        <Modal
          show={showModal}
          onHide={closeModal}
          size={modalType === "bulk" ? "xl" : "lg"}
        >
          <Modal.Header closeButton>
            <Modal.Title>
              {modalType === "bulk" &&
                `${t("addContent")} - ${getTotalItems()} ${t(
                  "items"
                )}, ${getTotalQuestions()} ${t("questions")}`}
              {modalType === "add-course" && t("addCourse")}
              {modalType === "edit-course" && t("editCourse")}
              {modalType === "add-level" && "Add Course Level"}
              {modalType === "add-level-standalone" && "Add Course Level"}
              {modalType === "edit-level" && "Edit Course Level"}
              {modalType === "view" && t("viewDetails")}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {/* Bulk Form - Updated with course selection and filtered levels */}
            {modalType === "bulk" && (
              <Form>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Select Course *</Form.Label>
                      <Form.Select 
                        value={selectedCourseId} 
                        onChange={(e) => handleCourseSelectionChange(e.target.value)}
                      >
                        <option value="">Choose Course</option>
                        {courses.map(course => (
                          <option key={course.id} value={course.id}>
                            {getDisplayTitle(course)} ({t("id")}: {course.id})
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Select Course Level *</Form.Label>
                      <Form.Select
                        value={selectedLevelId}
                        onChange={(e) => setSelectedLevelId(e.target.value)}
                        disabled={!selectedCourseId}
                      >
                        <option value="">
                          {selectedCourseId ? "Choose Course Level" : "Select Course First"}
                        </option>
                        {getFilteredCourseLevels().map((level) => (
                          <option key={level.id} value={level.id}>
                            {getDisplayTitle(level)} ({t("id")}: {level.id})
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <div style={{ maxHeight: "500px", overflowY: "auto" }}>
                  <Accordion
                    defaultActiveKey={["lessons", "quizzes"]}
                    alwaysOpen
                  >
                    {/* Lessons Section */}
                    <Accordion.Item eventKey="lessons">
                      <Accordion.Header>
                        <div className="d-flex justify-content-between w-100 me-3">
                          <span>
                            {t("lessons")} ({bulkLessons.length})
                          </span>
                        </div>
                      </Accordion.Header>
                      <Accordion.Body>
                        <div className="mb-3">
                          <Button
                            variant="success"
                            size="sm"
                            onClick={addLesson}
                          >
                            <Plus
                              size={16}
                              className={isRTL ? "ms-1" : "me-1"}
                            />
                            {t("addLesson")}
                          </Button>
                        </div>

                        {bulkLessons.map((lesson, lessonIndex) => (
                          <Card
                            key={lessonIndex}
                            className="mb-3 bulk-item-card"
                          >
                            <Card.Header className="d-flex justify-content-between align-items-center">
                              <h6 className="mb-0">
                                {t("lesson")} {lessonIndex + 1}
                              </h6>
                              <div>
                                <Button
                                  variant="outline-secondary"
                                  size="sm"
                                  onClick={() => duplicateLesson(lessonIndex)}
                                  className={isRTL ? "ms-2" : "me-2"}
                                  title={t("duplicate")}
                                >
                                  <Copy size={14} />
                                </Button>
                                {bulkLessons.length > 1 && (
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => removeLesson(lessonIndex)}
                                    title={t("remove")}
                                  >
                                    <X size={14} />
                                  </Button>
                                )}
                              </div>
                            </Card.Header>
                            <Card.Body>
                              {/* Bilingual Title Fields */}
                              <Row className="mb-3">
                                <Col md={6}>
                                  <Form.Group>
                                    <Form.Label>
                                      {t("titleEnglish")} * (Required)
                                    </Form.Label>
                                    <Form.Control
                                      type="text"
                                      value={lesson.titles?.en || ""}
                                      onChange={(e) =>
                                        updateLessonBilingual(
                                          lessonIndex,
                                          "titles",
                                          "en",
                                          e.target.value
                                        )
                                      }
                                      placeholder="Enter English title"
                                      required
                                    />
                                  </Form.Group>
                                </Col>
                                <Col md={6}>
                                  <Form.Group>
                                    <Form.Label>
                                      {t("titleUrdu")} (Optional)
                                    </Form.Label>
                                    <Form.Control
                                      type="text"
                                      value={lesson.titles?.ur || ""}
                                      onChange={(e) =>
                                        updateLessonBilingual(
                                          lessonIndex,
                                          "titles",
                                          "ur",
                                          e.target.value
                                        )
                                      }
                                      placeholder="اردو ٹائٹل داخل کریں"
                                      dir="rtl"
                                    />
                                  </Form.Group>
                                </Col>
                              </Row>

                              {/* Bilingual Description Fields */}
                              <Row className="mb-3">
                                <Col md={6}>
                                  <Form.Group>
                                    <Form.Label>
                                      {t("descriptionEnglish")} * (Required)
                                    </Form.Label>
                                    <Form.Control
                                      as="textarea"
                                      rows={3}
                                      value={
                                        lesson.content.descriptions?.en || ""
                                      }
                                      onChange={(e) =>
                                        updateLessonBilingual(
                                          lessonIndex,
                                          "content.descriptions",
                                          "en",
                                          e.target.value
                                        )
                                      }
                                      placeholder="Enter English description"
                                      required
                                    />
                                  </Form.Group>
                                </Col>
                                <Col md={6}>
                                  <Form.Group>
                                    <Form.Label>
                                      {t("descriptionUrdu")} (Optional)
                                    </Form.Label>
                                    <Form.Control
                                      as="textarea"
                                      rows={3}
                                      value={
                                        lesson.content.descriptions?.ur || ""
                                      }
                                      onChange={(e) =>
                                        updateLessonBilingual(
                                          lessonIndex,
                                          "content.descriptions",
                                          "ur",
                                          e.target.value
                                        )
                                      }
                                      placeholder="اردو تفصیل داخل کریں"
                                      dir="rtl"
                                    />
                                  </Form.Group>
                                </Col>
                              </Row>

                              {/* Bilingual Points */}
                              <Form.Group className="mb-3">
                                <Form.Label>{t("points")}</Form.Label>
                                {lesson.content.points.map(
                                  (point, pointIndex) => (
                                    <Card
                                      key={pointIndex}
                                      className="mb-2"
                                      style={{ border: "1px solid #e9ecef" }}
                                    >
                                      <Card.Body className="p-3">
                                        <Row className="mb-2">
                                          <Col md={6}>
                                            <Form.Group>
                                              <Form.Label>
                                                {t("pointEnglish")}{" "}
                                                {pointIndex + 1} * (Required)
                                              </Form.Label>
                                              <Form.Control
                                                type="text"
                                                value={point.en || ""}
                                                onChange={(e) =>
                                                  updateLessonPoint(
                                                    lessonIndex,
                                                    pointIndex,
                                                    "en",
                                                    e.target.value
                                                  )
                                                }
                                                placeholder={`Enter English point ${
                                                  pointIndex + 1
                                                }`}
                                                required
                                              />
                                            </Form.Group>
                                          </Col>
                                          <Col md={6}>
                                            <Form.Group>
                                              <Form.Label>
                                                {t("pointUrdu")}{" "}
                                                {pointIndex + 1} (Optional)
                                              </Form.Label>
                                              <div className="d-flex">
                                                <Form.Control
                                                  type="text"
                                                  value={point.ur || ""}
                                                  onChange={(e) =>
                                                    updateLessonPoint(
                                                      lessonIndex,
                                                      pointIndex,
                                                      "ur",
                                                      e.target.value
                                                    )
                                                  }
                                                  placeholder={`اردو نکتہ ${
                                                    pointIndex + 1
                                                  } داخل کریں`}
                                                  dir="rtl"
                                                  className="me-2"
                                                />
                                                {lesson.content.points.length >
                                                  1 && (
                                                  <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() =>
                                                      removeLessonPoint(
                                                        lessonIndex,
                                                        pointIndex
                                                      )
                                                    }
                                                    title={t("remove")}
                                                  >
                                                    <X size={14} />
                                                  </Button>
                                                )}
                                              </div>
                                            </Form.Group>
                                          </Col>
                                        </Row>
                                      </Card.Body>
                                    </Card>
                                  )
                                )}
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() => addLessonPoint(lessonIndex)}
                                >
                                  <Plus
                                    size={14}
                                    className={isRTL ? "ms-1" : "me-1"}
                                  />
                                  {t("addPoint")}
                                </Button>
                              </Form.Group>
                            </Card.Body>
                          </Card>
                        ))}
                      </Accordion.Body>
                    </Accordion.Item>

                    {/* Quizzes Section */}
                    <Accordion.Item eventKey="quizzes">
                      <Accordion.Header>
                        <div className="d-flex justify-content-between w-100 me-3">
                          <span>
                            {t("quizzes")} ({bulkQuizzes.length}) -{" "}
                            {getTotalQuestions()} {t("totalQuestions")}
                          </span>
                        </div>
                      </Accordion.Header>
                      <Accordion.Body>
                        <div className="mb-3">
                          <Button variant="info" size="sm" onClick={addQuiz}>
                            <Plus
                              size={16}
                              className={isRTL ? "ms-1" : "me-1"}
                            />
                            {t("addQuiz")}
                          </Button>
                        </div>

                        {bulkQuizzes.map((quiz, quizIndex) => (
                          <Card key={quizIndex} className="mb-3 bulk-item-card">
                            <Card.Header className="d-flex justify-content-between align-items-center">
                              <h6 className="mb-0">
                                {t("quiz")} {quizIndex + 1} (
                                {quiz.content.questions.length} {t("questions")}
                                )
                              </h6>
                              <div>
                                <Button
                                  variant="outline-secondary"
                                  size="sm"
                                  onClick={() => duplicateQuiz(quizIndex)}
                                  className={isRTL ? "ms-2" : "me-2"}
                                  title={t("duplicate")}
                                >
                                  <Copy size={14} />
                                </Button>
                                {bulkQuizzes.length > 1 && (
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => removeQuiz(quizIndex)}
                                    title={t("remove")}
                                  >
                                    <X size={14} />
                                  </Button>
                                )}
                              </div>
                            </Card.Header>
                            <Card.Body>
                              {/* Bilingual Quiz Title Fields */}
                              <Row className="mb-3">
                                <Col md={6}>
                                  <Form.Group>
                                    <Form.Label>
                                      {t("quizTitleEnglish")} * (Required)
                                    </Form.Label>
                                    <Form.Control
                                      type="text"
                                      value={quiz.titles?.en || ""}
                                      onChange={(e) =>
                                        updateQuizBilingual(
                                          quizIndex,
                                          "titles",
                                          "en",
                                          e.target.value
                                        )
                                      }
                                      placeholder="Enter English quiz title"
                                      required
                                    />
                                  </Form.Group>
                                </Col>
                                <Col md={6}>
                                  <Form.Group>
                                    <Form.Label>
                                      {t("quizTitleUrdu")} (Optional)
                                    </Form.Label>
                                    <Form.Control
                                      type="text"
                                      value={quiz.titles?.ur || ""}
                                      onChange={(e) =>
                                        updateQuizBilingual(
                                          quizIndex,
                                          "titles",
                                          "ur",
                                          e.target.value
                                        )
                                      }
                                      placeholder="کوئز کا اردو ٹائٹل داخل کریں"
                                      dir="rtl"
                                    />
                                  </Form.Group>
                                </Col>
                              </Row>

                              {/* Bilingual Quiz Description */}
                              <Row className="mb-3">
                                <Col md={6}>
                                  <Form.Group>
                                    <Form.Label>
                                      {t("quizDescriptionEnglish")} * (Required)
                                    </Form.Label>
                                    <Form.Control
                                      as="textarea"
                                      rows={2}
                                      value={
                                        quiz.content.descriptions?.en || ""
                                      }
                                      onChange={(e) =>
                                        updateQuizBilingual(
                                          quizIndex,
                                          "content.descriptions",
                                          "en",
                                          e.target.value
                                        )
                                      }
                                      placeholder="Enter English quiz description"
                                      required
                                    />
                                  </Form.Group>
                                </Col>
                                <Col md={6}>
                                  <Form.Group>
                                    <Form.Label>
                                      {t("quizDescriptionUrdu")} (Optional)
                                    </Form.Label>
                                    <Form.Control
                                      as="textarea"
                                      rows={2}
                                      value={
                                        quiz.content.descriptions?.ur || ""
                                      }
                                      onChange={(e) =>
                                        updateQuizBilingual(
                                          quizIndex,
                                          "content.descriptions",
                                          "ur",
                                          e.target.value
                                        )
                                      }
                                      placeholder="کوئز کی اردو تفصیل داخل کریں"
                                      dir="rtl"
                                    />
                                  </Form.Group>
                                </Col>
                              </Row>

                              <div className="mb-3">
                                <Button
                                  variant="outline-info"
                                  size="sm"
                                  onClick={() => addQuestion(quizIndex)}
                                >
                                  <Plus
                                    size={14}
                                    className={isRTL ? "ms-1" : "me-1"}
                                  />
                                  {t("addQuestion")}
                                </Button>
                              </div>

                              {/* Questions */}
                              {quiz.content.questions.map(
                                (question, questionIndex) => (
                                  <Card
                                    key={questionIndex}
                                    className="mb-3 question-card"
                                  >
                                    <Card.Header className="d-flex justify-content-between align-items-center py-2">
                                      <small className="mb-0">
                                        {t("question")} {questionIndex + 1}
                                      </small>
                                      {quiz.content.questions.length > 1 && (
                                        <Button
                                          variant="outline-danger"
                                          size="sm"
                                          onClick={() =>
                                            removeQuestion(
                                              quizIndex,
                                              questionIndex
                                            )
                                          }
                                          title={t("remove")}
                                        >
                                          <X size={12} />
                                        </Button>
                                      )}
                                    </Card.Header>
                                    <Card.Body className="py-2">
                                      {/* Bilingual Question */}
                                      <Row className="mb-2">
                                        <Col md={6}>
                                          <Form.Group>
                                            <Form.Label>
                                              {t("questionEnglish")} *
                                              (Required)
                                            </Form.Label>
                                            <Form.Control
                                              type="text"
                                              size="sm"
                                              value={
                                                question.questions?.en || ""
                                              }
                                              onChange={(e) =>
                                                updateQuestion(
                                                  quizIndex,
                                                  questionIndex,
                                                  "questions",
                                                  "en",
                                                  e.target.value
                                                )
                                              }
                                              placeholder="Enter English question"
                                              required
                                            />
                                          </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                          <Form.Group>
                                            <Form.Label>
                                              {t("questionUrdu")} (Optional)
                                            </Form.Label>
                                            <Form.Control
                                              type="text"
                                              size="sm"
                                              value={
                                                question.questions?.ur || ""
                                              }
                                              onChange={(e) =>
                                                updateQuestion(
                                                  quizIndex,
                                                  questionIndex,
                                                  "questions",
                                                  "ur",
                                                  e.target.value
                                                )
                                              }
                                              placeholder="اردو سوال داخل کریں"
                                              dir="rtl"
                                            />
                                          </Form.Group>
                                        </Col>
                                      </Row>

                                      {/* Bilingual Options */}
                                      <Form.Group className="mb-2">
                                        <Form.Label>
                                          {t("options")} (4 Fixed Options)
                                        </Form.Label>
                                        {question.options.map(
                                          (option, optionIndex) => (
                                            <Row
                                              key={optionIndex}
                                              className="mb-2 align-items-center"
                                            >
                                              <Col md={5}>
                                                <Form.Control
                                                  type="text"
                                                  size="sm"
                                                  value={option.en || ""}
                                                  onChange={(e) =>
                                                    updateQuestionOption(
                                                      quizIndex,
                                                      questionIndex,
                                                      optionIndex,
                                                      "en",
                                                      e.target.value
                                                    )
                                                  }
                                                  placeholder={`English option ${
                                                    optionIndex + 1
                                                  } *`}
                                                  required
                                                />
                                              </Col>
                                              <Col md={5}>
                                                <Form.Control
                                                  type="text"
                                                  size="sm"
                                                  value={option.ur || ""}
                                                  onChange={(e) =>
                                                    updateQuestionOption(
                                                      quizIndex,
                                                      questionIndex,
                                                      optionIndex,
                                                      "ur",
                                                      e.target.value
                                                    )
                                                  }
                                                  placeholder={`اردو آپشن ${
                                                    optionIndex + 1
                                                  }`}
                                                  dir="rtl"
                                                />
                                              </Col>
                                              <Col md={2}>
                                                <Form.Check
                                                  type="radio"
                                                  name={`correct_${quizIndex}_${questionIndex}`}
                                                  checked={
                                                    question.correctAnswer ===
                                                    optionIndex
                                                  }
                                                  onChange={() =>
                                                    updateQuestion(
                                                      quizIndex,
                                                      questionIndex,
                                                      "correctAnswer",
                                                      "",
                                                      optionIndex
                                                    )
                                                  }
                                                  title={t("correctAnswer")}
                                                  label="Correct"
                                                />
                                              </Col>
                                            </Row>
                                          )
                                        )}
                                      </Form.Group>

                                      {/* Bilingual Explanation */}
                                      <Row className="mb-2">
                                        <Col md={6}>
                                          <Form.Group>
                                            <Form.Label>
                                              {t("explanationEnglish")} *
                                              (Required)
                                            </Form.Label>
                                            <Form.Control
                                              as="textarea"
                                              rows={2}
                                              size="sm"
                                              value={
                                                question.explanations?.en || ""
                                              }
                                              onChange={(e) =>
                                                updateQuestion(
                                                  quizIndex,
                                                  questionIndex,
                                                  "explanations",
                                                  "en",
                                                  e.target.value
                                                )
                                              }
                                              placeholder="Enter English explanation"
                                              required
                                            />
                                          </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                          <Form.Group>
                                            <Form.Label>
                                              {t("explanationUrdu")} (Optional)
                                            </Form.Label>
                                            <Form.Control
                                              as="textarea"
                                              rows={2}
                                              size="sm"
                                              value={
                                                question.explanations?.ur || ""
                                              }
                                              onChange={(e) =>
                                                updateQuestion(
                                                  quizIndex,
                                                  questionIndex,
                                                  "explanations",
                                                  "ur",
                                                  e.target.value
                                                )
                                              }
                                              placeholder="اردو وضاحت داخل کریں"
                                              dir="rtl"
                                            />
                                          </Form.Group>
                                        </Col>
                                      </Row>
                                    </Card.Body>
                                  </Card>
                                )
                              )}
                            </Card.Body>
                          </Card>
                        ))}
                      </Accordion.Body>
                    </Accordion.Item>
                  </Accordion>
                </div>
              </Form>
            )}

            {/* Course Forms - Simplified */}
            {(modalType === "add-course" || modalType === "edit-course") && (
              <Form>
                {/* Bilingual Title Fields */}
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>{t("titleEnglish")} * (Required)</Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.titles?.en || ""}
                        onChange={(e) =>
                          updateBilingualField("titles", "en", e.target.value)
                        }
                        placeholder="Enter English title"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>{t("titleUrdu")} (Optional)</Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.titles?.ur || ""}
                        onChange={(e) =>
                          updateBilingualField("titles", "ur", e.target.value)
                        }
                        placeholder="اردو ٹائٹل داخل کریں"
                        dir="rtl"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>{t("image")} Path</Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.image || "/assets/cap.png"}
                        onChange={(e) =>
                          updateFormData("image", e.target.value)
                        }
                        placeholder="Enter image path (e.g., /assets/cap.png)"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Form>
            )}

            {/* Course Level Forms - Now ALL level forms have course selection */}
            {(modalType === "add-level" ||
              modalType === "add-level-standalone" ||
              modalType === "edit-level") && (
              <Form>
                {/* Course Selection - Available in ALL level forms */}
                <Row className="mb-3">
                  <Col>
                    <Form.Group>
                      <Form.Label>Select Course *</Form.Label>
                      <Form.Select
                        value={formData.courseId || ""}
                        onChange={(e) =>
                          updateFormData("courseId", parseInt(e.target.value))
                        }
                        disabled={modalType === "edit-level"}
                      >
                        <option value="">{t("chooseCourse")}</option>
                        {courses.map((course) => (
                          <option key={course.id} value={course.id}>
                            {getDisplayTitle(course)} ({t("id")}: {course.id})
                          </option>
                        ))}
                      </Form.Select>
                      {modalType === "edit-level" && (
                        <Form.Text className="text-muted">
                          Course cannot be changed when editing
                        </Form.Text>
                      )}
                    </Form.Group>
                  </Col>
                </Row>

                {/* Bilingual Title Fields */}
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>{t("titleEnglish")} * (Required)</Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.titles?.en || ""}
                        onChange={(e) =>
                          updateBilingualField("titles", "en", e.target.value)
                        }
                        placeholder="Enter English title"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>{t("titleUrdu")} (Optional)</Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.titles?.ur || ""}
                        onChange={(e) =>
                          updateBilingualField("titles", "ur", e.target.value)
                        }
                        placeholder="اردو ٹائٹل داخل کریں"
                        dir="rtl"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Bilingual Subtitle Fields */}
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>
                        {t("subtitleEnglish")} * (Required)
                      </Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.subtitles?.en || ""}
                        onChange={(e) =>
                          updateBilingualField(
                            "subtitles",
                            "en",
                            e.target.value
                          )
                        }
                        placeholder="Enter English subtitle"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>{t("subtitleUrdu")} (Optional)</Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.subtitles?.ur || ""}
                        onChange={(e) =>
                          updateBilingualField(
                            "subtitles",
                            "ur",
                            e.target.value
                          )
                        }
                        placeholder="اردو ذیلی سرخی داخل کریں"
                        dir="rtl"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>{t("level")}</Form.Label>
                      <Form.Select
                        value={formData.level || 1}
                        onChange={(e) =>
                          updateFormData("level", parseInt(e.target.value))
                        }
                      >
                        {[1, 2, 3, 4, 5].map((level) => (
                          <option key={level} value={level}>
                            {t("level")} {level}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>{t("status")}</Form.Label>
                      <Form.Select
                        value={formData.status || "locked"}
                        onChange={(e) =>
                          updateFormData("status", e.target.value)
                        }
                      >
                        <option value="locked">{t("locked")}</option>
                        <option value="inProgress">{t("inProgress")}</option>
                        <option value="completed">{t("completed")}</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>{t("duration")}</Form.Label>
                      <Form.Select
                        value={formData.estimatedDuration || "duration1"}
                        onChange={(e) =>
                          updateFormData("estimatedDuration", e.target.value)
                        }
                      >
                        <option value="duration1">{t("duration1")}</option>
                        <option value="duration2">{t("duration2")}</option>
                        <option value="duration3">{t("duration3")}</option>
                        <option value="duration4">{t("duration4")}</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
              </Form>
            )}

            {/* View Mode */}
            {modalType === "view" && (
              <div>
                <pre
                  style={{
                    backgroundColor: "#f8f9fa",
                    padding: "15px",
                    borderRadius: "5px",
                    fontSize: "12px",
                  }}
                >
                  {JSON.stringify(selectedItem, null, 2)}
                </pre>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={closeModal}>
              {t("cancel")}
            </Button>
            {modalType !== "view" && (
              <Button
                variant="primary"
                onClick={saveData}
                disabled={modalType === "bulk" && (!selectedCourseId || !selectedLevelId)}
              >
                <Save size={16} className={isRTL ? "ms-1" : "me-1"} />
                {modalType === "bulk"
                  ? `${t("saveAll")} (${getTotalItems()} ${t(
                      "items"
                    )}, ${getTotalQuestions()} ${t("questions")})`
                  : t("save")}
              </Button>
            )}
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default Dashboard;