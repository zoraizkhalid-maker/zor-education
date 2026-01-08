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
import { Plus, Edit, Trash2, Eye, Save, X, Copy, BookOpen } from "lucide-react";
import Header from "./Header";
import { useLanguage } from "./LanguageContext";
import { useAuth } from "./context/AuthContext";
import RichTextEditor from "./components/RichTextEditor";
import "./styles/dashboard.css";

const Dashboard = () => {
  const { t, isRTL, currentLanguage } = useLanguage();
  const {
    createCourse,
    updateCourse,
    deleteCourse,
    fetchAllCourses,
    createCourseLevel,
    updateCourseLevel,
    deleteCourseLevel,
    fetchAllCourseLevels,
    addLessonsToLevel,
    updateLessonInLevel,
    deleteLessonFromLevel,
    fetchAllLessons,
    uploadFile
  } = useAuth();

  const [activeTab, setActiveTab] = useState("courses");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [bulkLessons, setBulkLessons] = useState([]);
  const [bulkQuizzes, setBulkQuizzes] = useState([]);
  const [selectedLevelId, setSelectedLevelId] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableLevel, setAvailableLevel] = useState("");
  const [levelExists, setLevelExists] = useState(false);

  const [courses, setCourses] = useState([]);
  const [courseLevels, setCourseLevels] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    await Promise.all([
      loadCourses(),
      loadCourseLevels(),
      loadLessons()
    ]);
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

  const createEmptyLesson = () => ({
    titles: { en: "", ur: "" },
    subtitleKey: "lesson",
    type: "lesson",
    content: {
      descriptions: { en: "", ur: "" },
      points: [{ en: "", ur: "" }],
    },
  });

  const createEmptyQuiz = (parentLessonId = null) => ({
    id: `temp_quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Generate unique temp ID
    titles: { en: "Quiz", ur: "کوئز" },
    subtitleKey: "mcq",
    type: "quiz",
    parentLessonId: parentLessonId,
    content: {
      descriptions: { en: "Quiz", ur: "کوئز" },
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
    active: true,
    courseNumber: generateNextCourseNumber()
  });

  const generateNextCourseNumber = () => {
    if (courses.length === 0) return "0001";
    
    const existingNumbers = courses
      .map(course => course.courseNumber)
      .filter(num => num && typeof num === 'string' && /^\d{4}$/.test(num))
      .map(num => parseInt(num, 10));
    
    if (existingNumbers.length === 0) return "0001";
    
    const maxNumber = Math.max(...existingNumbers);
    return String(maxNumber + 1).padStart(4, '0');
  };

  const createEmptyLevel = () => ({
    titles: { en: "", ur: "" },
    subtitles: { en: "", ur: "" },
    level: 1,
    estimated_duration: "30 - 45 minutes",
  });

  const getDisplayTitle = (item) => {
    if (!item) {
      return "Unknown Item";
    }
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

  const getFilteredCourseLevels = () => {
    if (!selectedCourseId) return getValidCourseLevels();
    return getValidCourseLevels().filter(
      (level) => level.courseId === selectedCourseId
    );
  };

  // Helper function to get only course levels that have valid courses
  const getValidCourseLevels = () => {
    const validCourseIds = courses.filter(course => course && course.id).map(course => course.id);
    return courseLevels.filter(level => level && level.courseId && validCourseIds.includes(level.courseId));
  };

  // Helper function to get the next available level for a course
  const getNextAvailableLevel = (courseId) => {
    const courseLevelsList = getValidCourseLevels()
      .filter(level => level.courseId === courseId)
      .map(level => level.level || 1)
      .sort((a, b) => a - b);
    
    if (courseLevelsList.length === 0) {
      return 1;
    }
    
    // Find the first gap in sequence or return next increment
    for (let i = 1; i <= courseLevelsList.length + 1; i++) {
      if (!courseLevelsList.includes(i)) {
        return i;
      }
    }
    
    return courseLevelsList[courseLevelsList.length - 1] + 1;
  };

  // Helper function to check if a level already exists for a course
  const isLevelExists = (courseId, level, excludeLevelId = null) => {
    return getValidCourseLevels().some(l => 
      l.courseId === courseId && 
      l.level === level && 
      l.id !== excludeLevelId
    );
  };

  // Helper function to get course levels grouped by course
  const getCourseLevelsGrouped = () => {
    const grouped = {};
    // Only process courses that exist and are valid
    const validCourses = courses.filter(course => course && course.id);
    validCourses.forEach(course => {
      const levels = courseLevels
        .filter(level => level && level.courseId === course.id)
        .sort((a, b) => (a.level || 1) - (b.level || 1));
      if (levels.length > 0) {
        grouped[course.id] = {
          course,
          levels,
          count: levels.length
        };
      }
    });
    return grouped;
  };

  // Helper function to generate automatic lesson name
  const generateLessonName = (levelNumber, lessonIndex, type = 'lesson') => {
    if (type === 'quiz') {
      return `Quiz ${lessonIndex + 1}`;
    }
    return `Lesson ${levelNumber || 1}.${lessonIndex + 1}`;
  };

  // Helper function to generate quiz name linked to a specific lesson
  const generateQuizNameForLesson = (levelNumber, lessonNumber, quizIndex) => {
    return `Quiz ${levelNumber}.${lessonNumber}.${quizIndex + 1}`;
  };

  // Helper function to get lesson number from lesson name
  const getLessonNumberFromName = (lessonName) => {
    const match = lessonName.match(/Lesson (\d+)\.(\d+)/);
    if (match) {
      return { levelNumber: parseInt(match[1]), lessonNumber: parseInt(match[2]) };
    }
    return { levelNumber: 1, lessonNumber: 1 };
  };

  // Helper function to get next lesson number for a level
  const getNextLessonNumber = (levelId, type = 'lesson') => {
    const levelLessons = lessons.filter(l => l.levelId === levelId && l.type === type);
    return levelLessons.length;
  };

  // Helper function to get next quiz number for a specific lesson
  const getNextQuizNumberForLesson = (parentLessonId) => {
    if (!parentLessonId) return 0;
    const lessonQuizzes = lessons.filter(l => l.type === 'quiz' && l.parentLessonId === parentLessonId);
    return lessonQuizzes.length;
  };

  // Helper function to get lessons grouped by level and course
  const getLessonsGroupedByLevel = () => {
    const grouped = {};
    // Only process levels that have valid courses
    const validLevels = getValidCourseLevels();
    validLevels.forEach(level => {
      const course = courses.find(c => c && c.id === level.courseId);
      // Skip levels where the course no longer exists
      if (!course) {
        console.warn(`Skipping level ${level.id} - course ${level.courseId} not found`);
        return;
      }
      
      const levelLessons = lessons
        .filter(lesson => lesson && lesson.levelId === level.id)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
      
      if (!grouped[level.courseId]) {
        grouped[level.courseId] = {
          course,
          levels: []
        };
      }
      
      grouped[level.courseId].levels.push({
        level,
        lessons: levelLessons,
        lessonCount: levelLessons.filter(l => l && l.type === 'lesson').length,
        quizCount: levelLessons.filter(l => l && l.type === 'quiz').length
      });
    });
    
    return grouped;
  };

  const openModal = (type, item = null, contextCourseId = null, contextLevelId = null) => {
    setModalType(type);
    setSelectedItem(item);

    if (type === "bulk") {
      // Use passed context or current selected values
      const courseId = contextCourseId || selectedCourseId || "";
      const levelId = contextLevelId || selectedLevelId || "";
      
      // Set the selected values for the modal
      setSelectedCourseId(courseId);
      setSelectedLevelId(levelId);
      
      // Create initial lesson with linked quizzes
      const newLesson = createEmptyLesson();
      
      // Auto-generate internal lesson name based on level
      if (levelId && courseId) {
        const level = courseLevels.find(l => l.id === levelId);
        if (level) {
          const existingLessonCount = getNextLessonNumber(levelId, 'lesson');
          const lessonName = `${level.level}.${existingLessonCount + 1}`;
          
          // Store the auto-generated name internally but let user add custom title
          newLesson.autoName = lessonName;
          newLesson.internalId = lessonName; // For system reference
        }
      }
      
      // Generate temporary ID for the lesson to link quizzes
      newLesson.tempId = `temp_lesson_${Date.now()}`;
      
      setBulkLessons([newLesson]);
      setBulkQuizzes([]); // Start with no quizzes, they'll be added per lesson
    } else if (type === "add-course") {
      setFormData(createEmptyCourse());
    } else if (type === "edit-course") {
      setFormData({ ...item });
    } else if (type === "add-level") {
      const newFormData = createEmptyLevel();
      if (item && item.id) {
        newFormData.courseId = item.id;
        const nextLevel = getNextAvailableLevel(item.id);
        newFormData.level = nextLevel;
        setAvailableLevel(nextLevel);
      }
      setFormData(newFormData);
    } else if (type === "add-level-standalone") {
      const newFormData = createEmptyLevel();
      // Level will be set dynamically when course is selected
      setAvailableLevel("");
      setFormData(newFormData);
    } else if (type === "edit-level") {
      setFormData({ ...item });
      // Auto-select the course for the level
      setSelectedCourseId(item.courseId);
    } else if (type === "edit-lesson") {
      setFormData({ ...item });
      
      // Populate bulkLessons with the lesson being edited
      const editLesson = { ...item };
      if (!editLesson.tempId) {
        editLesson.tempId = `temp_lesson_${Date.now()}_edit`;
      }
      setBulkLessons([editLesson]);
      
      // Find and populate existing quizzes for this lesson
      const existingQuizzes = lessons.filter(lesson => 
        lesson.type === 'quiz' && 
        (lesson.parentLessonId === item.id || lesson.parentLessonId?.includes(item.id))
      );
      
      // Convert existing quizzes to have the correct parentLessonId for the edit session
      // Mark them as existing so we can distinguish them from new ones later
      const editableQuizzes = existingQuizzes.map(quiz => ({
        ...quiz,
        parentLessonId: editLesson.tempId,
        __originallyExisting: true, // Flag to mark this as originally existing
        __originalId: quiz.id // Keep track of original ID
      }));
      
      setBulkQuizzes(editableQuizzes);
      
    } else if (type === "add-quiz-to-lesson") {
      // Initialize for adding a quiz to specific lesson
      const lesson = item; // The lesson we're adding quiz to
      setFormData(createEmptyQuiz(lesson.id)); // Create quiz with lesson's real ID as parentLessonId
      setSelectedCourseId(lesson.courseId);
      setSelectedLevelId(lesson.levelId);
    } else if (type === "edit-quiz") {
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
    setAvailableLevel("");
    setLevelExists(false);
    setIsSubmitting(false);
  };

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateBilingualField = (field, language, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        [language]: value,
      },
    }));
  };

  const updateNestedField = (fieldPath, value) => {
    setFormData((prev) => {
      const newFormData = { ...prev };
      const keys = fieldPath.split('.');
      let current = newFormData;
      
      // Navigate to the parent of the final key
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      
      // Set the final value
      current[keys[keys.length - 1]] = value;
      return newFormData;
    });
  };

  const handleCourseSelectionChange = (courseId) => {
    setSelectedCourseId(courseId);
    setSelectedLevelId("");
  };

  const addLesson = () => {
    setBulkLessons((prev) => {
      const newLesson = createEmptyLesson();
      
      // Auto-generate internal lesson name based on level
      if (selectedLevelId) {
        const level = courseLevels.find(l => l.id === selectedLevelId);
        if (level) {
          const currentLessonCount = prev.length;
          const existingLessonCount = getNextLessonNumber(selectedLevelId, 'lesson');
          const totalLessonIndex = existingLessonCount + currentLessonCount;
          const lessonName = `${level.level}.${totalLessonIndex + 1}`;
          
          // Store the auto-generated name internally but let user add custom title
          newLesson.autoName = lessonName;
          newLesson.internalId = lessonName; // For system reference
        }
      }
      
      // Generate temporary ID for linking quizzes
      const currentLessonCount = prev.length;
      newLesson.tempId = `temp_lesson_${Date.now()}_${currentLessonCount}`;
      
      return [...prev, newLesson];
    });
  };

  const removeLesson = (index) => {
    if (bulkLessons.length > 1) {
      const lessonToRemove = bulkLessons[index];
      
      // Remove the lesson
      setBulkLessons((prev) => prev.filter((_, i) => i !== index));
      
      // Remove associated quizzes
      if (lessonToRemove.tempId) {
        setBulkQuizzes((prev) => prev.filter(quiz => quiz.parentLessonId !== lessonToRemove.tempId));
      }
    }
  };

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

  // Add quiz to a specific lesson
  const addQuizToLesson = (lessonIndex) => {
    const lesson = bulkLessons[lessonIndex];
    if (!lesson || !lesson.tempId) {
      console.error('❌ addQuizToLesson: Invalid lesson or missing tempId:', { lesson, lessonIndex });
      return;
    }
    
    console.log('📝 Adding quiz to lesson:', lesson.tempId);
    
    setBulkQuizzes((prev) => {
      const newQuiz = createEmptyQuiz(lesson.tempId);
      console.log('📝 Created new quiz:', newQuiz);
      console.log('📝 Previous bulkQuizzes:', prev);
      const updated = [...prev, newQuiz];
      console.log('📝 Updated bulkQuizzes:', updated);
      return updated;
    });
  };

  // Legacy function for backward compatibility - adds quiz to first lesson
  const addQuiz = () => {
    if (bulkLessons.length > 0) {
      addQuizToLesson(0);
    }
  };

  const removeQuiz = (index) => {
    if (bulkQuizzes.length > 1) {
      setBulkQuizzes((prev) => prev.filter((_, i) => i !== index));
    }
  };

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
    
    // Clear titles for user to add new ones
    lessonToCopy.titles = { en: "", ur: "" };
    
    // Generate new auto name for duplicated lesson
    if (selectedLevelId) {
      const level = courseLevels.find(l => l.id === selectedLevelId);
      if (level) {
        const currentLessonCount = bulkLessons.length;
        const existingLessonCount = getNextLessonNumber(selectedLevelId, 'lesson');
        const totalLessonIndex = existingLessonCount + currentLessonCount;
        const lessonName = `${level.level}.${totalLessonIndex + 1}`;
        
        lessonToCopy.autoName = lessonName;
        lessonToCopy.internalId = lessonName;
      }
    }
    
    // Generate new temporary ID
    lessonToCopy.tempId = `temp_lesson_${Date.now()}_${bulkLessons.length}`;
    
    setBulkLessons((prev) => [...prev, lessonToCopy]);
  };

  const duplicateQuiz = (index) => {
    const quizToCopy = { ...bulkQuizzes[index] };
    
    if (quizToCopy.parentLessonId) {
      // Find the parent lesson to get naming info
      const parentLesson = bulkLessons.find(l => l.tempId === quizToCopy.parentLessonId);
      if (parentLesson) {
        const lessonNumbers = getLessonNumberFromName(parentLesson.titles.en || parentLesson.titles.ur || '');
        const existingQuizzesForLesson = bulkQuizzes.filter(q => q.parentLessonId === quizToCopy.parentLessonId);
        const quizIndex = existingQuizzesForLesson.length;
        
        const quizName = generateQuizNameForLesson(
          lessonNumbers.levelNumber, 
          lessonNumbers.lessonNumber, 
          quizIndex
        );
        
        quizToCopy.titles = { en: quizName, ur: quizName };
      }
    }
    
    setBulkQuizzes((prev) => [...prev, quizToCopy]);
  };

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
      }

      if (type === "Quiz") {

        for (let j = 0; j < item.content.questions.length; j++) {
          const question = item.content.questions[j];
          if (!question.questions?.en) {
            alert(
              `${type} ${i + 1}, Question ${j + 1
              }: English question is required`
            );
            return false;
          }

          const hasAllEnglishOptions = question.options.every(
            (option) => option.en
          );
          if (!hasAllEnglishOptions) {
            alert(
              `${type} ${i + 1}, Question ${j + 1
              }: All English options are required`
            );
            return false;
          }

          if (!question.explanations?.en) {
            alert(
              `${type} ${i + 1}, Question ${j + 1
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
    if (!formData.level) {
      alert("Level is required");
      return false;
    }
    
    // Check for level conflicts
    const excludeLevelId = modalType === "edit-level" ? selectedItem?.id : null;
    if (isLevelExists(formData.courseId, formData.level, excludeLevelId)) {
      const course = courses.find(c => c.id === formData.courseId);
      const courseName = getDisplayTitle(course) || "this course";
      alert(`Level ${formData.level} already exists for ${courseName}. Please choose a different level.`);
      return false;
    }
    
    return true;
  };

  const handleImageUpload = async (file) => {
    if (!file) return null;

    const fileName = `courses/${Date.now()}_${file.name}`;
    const result = await uploadFile(file, fileName);

    if (result.success) {
      return result.downloadURL;
    }
    return null;
  };

  const saveAllData = async () => {
    if (!selectedLevelId) {
      alert("Please select a course level");
      return;
    }

    if (
      !validateBilingualFields(bulkLessons, "Lesson") ||
      !validateBilingualFields(bulkQuizzes, "Quiz")
    ) {
      return;
    }

    setIsSubmitting(true);

    const allItems = [...bulkLessons, ...bulkQuizzes];

    const selectedLevel = courseLevels.find(level => level.id === selectedLevelId);
    if (!selectedLevel) {
      alert("Selected level not found");
      setIsSubmitting(false);
      return;
    }

    const result = await addLessonsToLevel(selectedLevel.courseId, selectedLevelId, allItems);

    if (result.success) {
      await loadLessons();
      closeModal();
    }

    setIsSubmitting(false);
  };

  const saveData = async () => {
    if (modalType === "bulk") {
      await saveAllData();
    } else if (modalType === "add-course") {
      if (!validateCourseFields()) return;

      setIsSubmitting(true);

      let courseData = { ...formData };

      if (formData.imageFile) {
        const imageUrl = await handleImageUpload(formData.imageFile);
        if (imageUrl) {
          courseData.image = imageUrl;
        }
        delete courseData.imageFile;
      }

      const result = await createCourse(courseData);
      if (result.success) {
        await loadCourses();
        closeModal();
      }

      setIsSubmitting(false);
    } else if (modalType === "edit-course") {
      if (!validateCourseFields()) return;

      setIsSubmitting(true);

      let courseData = { ...formData };

      if (formData.imageFile) {
        const imageUrl = await handleImageUpload(formData.imageFile);
        if (imageUrl) {
          courseData.image = imageUrl;
        }
        delete courseData.imageFile;
      }

      delete courseData.id;
      delete courseData.created_at;
      delete courseData.updated_at;

      const result = await updateCourse(selectedItem.id, courseData);
      if (result.success) {
        await loadCourses();
        closeModal();
      }

      setIsSubmitting(false);
    } else if (
      modalType === "add-level" ||
      modalType === "add-level-standalone"
    ) {
      if (!validateLevelFields()) return;

      setIsSubmitting(true);

      const result = await createCourseLevel(formData.courseId, formData);
      if (result.success) {
        await loadCourseLevels();
        closeModal();
      }

      setIsSubmitting(false);
    } else if (modalType === "edit-level") {
      if (!validateLevelFields()) return;

      setIsSubmitting(true);

      let levelData = { ...formData };
      delete levelData.id;
      delete levelData.created_at;
      delete levelData.updated_at;

      const result = await updateCourseLevel(selectedItem.courseId, selectedItem.id, levelData);
      if (result.success) {
        await loadCourseLevels();
        closeModal();
      }

      setIsSubmitting(false);
    } else if (modalType === "edit-lesson") {
      if (!formData.titles?.en) {
        alert("English title is required");
        return;
      }
      if (!formData.content?.descriptions?.en) {
        alert("English description is required");
        return;
      }

      setIsSubmitting(true);

      // Find the lesson in the lessons array to get courseId and levelId
      const lesson = lessons.find(l => l.id === selectedItem.id);
      if (lesson) {
        // First update the lesson itself
        const result = await updateLessonInLevel(lesson.courseId, lesson.levelId, formData);
        if (result.success) {
          
          // Check what's in bulkQuizzes before filtering
          console.log('🔍 DEBUG: bulkQuizzes before filtering:', bulkQuizzes);
          console.log('🔍 DEBUG: existing lessons:', lessons.map(l => ({ id: l.id, type: l.type, title: l.titles?.en })));
          
          // Then save any new quizzes that were added in edit mode
          const newQuizzes = bulkQuizzes.filter(quiz => {
            // Use the flag we set to identify originally existing quizzes
            const isOriginallyExisting = quiz.__originallyExisting === true;
            const isNew = !isOriginallyExisting;
            console.log(`🔍 DEBUG: Quiz ${quiz.id || 'no-id'} is ${isNew ? 'NEW' : 'EXISTING'} (originallyExisting: ${isOriginallyExisting})`);
            return isNew;
          });
          
          console.log('🔍 DEBUG: Filtered new quizzes:', newQuizzes);
          
          if (newQuizzes.length > 0) {
            console.log(`📝 Saving ${newQuizzes.length} new quizzes added in edit mode`);
            
            // Convert bulkQuizzes back to have the real lesson ID as parentLessonId
            const quizzesWithCorrectParentId = newQuizzes.map(quiz => {
              const cleanQuiz = { ...quiz };
              // Remove temporary ID so Firebase can assign a real one
              if (cleanQuiz.id && cleanQuiz.id.toString().startsWith('temp_quiz_')) {
                delete cleanQuiz.id;
              }
              // Clean up our temporary flags
              delete cleanQuiz.__originallyExisting;
              delete cleanQuiz.__originalId;
              // Use the actual lesson ID, not tempId
              cleanQuiz.parentLessonId = selectedItem.id;
              return cleanQuiz;
            });
            
            console.log('🔍 DEBUG: Quizzes with correct parent ID:', quizzesWithCorrectParentId);
            
            // Save each new quiz
            for (const quiz of quizzesWithCorrectParentId) {
              console.log('💾 Attempting to save quiz:', quiz);
              const quizResult = await addLessonsToLevel(lesson.courseId, lesson.levelId, [quiz]);
              console.log('💾 Quiz save result:', quizResult);
              if (!quizResult.success) {
                console.error('❌ Failed to save new quiz:', quiz);
              } else {
                console.log('✅ Successfully saved quiz:', quiz.titles?.en);
              }
            }
          }
          // else {
          //   console.log('⚠️ No new quizzes detected in bulkQuizzes');
          // }
          
          await loadLessons();
          closeModal();
        }
      } else {
        alert("Lesson not found");
      }

      setIsSubmitting(false);
    } else if (modalType === "add-quiz-to-lesson") {
      setIsSubmitting(true);

      console.log('🆕 Add Quiz to Lesson - Starting...');
      console.log('🆕 Selected lesson:', selectedItem);
      console.log('🆕 Quiz form data:', formData);

      // The quiz should already have the correct parentLessonId from openModal
      const lesson = selectedItem;
      console.log('🆕 Adding quiz to lesson:', lesson.id, 'in courseId:', lesson.courseId, 'levelId:', lesson.levelId);
      
      const result = await addLessonsToLevel(lesson.courseId, lesson.levelId, [formData]);
      console.log('🆕 Add quiz result:', result);
      
      if (result.success) {
        console.log('🆕 Quiz added successfully, refreshing lessons...');
        await loadLessons();
        console.log('🆕 Lessons refreshed, closing modal');
        closeModal();
      } else {
        console.error('🆕 Failed to add quiz:', result);
      }

      setIsSubmitting(false);
    } else if (modalType === "edit-quiz") {
      setIsSubmitting(true);

      console.log('🔧 Edit Quiz Save - Starting...');
      console.log('🔧 Selected item:', selectedItem);
      console.log('🔧 Form data:', formData);

      // Find the quiz in the lessons array to get courseId and levelId
      const quiz = lessons.find(l => l.id === selectedItem.id);
      console.log('🔧 Found quiz in lessons:', quiz);
      
      if (quiz) {
        console.log('🔧 Updating quiz with courseId:', quiz.courseId, 'levelId:', quiz.levelId);
        const result = await updateLessonInLevel(quiz.courseId, quiz.levelId, formData);
        console.log('🔧 Update result:', result);
        
        if (result.success) {
          console.log('🔧 Quiz updated successfully, refreshing lessons...');
          await loadLessons();
          console.log('🔧 Lessons refreshed, closing modal');
          closeModal();
        } else {
          console.error('🔧 Failed to update quiz:', result);
        }
      } else {
        console.error('🔧 Quiz not found in lessons array');
        alert("Quiz not found");
      }

      setIsSubmitting(false);
    }
  };

  const deleteItem = async (id, type) => {
    if (!window.confirm(t("confirmDelete"))) return;

    if (type === "course") {
      const result = await deleteCourse(id);
      if (result.success) {
        await Promise.all([loadCourses(), loadCourseLevels(), loadLessons()]);
      }
    } else if (type === "level") {
      const level = courseLevels.find(l => l.id === id);
      if (level) {
        const result = await deleteCourseLevel(level.courseId, id);
        if (result.success) {
          await Promise.all([loadCourseLevels(), loadLessons()]);
        }
      }
    } else if (type === "lesson") {
      const lesson = lessons.find(l => l.id === id);
      if (lesson) {
        const result = await deleteLessonFromLevel(lesson.courseId, lesson.levelId, id);
        if (result.success) {
          await loadLessons();
        }
      }
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
          <Tab eventKey="courses" title={t("coursesManagement")}>
            <div className="tab-content-wrapper">
              <div className="tab-header">
                <div className="d-flex justify-content-between align-items-center w-100">
                  <h3 className="mb-0">
                    {t("courses")} ({courses.length})
                  </h3>
                  <Button
                    variant="primary"
                    onClick={() => openModal("add-course")}
                    className="btn-add-course"
                  >
                    {t("addCourse")}
                  </Button>
                </div>
              </div>

              <Card className="courses-management-card">
                <Card.Body className="p-0">
                  {courses.length === 0 ? (
                    <div className="empty-state text-center py-5">
                      <div className="empty-state-icon mb-3">
                        <img 
                          src="/assets/cap.png" 
                          alt="No courses" 
                          style={{ width: '64px', height: '64px', opacity: 0.5 }}
                        />
                      </div>
                      <h5 className="text-muted mb-2">{t("noCoursesFound") || "No Courses Found"}</h5>
                      <p className="text-muted small">{t("createFirstCourse") || "Create your first course to get started"}</p>
                      <Button
                        variant="primary"
                        onClick={() => openModal("add-course")}
                        className="mt-2"
                      >
                        {t("createFirstCourse") || "Create First Course"}
                      </Button>
                    </div>
                  ) : (
                    <div className="courses-grid">
                      {courses.map((course, index) => {
                        const levelCount = getValidCourseLevels().filter(l => l.courseId === course.id).length;
                        const courseLevelsList = getValidCourseLevels().filter(l => l.courseId === course.id);
                        const totalLessons = courseLevelsList.reduce((sum, level) => sum + (level.lessons?.length || 0), 0);
                        const totalQuizzes = courseLevelsList.reduce((sum, level) => 
                          sum + (level.lessons?.filter(l => l.type === 'quiz').length || 0), 0
                        );
                        const totalRegularLessons = courseLevelsList.reduce((sum, level) => 
                          sum + (level.lessons?.filter(l => l.type === 'lesson').length || 0), 0
                        );
                        
                        return (
                          <Card key={course.id} className="course-item-card shadow-sm hover-shadow">
                            <div className="course-card-header">
                              <div className="course-image-wrapper">
                                <img
                                  src={course.image || "/assets/cap.png"}
                                  alt={getDisplayTitle(course)}
                                  className="course-thumbnail"
                                />
                                <div className="course-status-overlay">
                                  <Badge
                                    bg={course.active ? "success" : "secondary"}
                                    className="status-badge"
                                  >
                                    {course.active ? t("active") : t("inactive")}
                                  </Badge>
                                </div>
                              </div>
                              <div className="course-info">
                                <h5 className="course-title">{getDisplayTitle(course) || `Course ${index + 1}`}</h5>
                                <div className="course-meta">
                                  <small className="text-muted">
                                    Created: {course.created_at ? new Date(course.created_at.seconds * 1000).toLocaleDateString() : 'N/A'}
                                  </small>
                                </div>
                              </div>
                            </div>
                            
                            <div className="course-card-body">
                              <div className="course-stats-enhanced">
                                <div className="row text-center">
                                  <div className="col-3">
                                    <div className="stat-item-enhanced">
                                      <div className="stat-number text-primary">{levelCount}</div>
                                      <div className="stat-label-small">Levels</div>
                                    </div>
                                  </div>
                                  <div className="col-3">
                                    <div className="stat-item-enhanced">
                                      <div className="stat-number text-success">{totalRegularLessons}</div>
                                      <div className="stat-label-small">Lessons</div>
                                    </div>
                                  </div>
                                  <div className="col-3">
                                    <div className="stat-item-enhanced">
                                      <div className="stat-number text-warning">{totalQuizzes}</div>
                                      <div className="stat-label-small">Quizzes</div>
                                    </div>
                                  </div>
                                  <div className="col-3">
                                    <div className="stat-item-enhanced">
                                      <div className="stat-number text-info">{totalLessons}</div>
                                      <div className="stat-label-small">Total</div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              {levelCount > 0 && (
                                <div className="course-levels-preview mt-2 mb-3">
                                  <div className="levels-list">
                                    {courseLevelsList.slice(0, 3).map((level, idx) => (
                                      <Badge key={idx} bg="light" text="dark" className="me-1 mb-1">
                                        Level {level.level}: {getDisplayTitle(level) || `Level ${level.level}`}
                                      </Badge>
                                    ))}
                                    {levelCount > 3 && (
                                      <Badge bg="secondary" className="me-1 mb-1">
                                        +{levelCount - 3} more
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              )}
                              
                              <div className="course-actions-enhanced">
                                <div className="row">
                                  <div className="col-6">
                                    <Button
                                      variant="outline-primary"
                                      size="sm"
                                      onClick={() => openModal("edit-course", course)}
                                      className="w-100 action-btn-edit"
                                    >
                                      <Edit size={14} className="me-1" />
                                      Edit
                                    </Button>
                                  </div>
                                  {/* <div className="col-6">
                                    <Button
                                      variant="outline-success"
                                      size="sm"
                                      onClick={() => openModal("add-level", course)}
                                      className="w-100 action-btn-add-level"
                                    >
                                      <Plus size={14} className="me-1" />
                                      Add Level
                                    </Button>
                                  </div> */}
                                </div>
                                <div className="row mt-2">
                                  {/* <div className="col-6">
                                    <Button
                                      variant="outline-info"
                                      size="sm"
                                      onClick={() => {
                                        if (levelCount > 0) {
                                          const firstLevel = courseLevelsList[0];
                                          openModal("bulk", null, course.id, firstLevel.id);
                                        } else {
                                          alert("Please add a level first before adding lessons.");
                                        }
                                      }}
                                      className="w-100 action-btn-add-lesson"
                                      disabled={levelCount === 0}
                                    >
                                      <BookOpen size={14} className="me-1" />
                                      Add Content
                                    </Button>
                                  </div> */}
                                  <div className="col-6">
                                    <Button
                                      variant="outline-danger"
                                      size="sm"
                                      onClick={() => deleteItem(course.id, "course")}
                                      className="w-100 action-btn-delete"
                                    >
                                      <Trash2 size={14} className="me-1" />
                                      Delete
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </Card.Body>
              </Card>
            </div>
          </Tab>

          <Tab eventKey="levels" title={t("levelsManagement") || "Course Levels Management"}>
            <div className="tab-content-wrapper">
              <div className="tab-header">
                <div className="d-flex justify-content-between align-items-center w-100">
                  <h3 className="mb-0">
                    {t("courseLevels")} ({getValidCourseLevels().length})
                  </h3>
                  <Button
                    variant="primary"
                    onClick={() => openModal("add-level-standalone")}
                    className="btn-add-level"
                  >
                    {t("addCourseLevel") || "Add Course Level"}
                  </Button>
                </div>
              </div>

              <Card className="levels-management-card">
                <Card.Body className="p-0">
                  {Object.keys(getCourseLevelsGrouped()).length === 0 ? (
                    <div className="empty-state text-center py-5">
                      <div className="empty-state-icon mb-3">
                        <img 
                          src="/assets/cap.png" 
                          alt="No levels" 
                          style={{ width: '64px', height: '64px', opacity: 0.5 }}
                        />
                      </div>
                      <h5 className="text-muted mb-2">{t("noLevelsFound") || "No Course Levels Found"}</h5>
                      <p className="text-muted small">{t("addFirstLevel") || "Add your first course level to get started"}</p>
                      <Button
                        variant="primary"
                        onClick={() => openModal("add-level-standalone")}
                        className="mt-2"
                      >
                        {t("addFirstLevel") || "Add First Level"}
                      </Button>
                    </div>
                  ) : (
                    <div className="levels-by-course">
                      {Object.entries(getCourseLevelsGrouped()).map(([courseId, courseData]) => (
                        <div key={courseId} className="course-section">
                          <div className="course-section-header">
                            <div className="d-flex align-items-center">
                              <img
                                src={courseData.course.image || "/assets/cap.png"}
                                alt={getDisplayTitle(courseData.course)}
                                className="course-section-image"
                              />
                              <div>
                                <h5 className="course-section-title">
                                  {getDisplayTitle(courseData.course) || `Course ${courseId.slice(-6)}`}
                                </h5>
                                <p className="course-section-subtitle">
                                  {courseData.count} {t("levels")} • ID: {courseId.slice(-8)}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => openModal("add-level", courseData.course)}
                              className="add-level-btn"
                            >
                              {t("addLevel") || "Add Level"}
                            </Button>
                          </div>
                          
                          <div className="levels-grid">
                            {courseData.levels.map((level) => {
                              const levelLessons = lessons.filter(l => l.levelId === level.id);
                              const lessonCount = levelLessons.filter(l => l.type === 'lesson').length;
                              const quizCount = levelLessons.filter(l => l.type === 'quiz').length;
                              const totalContent = levelLessons.length;
                              
                              return (
                                <Card key={level.id} className="level-item-card shadow-sm hover-shadow">
                                  <div className="level-card-header">
                                    <div className="level-info">
                                      <div className="level-number">
                                        <Badge bg="info" className="level-badge level-badge-large">
                                          {t("level")} {level.level || 1}
                                        </Badge>
                                      </div>
                                      <div className="level-details">
                                        <h6 className="level-title">
                                          {getDisplayTitle(level) || `Level ${level.level || 1}`}
                                        </h6>
                                        <p className="level-subtitle">
                                          {getDisplaySubtitle(level) || 'No description available'}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="level-card-body">
                                    <div className="level-stats-enhanced">
                                      <div className="row text-center">
                                        <div className="col-4">
                                          <div className="stat-item-enhanced">
                                            <div className="stat-number text-success">{lessonCount}</div>
                                            <div className="stat-label-small">Lessons</div>
                                          </div>
                                        </div>
                                        <div className="col-4">
                                          <div className="stat-item-enhanced">
                                            <div className="stat-number text-warning">{quizCount}</div>
                                            <div className="stat-label-small">Quizzes</div>
                                          </div>
                                        </div>
                                        <div className="col-4">
                                          <div className="stat-item-enhanced">
                                            <div className="stat-number text-info">{totalContent}</div>
                                            <div className="stat-label-small">Total</div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div className="level-duration-info mt-2 mb-3">
                                      <div className="d-flex align-items-center justify-content-center">
                                        <Badge bg="light" text="dark" className="duration-badge">
                                          📅 Duration: {level.estimated_duration || level.estimatedDuration || "Not specified"}
                                        </Badge>
                                      </div>
                                    </div>
                                    
                                    <div className="level-actions-enhanced">
                                      <div className="row">
                                        <div className="col-6">
                                          <Button
                                            variant="outline-primary"
                                            size="sm"
                                            onClick={() => openModal("edit-level", level)}
                                            className="w-100 action-btn-edit"
                                          >
                                            <Edit size={14} className="me-1" />
                                            Edit
                                          </Button>
                                        </div>
                                        {/* <div className="col-6">
                                          <Button
                                            variant="outline-info"
                                            size="sm"
                                            onClick={() => openModal("bulk", null, courseId, level.id)}
                                            className="w-100 action-btn-add-content"
                                          >
                                            <BookOpen size={14} className="me-1" />
                                            Add Content
                                          </Button>
                                        </div> */}
                                      </div>
                                      <div className="row mt-2">
                                        <div className="col-12">
                                          <Button
                                            variant="outline-danger"
                                            size="sm"
                                            onClick={() => deleteItem(level.id, "level")}
                                            className="w-100 action-btn-delete"
                                          >
                                            <Trash2 size={14} className="me-1" />
                                            Delete Level
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </Card>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card.Body>
              </Card>
            </div>
          </Tab>

          <Tab eventKey="lessons" title={t("lessonsManagement")}>
            <div className="tab-content-wrapper">
              <div className="tab-header">
                <div className="d-flex justify-content-between align-items-center w-100">
                  <h3 className="mb-0">
                    {t("lessons")} ({lessons.length})
                  </h3>
                  <Button
                    variant="primary"
                    onClick={() => openModal("bulk")}
                    className="btn-add-lesson"
                  >
                    {t("addLessonsQuizzes") || "Add Content"}
                  </Button>
                </div>
              </div>

              <Card className="lessons-management-card">
                <Card.Body className="p-0">
                  {Object.keys(getLessonsGroupedByLevel()).length === 0 ? (
                    <div className="empty-state text-center py-5">
                      <div className="empty-state-icon mb-3">
                        <img 
                          src="/assets/cap.png" 
                          alt="No lessons" 
                          style={{ width: '64px', height: '64px', opacity: 0.5 }}
                        />
                      </div>
                      <h5 className="text-muted mb-2">{t("noLessonsFound") || "No Lessons Found"}</h5>
                      <p className="text-muted small">{t("addFirstLesson") || "Create your first lesson to get started"}</p>
                      <Button
                        variant="primary"
                        onClick={() => openModal("bulk")}
                        className="mt-2"
                      >
                        {t("addFirstLesson") || "Add First Lesson"}
                      </Button>
                    </div>
                  ) : (
                    <div className="lessons-by-course">
                      {Object.entries(getLessonsGroupedByLevel()).map(([courseId, courseData]) => (
                        <div key={courseId} className="course-lessons-section">
                          <div className="course-lessons-header">
                            <div className="d-flex align-items-center">
                              <img
                                src={courseData.course?.image || "/assets/cap.png"}
                                alt={getDisplayTitle(courseData.course)}
                                className="course-lessons-image"
                              />
                              <div>
                                <h5 className="course-lessons-title">
                                  {getDisplayTitle(courseData.course) || `Course ${courseId.slice(-6)}`}
                                </h5>
                                <p className="course-lessons-subtitle">
                                  {courseData.levels.length} {t("levels")} • {courseData.levels.reduce((sum, l) => sum + l.lessons.length, 0)} {t("items")}
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          {courseData.levels.map((levelData) => (
                            <div key={levelData.level.id} className="level-lessons-section">
                              <div className="level-lessons-header">
                                <div className="d-flex align-items-center justify-content-between">
                                  <div className="d-flex align-items-center">
                                    <Badge bg="info" className="level-badge-lessons me-2">
                                      {t("level")} {levelData.level.level || 1}
                                    </Badge>
                                    <div>
                                      <h6 className="level-lessons-title mb-0">
                                        {getDisplayTitle(levelData.level) || `Level ${levelData.level.level || 1}`}
                                      </h6>
                                      <small className="text-muted">
                                        {levelData.lessonCount} {t("lessons")} • {levelData.quizCount} {t("quizzes")}
                                      </small>
                                    </div>
                                  </div>
                                  <div className="level-actions-buttons">
                                    <Button
                                      variant="outline-primary"
                                      size="sm"
                                      onClick={() => {
                                        openModal("bulk", null, levelData.level.courseId, levelData.level.id);
                                      }}
                                    >
                                      {t("addLessonsQuizzes") || "Add Content"}
                                    </Button>
                                  </div>
                                </div>
                              </div>
                              
                              {levelData.lessons.length > 0 ? (
                                <div className="lessons-hierarchy">
                                  {(() => {
                                    // Group lessons and their quizzes
                                    const lessons = levelData.lessons.filter(item => item.type === 'lesson');
                                    const quizzes = levelData.lessons.filter(item => item.type === 'quiz');
                                    
                                    return lessons.map((lesson, lessonIndex) => {
                                      const lessonId = `${levelData.level.level}.${lessonIndex + 1}`;
                                      const relatedQuizzes = quizzes.filter(quiz => 
                                        quiz.parentLessonId === lesson.id || 
                                        quiz.parentLessonId === lesson.tempId ||
                                        quiz.parentLessonId?.includes(lesson.id)
                                      );
                                      
                                      // Debug: Log quiz relationships
                                      if (lessonIndex === 0) { // Only log for first lesson to reduce noise
                                        console.log('🎯 DEBUG: Lesson:', lesson.id, 'Title:', lesson.titles?.en);
                                        console.log('🎯 DEBUG: All quizzes:', quizzes.map(q => ({ id: q.id, parentLessonId: q.parentLessonId, title: q.titles?.en })));
                                        console.log('🎯 DEBUG: Related quizzes:', relatedQuizzes.map(q => ({ id: q.id, parentLessonId: q.parentLessonId, title: q.titles?.en })));
                                      }
                                      
                                      const pointCount = lesson.content?.points?.length || 0;
                                      
                                      return (
                                        <div key={lesson.id} className="lesson-with-quizzes-container mb-4">
                                          {/* Main Lesson Card */}
                                          <div className="row">
                                            <div className="col-12">
                                              <Card className="lesson-main-card shadow-sm">
                                                <Card.Body>
                                                  <div className="d-flex justify-content-between align-items-start mb-3">
                                                    <div className="lesson-header-info">
                                                      <div className="d-flex align-items-center mb-2">
                                                        <Badge bg="primary" className="me-2">
                                                          📚 Lesson {lessonId}
                                                        </Badge>
                                                        <small className="text-muted">
                                                          Course: {getDisplayTitle(courseData.course) || 'N/A'} • Level {levelData.level.level}
                                                        </small>
                                                      </div>
                                                      <h5 className="lesson-title mb-2">
                                                        {getDisplayTitle(lesson) || `Lesson ${lessonId}`}
                                                      </h5>
                                                      <p className="lesson-description text-muted mb-3">
                                                        {(lesson.content?.descriptions?.en || lesson.content?.descriptions?.ur || 'No description available').substring(0, 150)}
                                                        {(lesson.content?.descriptions?.en || lesson.content?.descriptions?.ur || '').length > 150 ? '...' : ''}
                                                      </p>
                                                    </div>
                                                    <div className="lesson-stats-box">
                                                      <div className="stat-item text-center">
                                                        <div className="stat-number text-primary">{pointCount}</div>
                                                        <div className="stat-label">Points</div>
                                                      </div>
                                                    </div>
                                                  </div>
                                                  
                                                  <div className="lesson-actions d-flex gap-2 mb-3">
                                                    <Button
                                                      variant="outline-primary"
                                                      size="sm"
                                                      onClick={() => openModal('edit-lesson', lesson)}
                                                    >
                                                      <Edit size={14} className="me-1" />
                                                      Edit Lesson
                                                    </Button>
                                                    <Button
                                                      variant="outline-success"
                                                      size="sm"
                                                      onClick={() => openModal('add-quiz-to-lesson', lesson)}
                                                    >
                                                      <Plus size={14} className="me-1" />
                                                      Add Quiz
                                                    </Button>
                                                    <Button
                                                      variant="outline-danger"
                                                      size="sm"
                                                      onClick={() => deleteItem(lesson.id, 'lesson')}
                                                    >
                                                      <Trash2 size={14} className="me-1" />
                                                      Delete
                                                    </Button>
                                                  </div>
                                                  
                                                  {/* Related Quizzes Section */}
                                                  {relatedQuizzes.length > 0 && (
                                                    <div className="related-quizzes-section">
                                                      <div className="d-flex align-items-center mb-3">
                                                        <h6 className="mb-0 text-secondary">
                                                          📝 Linked Quizzes ({relatedQuizzes.length})
                                                        </h6>
                                                        <hr className="flex-grow-1 ms-3" />
                                                      </div>
                                                      
                                                      <div className="row">
                                                        {relatedQuizzes.map((quiz, quizIndex) => {
                                                          const quizId = `${lessonId}.${quizIndex + 1}`;
                                                          const questionCount = quiz.content?.questions?.length || 0;
                                                          
                                                          return (
                                                            <div key={quiz.id} className="col-md-6 col-lg-4 mb-3">
                                                              <Card className="quiz-sub-card border-warning">
                                                                <Card.Body className="p-3">
                                                                  <div className="d-flex align-items-center mb-2">
                                                                    <Badge bg="warning" text="dark" className="me-2">
                                                                      ❓ Quiz {quizId}
                                                                    </Badge>
                                                                  </div>
                                                                  
                                                                  <h6 className="quiz-title mb-2">
                                                                    {getDisplayTitle(quiz) || `Quiz ${quizId}`}
                                                                  </h6>
                                                                  
                                                                  <div className="quiz-stats mb-3">
                                                                    <div className="d-flex justify-content-between">
                                                                      <small className="text-muted">Questions:</small>
                                                                      <Badge bg="info">{questionCount}</Badge>
                                                                    </div>
                                                                  </div>
                                                                  
                                                                  <div className="quiz-actions d-flex gap-1">
                                                                    <Button
                                                                      variant="outline-primary"
                                                                      size="sm"
                                                                      className="flex-fill"
                                                                      onClick={() => openModal('edit-quiz', quiz)}
                                                                    >
                                                                      <Edit size={12} />
                                                                    </Button>
                                                                    <Button
                                                                      variant="outline-danger"
                                                                      size="sm"
                                                                      className="flex-fill"
                                                                      onClick={() => deleteItem(quiz.id, 'quiz')}
                                                                    >
                                                                      <Trash2 size={12} />
                                                                    </Button>
                                                                  </div>
                                                                </Card.Body>
                                                              </Card>
                                                            </div>
                                                          );
                                                        })}
                                                      </div>
                                                    </div>
                                                  )}
                                                  
                                                  {relatedQuizzes.length === 0 && (
                                                    <div className="no-quizzes-notice">
                                                      <div className="text-center py-3 text-muted">
                                                        <small>No quizzes linked to this lesson yet.</small>
                                                      </div>
                                                    </div>
                                                  )}
                                                </Card.Body>
                                              </Card>
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    });
                                  })()}
                                  
                                  {/* Show orphaned quizzes (quizzes without parent lessons) */}
                                  {(() => {
                                    const lessons = levelData.lessons.filter(item => item.type === 'lesson');
                                    const quizzes = levelData.lessons.filter(item => item.type === 'quiz');
                                    const lessonIds = lessons.map(l => l.id);
                                    const orphanedQuizzes = quizzes.filter(quiz => 
                                      !quiz.parentLessonId || 
                                      !lessonIds.includes(quiz.parentLessonId) && 
                                      !lessons.some(l => l.tempId === quiz.parentLessonId)
                                    );
                                    
                                    if (orphanedQuizzes.length > 0) {
                                      return (
                                        <div className="orphaned-quizzes-section">
                                          <div className="d-flex align-items-center mb-3">
                                            <h6 className="mb-0 text-warning">
                                              ⚠️ Unlinked Quizzes ({orphanedQuizzes.length})
                                            </h6>
                                            <hr className="flex-grow-1 ms-3" />
                                          </div>
                                          <div className="row">
                                            {orphanedQuizzes.map((quiz, index) => {
                                              const questionCount = quiz.content?.questions?.length || 0;
                                              
                                              return (
                                                <div key={quiz.id} className="col-md-6 col-lg-4 mb-3">
                                                  <Card className="quiz-orphan-card border-danger">
                                                    <Card.Body className="p-3">
                                                      <Badge bg="danger" className="mb-2">
                                                        ❓ Orphaned Quiz
                                                      </Badge>
                                                      <h6 className="quiz-title mb-2">
                                                        {getDisplayTitle(quiz) || `Quiz ${index + 1}`}
                                                      </h6>
                                                      <div className="quiz-stats mb-3">
                                                        <small className="text-muted">Questions: {questionCount}</small>
                                                      </div>
                                                      <div className="quiz-actions d-flex gap-1">
                                                        <Button
                                                          variant="outline-primary"
                                                          size="sm"
                                                          className="flex-fill"
                                                          onClick={() => openModal('edit-quiz', quiz)}
                                                        >
                                                          <Edit size={12} />
                                                        </Button>
                                                        <Button
                                                          variant="outline-danger"
                                                          size="sm"
                                                          className="flex-fill"
                                                          onClick={() => deleteItem(quiz.id, 'quiz')}
                                                        >
                                                          <Trash2 size={12} />
                                                        </Button>
                                                      </div>
                                                    </Card.Body>
                                                  </Card>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      );
                                    }
                                    return null;
                                  })()}
                                </div>
                              ) : (
                                <div className="empty-level-lessons">
                                  <p className="text-muted text-center py-3">
                                    {t("noLessonsInLevel") || "No lessons in this level yet"}
                                  </p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </Card.Body>
              </Card>
            </div>
          </Tab>
        </Tabs>

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
              {modalType === "edit-lesson" && `${t("edit")} ${t("lesson")}`}
              {modalType === "add-quiz-to-lesson" && `Add Quiz to Lesson`}
              {modalType === "edit-quiz" && `${t("edit")} ${t("quiz")}`}
              {modalType === "view" && t("viewDetails")}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {modalType === "bulk" && (
              <Form>
                {/* Show selected course/level info if pre-selected, otherwise show selectors */}
                {selectedCourseId && selectedLevelId ? (
                  <Row className="mb-3">
                    <Col md={12}>
                      <div className="selected-context-info">
                        <h6 className="mb-2">{t("addingContentTo") || "Adding content to"}:</h6>
                        <div className="context-info-card">
                          <div className="d-flex align-items-center">
                            <img
                              src={courses.find(c => c.id === selectedCourseId)?.image || "/assets/cap.png"}
                              alt="Course"
                              style={{width: "32px", height: "32px", borderRadius: "6px", marginRight: "10px"}}
                            />
                            <div>
                              <strong>{getDisplayTitle(courses.find(c => c.id === selectedCourseId))}</strong>
                              <br />
                              <small className="text-muted">
                                {getDisplayTitle(courseLevels.find(l => l.id === selectedLevelId))} 
                                (Level {courseLevels.find(l => l.id === selectedLevelId)?.level})
                              </small>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Col>
                  </Row>
                ) : (
                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Select Course *</Form.Label>
                        <Form.Select
                          value={selectedCourseId}
                          onChange={(e) =>
                            handleCourseSelectionChange(e.target.value)
                          }
                        >
                          <option value="">Choose Course</option>
                          {courses.map((course) => (
                            <option key={course.id} value={course.id}>
                              {getDisplayTitle(course)} ({t("id")}: {course.id?.slice(-8)})
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
                            {selectedCourseId
                              ? "Choose Course Level"
                              : "Select Course First"}
                          </option>
                          {getFilteredCourseLevels().map((level) => (
                            <option key={level.id} value={level.id}>
                              {getDisplayTitle(level)} (Level {level.level})
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                )}

                <div style={{ maxHeight: "500px", overflowY: "auto" }}>
                  <Accordion
                    defaultActiveKey={["lessons", "quizzes"]}
                    alwaysOpen
                  >
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
                                {lesson.autoName ? `Lesson ${lesson.autoName}` : `${t("lesson")} ${lessonIndex + 1}`}
                                {lesson.autoName && <small className="text-muted ms-2">(System ID: {lesson.autoName})</small>}
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

                              <Row className="mb-3">
                                <Col md={6}>
                                  <Form.Group>
                                    <Form.Label>
                                      {t("descriptionEnglish")} * (Required)
                                    </Form.Label>
                                    <RichTextEditor
                                      value={lesson.content.descriptions?.en || ""}
                                      onChange={(value) =>
                                        updateLessonBilingual(
                                          lessonIndex,
                                          "content.descriptions",
                                          "en",
                                          value
                                        )
                                      }
                                      placeholder="Enter English description with rich formatting"
                                      className={isRTL ? 'rtl' : ''}
                                    />
                                  </Form.Group>
                                </Col>
                                <Col md={6}>
                                  <Form.Group>
                                    <Form.Label>
                                      {t("descriptionUrdu")} (Optional)
                                    </Form.Label>
                                    <RichTextEditor
                                      value={lesson.content.descriptions?.ur || ""}
                                      onChange={(value) =>
                                        updateLessonBilingual(
                                          lessonIndex,
                                          "content.descriptions",
                                          "ur",
                                          value
                                        )
                                      }
                                      placeholder="اردو تفصیل داخل کریں"
                                      className="rtl"
                                    />
                                  </Form.Group>
                                </Col>
                              </Row>

                              {/* Quizzes for this lesson */}
                              <div className="mt-4">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                  <h6 className="mb-0 text-primary">
                                    Quizzes for this lesson ({(() => {
                                      const filtered = bulkQuizzes.filter(q => q.parentLessonId === lesson.tempId);
                                      console.log('🎯 Quiz count for lesson', lesson.tempId, ':', filtered.length, 'quizzes:', filtered);
                                      return filtered.length;
                                    })()})
                                  </h6>
                                  <Button
                                    variant="outline-success"
                                    size="sm"
                                    onClick={() => addQuizToLesson(lessonIndex)}
                                  >
                                    <Plus size={14} className={isRTL ? "ms-1" : "me-1"} />
                                    Add Quiz
                                  </Button>
                                </div>
                                
                                {(() => {
                                  const filteredQuizzes = bulkQuizzes.filter(quiz => quiz.parentLessonId === lesson.tempId);
                                  console.log('🎯 Rendering quiz cards for lesson', lesson.tempId, ':', filteredQuizzes);
                                  return filteredQuizzes.map((quiz, quizIndexInLesson) => {
                                    const globalQuizIndex = bulkQuizzes.findIndex(q => q === quiz);
                                    const uniqueKey = quiz.id || `quiz-${lesson.tempId}-${quizIndexInLesson}`;
                                    console.log('🎯 Rendering quiz card', quizIndexInLesson + 1, ':', quiz.id, 'globalIndex:', globalQuizIndex, 'key:', uniqueKey);
                                    console.log('🎯 Quiz structure:', { id: quiz.id, parentLessonId: quiz.parentLessonId, questions: quiz.content?.questions?.length || 0 });
                                    return (
                                      <Card
                                        key={uniqueKey}
                                        className="mb-2"
                                        style={{ border: "1px solid #e3f2fd", background: "#f8f9fa" }}
                                      >
                                        <Card.Header className="py-2 d-flex justify-content-between align-items-center">
                                          <small className="text-muted">
                                            Quiz {quizIndexInLesson + 1}
                                          </small>
                                          <div>
                                            <Button
                                              variant="outline-secondary"
                                              size="sm"
                                              onClick={() => duplicateQuiz(globalQuizIndex)}
                                              className={isRTL ? "ms-1" : "me-1"}
                                              title="Duplicate"
                                            >
                                              <Copy size={12} />
                                            </Button>
                                            <Button
                                              variant="outline-danger"
                                              size="sm"
                                              onClick={() => removeQuiz(globalQuizIndex)}
                                              title="Remove"
                                            >
                                              <X size={12} />
                                            </Button>
                                          </div>
                                        </Card.Header>
                                        <Card.Body className="py-2">
                                          <div className="text-center mb-3">
                                            <small className="text-muted">
                                              Questions: {quiz.content.questions.length} | 
                                              <Button
                                                variant="link"
                                                size="sm"
                                                className="p-0 ms-1"
                                                onClick={() => addQuestion(globalQuizIndex)}
                                              >
                                                Add Question
                                              </Button>
                                            </small>
                                          </div>
                                          
                                          {quiz.content.questions.map((question, questionIndex) => (
                                            <Card key={questionIndex} className="mb-3 question-card">
                                              <Card.Header className="d-flex justify-content-between align-items-center py-2">
                                                <small className="mb-0">
                                                  Question {questionIndex + 1}
                                                </small>
                                                {quiz.content.questions.length > 1 && (
                                                  <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => removeQuestion(globalQuizIndex, questionIndex)}
                                                    title="Remove Question"
                                                  >
                                                    <X size={12} />
                                                  </Button>
                                                )}
                                              </Card.Header>
                                              <Card.Body className="py-2">
                                                <Row className="mb-2">
                                                  <Col md={6}>
                                                    <Form.Group>
                                                      <Form.Label style={{ fontSize: '12px' }}>
                                                        Question (English) *
                                                      </Form.Label>
                                                      <Form.Control
                                                        as="textarea"
                                                        rows={2}
                                                        size="sm"
                                                        value={question.questions?.en || ""}
                                                        onChange={(e) =>
                                                          updateQuestion(
                                                            globalQuizIndex,
                                                            questionIndex,
                                                            "questions",
                                                            "en",
                                                            e.target.value
                                                          )
                                                        }
                                                        placeholder="Enter question in English"
                                                      />
                                                    </Form.Group>
                                                  </Col>
                                                  <Col md={6}>
                                                    <Form.Group>
                                                      <Form.Label style={{ fontSize: '12px' }}>
                                                        Question (Urdu)
                                                      </Form.Label>
                                                      <Form.Control
                                                        as="textarea"
                                                        rows={2}
                                                        size="sm"
                                                        value={question.questions?.ur || ""}
                                                        onChange={(e) =>
                                                          updateQuestion(
                                                            globalQuizIndex,
                                                            questionIndex,
                                                            "questions",
                                                            "ur",
                                                            e.target.value
                                                          )
                                                        }
                                                        placeholder="سوال اردو میں درج کریں"
                                                        dir="rtl"
                                                      />
                                                    </Form.Group>
                                                  </Col>
                                                </Row>
                                                
                                                <div className="mb-2">
                                                  <small className="text-muted mb-2 d-block">MCQ Options:</small>
                                                  {question.options.map((option, optionIndex) => (
                                                    <Row key={optionIndex} className="mb-2">
                                                      <Col md={1}>
                                                        <Form.Check
                                                          type="radio"
                                                          name={`correct-${globalQuizIndex}-${questionIndex}`}
                                                          checked={question.correctAnswer === optionIndex}
                                                          onChange={() =>
                                                            updateQuestion(
                                                              globalQuizIndex,
                                                              questionIndex,
                                                              "correctAnswer",
                                                              null,
                                                              optionIndex
                                                            )
                                                          }
                                                          title="Mark as correct answer"
                                                        />
                                                      </Col>
                                                      <Col md={5}>
                                                        <Form.Control
                                                          size="sm"
                                                          type="text"
                                                          value={option.en || ""}
                                                          onChange={(e) =>
                                                            updateQuestionOption(
                                                              globalQuizIndex,
                                                              questionIndex,
                                                              optionIndex,
                                                              "en",
                                                              e.target.value
                                                            )
                                                          }
                                                          placeholder={`Option ${optionIndex + 1} (English)`}
                                                        />
                                                      </Col>
                                                      <Col md={6}>
                                                        <Form.Control
                                                          size="sm"
                                                          type="text"
                                                          value={option.ur || ""}
                                                          onChange={(e) =>
                                                            updateQuestionOption(
                                                              globalQuizIndex,
                                                              questionIndex,
                                                              optionIndex,
                                                              "ur",
                                                              e.target.value
                                                            )
                                                          }
                                                          placeholder={`آپشن ${optionIndex + 1} (اردو)`}
                                                          dir="rtl"
                                                        />
                                                      </Col>
                                                    </Row>
                                                  ))}
                                                </div>
                                                
                                                <Row className="mb-2">
                                                  <Col md={6}>
                                                    <Form.Group>
                                                      <Form.Label style={{ fontSize: '12px' }}>
                                                        Explanation (English)
                                                      </Form.Label>
                                                      <Form.Control
                                                        as="textarea"
                                                        rows={2}
                                                        size="sm"
                                                        value={question.explanations?.en || ""}
                                                        onChange={(e) =>
                                                          updateQuestion(
                                                            globalQuizIndex,
                                                            questionIndex,
                                                            "explanations",
                                                            "en",
                                                            e.target.value
                                                          )
                                                        }
                                                        placeholder="Explain why this is the correct answer"
                                                      />
                                                    </Form.Group>
                                                  </Col>
                                                  <Col md={6}>
                                                    <Form.Group>
                                                      <Form.Label style={{ fontSize: '12px' }}>
                                                        Explanation (Urdu)
                                                      </Form.Label>
                                                      <Form.Control
                                                        as="textarea"
                                                        rows={2}
                                                        size="sm"
                                                        value={question.explanations?.ur || ""}
                                                        onChange={(e) =>
                                                          updateQuestion(
                                                            globalQuizIndex,
                                                            questionIndex,
                                                            "explanations",
                                                            "ur",
                                                            e.target.value
                                                          )
                                                        }
                                                        placeholder="یہ کیوں صحیح جواب ہے اس کی وضاحت کریں"
                                                        dir="rtl"
                                                      />
                                                    </Form.Group>
                                                  </Col>
                                                </Row>
                                              </Card.Body>
                                            </Card>
                                          ))}
                                        </Card.Body>
                                      </Card>
                                    );
                                  });
                                })()}
                                
                                {bulkQuizzes.filter(q => q.parentLessonId === lesson.tempId).length === 0 && (
                                  <div className="text-center text-muted p-3" style={{ border: "1px dashed #ccc", borderRadius: "4px" }}>
                                    <small>No quizzes added yet. Click "Add Quiz" to create a quiz for this lesson.</small>
                                  </div>
                                )}
                              </div>

                            </Card.Body>
                          </Card>
                        ))}
                      </Accordion.Body>
                    </Accordion.Item>

                    {/* Quizzes are now nested within lessons above */}
                  </Accordion>
                </div>
              </Form>
            )}

            {(modalType === "add-course" || modalType === "edit-course") && (
              <Form>
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

                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Course Number</Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.courseNumber || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Only allow 4-digit numbers
                          if (/^\d{0,4}$/.test(value)) {
                            setFormData({ ...formData, courseNumber: value });
                          }
                        }}
                        placeholder="0001"
                        maxLength={4}
                        pattern="\d{4}"
                        title="Please enter a 4-digit course number (e.g., 0001)"
                      />
                      <Form.Text className="text-muted">
                        4-digit course number (e.g., 0001). Auto-generated but can be customized.
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Status</Form.Label>
                      <Form.Check
                        type="switch"
                        id="course-status-switch"
                        label={formData.active ? "Active" : "Inactive"}
                        checked={formData.active || false}
                        onChange={(e) =>
                          setFormData({ ...formData, active: e.target.checked })
                        }
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>{t("descriptionEnglish")} * (Required)</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={formData.descriptions?.en || ""}
                        onChange={(e) =>
                          updateBilingualField("descriptions", "en", e.target.value)
                        }
                        placeholder="Enter English description"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>{t("descriptionUrdu")} (Optional)</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={formData.descriptions?.ur || ""}
                        onChange={(e) =>
                          updateBilingualField("descriptions", "ur", e.target.value)
                        }
                        placeholder="اردو تفصیل داخل کریں"
                        dir="rtl"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>{t("image")}</Form.Label>
                      <Form.Control
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setFormData({ ...formData, imageFile: file });
                          }
                        }}
                      />
                      {formData.image && (
                        <div className="mt-2">
                          <img
                            src={formData.image}
                            alt="Course preview"
                            style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }}
                          />
                        </div>
                      )}
                      <Form.Text className="text-muted">
                        Upload an image file (JPG, PNG, etc.)
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>
              </Form>
            )}

            {(modalType === "add-level" ||
              modalType === "add-level-standalone" ||
              modalType === "edit-level") && (
                <Form>
                  <Row className="mb-3">
                    <Col>
                      <Form.Group>
                        <Form.Label>Select Course *</Form.Label>
                        <Form.Select
                          value={selectedCourseId}
                          onChange={(e) => {
                            const courseId = e.target.value;
                            setSelectedCourseId(courseId);
                            if (courseId && (modalType === "add-level" || modalType === "add-level-standalone")) {
                              const nextLevel = getNextAvailableLevel(courseId);
                              setFormData({ ...formData, courseId: courseId, level: nextLevel });
                              setAvailableLevel(nextLevel);
                            }
                          }}
                          disabled={modalType === "edit-level"}
                        >
                          <option value="">Choose Course</option>
                          {courses.map((course) => (
                            <option key={course.id} value={course.id}>
                              {getDisplayTitle(course)} ({t("id")}: {course.id?.slice(-8)})
                            </option>
                          ))}
                        </Form.Select>
                        {modalType === "edit-level" && (
                          <Form.Text className="text-muted">
                            Course cannot be changed when editing a level
                          </Form.Text>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>

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

                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>
                          {modalType === "edit-level" ? t("subtitleEnglish") : t("subtitleEnglish")} * (Required)
                        </Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.subtitles?.en || ""}
                          onChange={(e) =>
                            updateBilingualField("subtitles", "en", e.target.value)
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
                            updateBilingualField("subtitles", "ur", e.target.value)
                          }
                          placeholder="اردو ذیلی عنوان داخل کریں"
                          dir="rtl"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>{t("level")}</Form.Label>
                        <div className="d-flex align-items-center">
                          <div className="flex-grow-1 me-2">
                            <Form.Control
                              type="number"
                              min="1"
                              value={formData.level || ""}
                              onChange={(e) => {
                                const level = parseInt(e.target.value) || "";
                                setFormData({ ...formData, level: level });
                                if (level && formData.courseId) {
                                  setLevelExists(isLevelExists(formData.courseId, level, modalType === "edit-level" ? selectedItem?.id : null));
                                }
                              }}
                            />
                            <Form.Text className="text-muted">
                              Choose a level number for this course level
                            </Form.Text>
                          </div>
                          <div className="flex-grow-1">
                            <Form.Control
                              type="text"
                              value={availableLevel || getNextAvailableLevel(formData.courseId) || ""}
                              readOnly
                              placeholder="No suggestions"
                              style={{
                                backgroundColor: "#f8f9fa",
                                border: "1px dashed #dee2e6"
                              }}
                            />
                            <Form.Text className="text-muted">
                              Suggested next available level
                            </Form.Text>
                          </div>
                        </div>
                        {formData.level && isLevelExists(formData.courseId, formData.level, modalType === "edit-level" ? selectedItem?.id : null) && (
                          <div className="mt-2">
                            <Form.Text className="text-danger">
                              Level {formData.level} already exists for this course
                            </Form.Text>
                          </div>
                        )}
                        <Form.Text className="text-muted">
                          Level determines the order and difficulty progression
                        </Form.Text>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Estimated Duration</Form.Label>
                        <Form.Select
                          value={formData.estimated_duration || ""}
                          onChange={(e) => setFormData({ ...formData, estimated_duration: e.target.value })}
                        >
                          <option value="">Select Duration</option>
                          <option value="15 - 30 minutes">15 - 30 minutes</option>
                          <option value="30 - 45 minutes">30 - 45 minutes</option>
                          <option value="45 minutes - 1 hour">45 minutes - 1 hour</option>
                          <option value="1 - 1.5 hours">1 - 1.5 hours</option>
                          <option value="1.5 - 2 hours">1.5 - 2 hours</option>
                          <option value="2 - 2.5 hours">2 - 2.5 hours</option>
                          <option value="2.5 - 3 hours">2.5 - 3 hours</option>
                          <option value="3+ hours">3+ hours</option>
                        </Form.Select>
                        <Form.Text className="text-muted">
                          Estimated time for students to complete this level
                        </Form.Text>
                      </Form.Group>
                    </Col>
                  </Row>
                </Form>
            )}

            {modalType === "edit-lesson" && (
              <Form>
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

                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>{t("descriptionEnglish")} * (Required)</Form.Label>
                      <RichTextEditor
                        value={formData.content?.descriptions?.en || ""}
                        onChange={(value) =>
                          updateNestedField("content.descriptions.en", value)
                        }
                        placeholder="Enter English description with rich formatting"
                        className={isRTL ? 'rtl' : ''}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>{t("descriptionUrdu")} (Optional)</Form.Label>
                      <RichTextEditor
                        value={formData.content?.descriptions?.ur || ""}
                        onChange={(value) =>
                          updateNestedField("content.descriptions.ur", value)
                        }
                        placeholder="اردو تفصیل داخل کریں"
                        className="rtl"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Form>
            )}

            {modalType === "edit-quiz" && (
              <Form>

                {/* Quiz Questions Section */}
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="mb-0">{t("questions")} ({formData.content?.questions?.length || 0})</h6>
                  </div>

                  {formData.content?.questions?.map((question, questionIndex) => (
                    <Card key={questionIndex} className="mb-3 question-card">
                      <Card.Header className="d-flex justify-content-between align-items-center py-2">
                        <small className="mb-0">
                          {t("question")} {questionIndex + 1}
                        </small>
                      </Card.Header>
                      <Card.Body className="py-2">
                        <Row className="mb-2">
                          <Col md={6}>
                            <Form.Group>
                              <Form.Label>
                                {t("questionEnglish")} * (Required)
                              </Form.Label>
                              <Form.Control
                                type="text"
                                size="sm"
                                value={question.questions?.en || ""}
                                onChange={(e) => {
                                  const updatedQuestions = [...formData.content.questions];
                                  updatedQuestions[questionIndex] = {
                                    ...updatedQuestions[questionIndex],
                                    questions: {
                                      ...updatedQuestions[questionIndex].questions,
                                      en: e.target.value
                                    }
                                  };
                                  updateNestedField("content.questions", updatedQuestions);
                                }}
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
                                value={question.questions?.ur || ""}
                                onChange={(e) => {
                                  const updatedQuestions = [...formData.content.questions];
                                  updatedQuestions[questionIndex] = {
                                    ...updatedQuestions[questionIndex],
                                    questions: {
                                      ...updatedQuestions[questionIndex].questions,
                                      ur: e.target.value
                                    }
                                  };
                                  updateNestedField("content.questions", updatedQuestions);
                                }}
                                placeholder="اردو سوال داخل کریں"
                                dir="rtl"
                              />
                            </Form.Group>
                          </Col>
                        </Row>

                        <Form.Group className="mb-2">
                          <Form.Label>
                            {t("options")} (4 Fixed Options)
                          </Form.Label>
                          {question.options?.map((option, optionIndex) => (
                            <Row key={optionIndex} className="mb-2 align-items-center">
                              <Col md={5}>
                                <Form.Control
                                  type="text"
                                  size="sm"
                                  value={option.en || ""}
                                  onChange={(e) => {
                                    const updatedQuestions = [...formData.content.questions];
                                    updatedQuestions[questionIndex].options[optionIndex] = {
                                      ...updatedQuestions[questionIndex].options[optionIndex],
                                      en: e.target.value
                                    };
                                    updateNestedField("content.questions", updatedQuestions);
                                  }}
                                  placeholder={`English option ${optionIndex + 1} *`}
                                  required
                                />
                              </Col>
                              <Col md={5}>
                                <Form.Control
                                  type="text"
                                  size="sm"
                                  value={option.ur || ""}
                                  onChange={(e) => {
                                    const updatedQuestions = [...formData.content.questions];
                                    updatedQuestions[questionIndex].options[optionIndex] = {
                                      ...updatedQuestions[questionIndex].options[optionIndex],
                                      ur: e.target.value
                                    };
                                    updateNestedField("content.questions", updatedQuestions);
                                  }}
                                  placeholder={`اردو آپشن ${optionIndex + 1}`}
                                  dir="rtl"
                                />
                              </Col>
                              <Col md={2}>
                                <Form.Check
                                  type="radio"
                                  name={`correct_edit_${questionIndex}`}
                                  checked={question.correctAnswer === optionIndex}
                                  onChange={() => {
                                    const updatedQuestions = [...formData.content.questions];
                                    updatedQuestions[questionIndex] = {
                                      ...updatedQuestions[questionIndex],
                                      correctAnswer: optionIndex
                                    };
                                    updateNestedField("content.questions", updatedQuestions);
                                  }}
                                  title={t("correctAnswer")}
                                  label="Correct"
                                />
                              </Col>
                            </Row>
                          ))}
                        </Form.Group>

                        <Row className="mb-2">
                          <Col md={6}>
                            <Form.Group>
                              <Form.Label>
                                {t("explanationEnglish")} * (Required)
                              </Form.Label>
                              <Form.Control
                                as="textarea"
                                rows={2}
                                size="sm"
                                value={question.explanations?.en || ""}
                                onChange={(e) => {
                                  const updatedQuestions = [...formData.content.questions];
                                  updatedQuestions[questionIndex] = {
                                    ...updatedQuestions[questionIndex],
                                    explanations: {
                                      ...updatedQuestions[questionIndex].explanations,
                                      en: e.target.value
                                    }
                                  };
                                  updateNestedField("content.questions", updatedQuestions);
                                }}
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
                                value={question.explanations?.ur || ""}
                                onChange={(e) => {
                                  const updatedQuestions = [...formData.content.questions];
                                  updatedQuestions[questionIndex] = {
                                    ...updatedQuestions[questionIndex],
                                    explanations: {
                                      ...updatedQuestions[questionIndex].explanations,
                                      ur: e.target.value
                                    }
                                  };
                                  updateNestedField("content.questions", updatedQuestions);
                                }}
                                placeholder="اردو وضاحت داخل کریں"
                                dir="rtl"
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              </Form>
            )}

            {modalType === "add-quiz-to-lesson" && (
              <Form>
                {/* Quiz Content - Reuse the same form as edit-quiz */}
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="mb-0">{t("questions")} ({formData.content?.questions?.length || 0})</h6>
                    <Button
                      variant="outline-success"
                      size="sm"
                      onClick={() => {
                        const newQuestion = createEmptyQuestion();
                        const updatedQuestions = [...(formData.content?.questions || []), newQuestion];
                        updateNestedField("content.questions", updatedQuestions);
                      }}
                    >
                      <Plus size={14} className={isRTL ? "ms-1" : "me-1"} />
                      {t("addQuestion")}
                    </Button>
                  </div>

                  {formData.content?.questions?.map((question, questionIndex) => (
                    <Card key={questionIndex} className="mb-3 question-card">
                      <Card.Header className="d-flex justify-content-between align-items-center py-2">
                        <small className="mb-0">
                          {t("question")} {questionIndex + 1}
                        </small>
                        {(formData.content?.questions?.length || 0) > 1 && (
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => {
                              const updatedQuestions = formData.content.questions.filter((_, i) => i !== questionIndex);
                              updateNestedField("content.questions", updatedQuestions);
                            }}
                            title={t("remove")}
                          >
                            <X size={12} />
                          </Button>
                        )}
                      </Card.Header>
                      <Card.Body className="py-2">
                        <Row className="mb-2">
                          <Col md={6}>
                            <Form.Group>
                              <Form.Label>
                                {t("questionEnglish")} * (Required)
                              </Form.Label>
                              <Form.Control
                                type="text"
                                size="sm"
                                value={question.questions?.en || ""}
                                onChange={(e) => {
                                  const updatedQuestions = [...formData.content.questions];
                                  updatedQuestions[questionIndex] = {
                                    ...updatedQuestions[questionIndex],
                                    questions: {
                                      ...updatedQuestions[questionIndex].questions,
                                      en: e.target.value
                                    }
                                  };
                                  updateNestedField("content.questions", updatedQuestions);
                                }}
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
                                value={question.questions?.ur || ""}
                                onChange={(e) => {
                                  const updatedQuestions = [...formData.content.questions];
                                  updatedQuestions[questionIndex] = {
                                    ...updatedQuestions[questionIndex],
                                    questions: {
                                      ...updatedQuestions[questionIndex].questions,
                                      ur: e.target.value
                                    }
                                  };
                                  updateNestedField("content.questions", updatedQuestions);
                                }}
                                placeholder="اردو سوال داخل کریں"
                                dir="rtl"
                              />
                            </Form.Group>
                          </Col>
                        </Row>

                        <Form.Group className="mb-2">
                          <Form.Label>
                            {t("options")} (4 Fixed Options)
                          </Form.Label>
                          {question.options?.map((option, optionIndex) => (
                            <Row key={optionIndex} className="mb-2 align-items-center">
                              <Col md={5}>
                                <Form.Control
                                  type="text"
                                  size="sm"
                                  value={option.en || ""}
                                  onChange={(e) => {
                                    const updatedQuestions = [...formData.content.questions];
                                    updatedQuestions[questionIndex].options[optionIndex] = {
                                      ...updatedQuestions[questionIndex].options[optionIndex],
                                      en: e.target.value
                                    };
                                    updateNestedField("content.questions", updatedQuestions);
                                  }}
                                  placeholder={`English option ${optionIndex + 1} *`}
                                  required
                                />
                              </Col>
                              <Col md={5}>
                                <Form.Control
                                  type="text"
                                  size="sm"
                                  value={option.ur || ""}
                                  onChange={(e) => {
                                    const updatedQuestions = [...formData.content.questions];
                                    updatedQuestions[questionIndex].options[optionIndex] = {
                                      ...updatedQuestions[questionIndex].options[optionIndex],
                                      ur: e.target.value
                                    };
                                    updateNestedField("content.questions", updatedQuestions);
                                  }}
                                  placeholder={`اردو آپشن ${optionIndex + 1}`}
                                  dir="rtl"
                                />
                              </Col>
                              <Col md={2}>
                                <Form.Check
                                  type="radio"
                                  name={`correct_add_${questionIndex}`}
                                  checked={question.correctAnswer === optionIndex}
                                  onChange={() => {
                                    const updatedQuestions = [...formData.content.questions];
                                    updatedQuestions[questionIndex] = {
                                      ...updatedQuestions[questionIndex],
                                      correctAnswer: optionIndex
                                    };
                                    updateNestedField("content.questions", updatedQuestions);
                                  }}
                                  title={t("correctAnswer")}
                                  label="Correct"
                                />
                              </Col>
                            </Row>
                          ))}
                        </Form.Group>

                        <Row className="mb-2">
                          <Col md={6}>
                            <Form.Group>
                              <Form.Label>
                                {t("explanationEnglish")} * (Required)
                              </Form.Label>
                              <Form.Control
                                as="textarea"
                                rows={2}
                                size="sm"
                                value={question.explanations?.en || ""}
                                onChange={(e) => {
                                  const updatedQuestions = [...formData.content.questions];
                                  updatedQuestions[questionIndex] = {
                                    ...updatedQuestions[questionIndex],
                                    explanations: {
                                      ...updatedQuestions[questionIndex].explanations,
                                      en: e.target.value
                                    }
                                  };
                                  updateNestedField("content.questions", updatedQuestions);
                                }}
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
                                value={question.explanations?.ur || ""}
                                onChange={(e) => {
                                  const updatedQuestions = [...formData.content.questions];
                                  updatedQuestions[questionIndex] = {
                                    ...updatedQuestions[questionIndex],
                                    explanations: {
                                      ...updatedQuestions[questionIndex].explanations,
                                      ur: e.target.value
                                    }
                                  };
                                  updateNestedField("content.questions", updatedQuestions);
                                }}
                                placeholder="اردو وضاحت داخل کریں"
                                dir="rtl"
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              </Form>
            )}

            {modalType === "view" && (
              <div>
                <pre
                  style={{
                    backgroundColor: "#f8f9fa",
                    padding: "15px",
                    borderRadius: "5px",
                    fontSize: "12px",
                    maxHeight: "400px",
                    overflowY: "auto",
                  }}
                >
                  {JSON.stringify(selectedItem, null, 2)}
                </pre>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={closeModal} disabled={isSubmitting}>
              {t("cancel")}
            </Button>
            {modalType !== "view" && (
              <Button
                variant="primary"
                onClick={saveData}
                disabled={isSubmitting}
              >
                {isSubmitting ? t("saving") : t("save")}
              </Button>
            )}
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default Dashboard;