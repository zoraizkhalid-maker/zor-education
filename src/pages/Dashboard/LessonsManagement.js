import React, { useState, useEffect } from "react";
import { Card, Button, Badge, Modal, Form, Row, Col, ListGroup, Alert } from "react-bootstrap";
import { Plus, Edit, Trash2, BookOpen, HelpCircle, GripVertical, ChevronDown, ChevronUp } from "lucide-react";
import { useLanguage } from "../../LanguageContext";
import { useAuth } from "../../context/AuthContext";

const LessonsManagement = ({
  courses,
  courseLevels,
  lessons,
  loadLessons,
  loadCourseLevels,
  getValidCourseLevels,
}) => {
  const { t, currentLanguage } = useLanguage();
  const { addLessonsToLevel, updateLessonInLevel, deleteLessonFromLevel } = useAuth();

  // Selection state
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedLevelId, setSelectedLevelId] = useState("");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(""); // "add-lesson", "edit-lesson", "add-quiz", "edit-quiz"
  const [selectedItem, setSelectedItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state for lesson
  const [lessonForm, setLessonForm] = useState({
    title: { en: "", ur: "" },
    content: { en: "", ur: "" },
    analogy: { en: "", ur: "" },
    hasAnalogy: false
  });

  // Form state for quiz
  const [quizForm, setQuizForm] = useState({
    title: { en: "Quiz", ur: "کوئز" },
    questions: [{
      id: "",
      question: { en: "", ur: "" },
      options: [
        { en: "", ur: "" },
        { en: "", ur: "" },
        { en: "", ur: "" },
        { en: "", ur: "" }
      ],
      correctAnswer: 0,
      explanation: {
        correct: { en: "", ur: "" },
        incorrect: { en: "", ur: "" }
      }
    }]
  });

  const getDisplayTitle = (item) => {
    if (!item) return "Untitled";
    // Check for 'title' (JSON format) or 'titles' (dashboard format)
    const titleObj = item.title || item.titles;
    if (titleObj && typeof titleObj === "object") {
      return titleObj[currentLanguage] || titleObj.en || titleObj.ur || "Untitled";
    }
    return "Untitled";
  };

  const getDisplayContent = (item) => {
    if (!item) return "";
    // Check for direct content (JSON format) or nested content.descriptions (dashboard format)
    if (item.content) {
      if (typeof item.content === "object") {
        // JSON format: content: { en, ur }
        if (item.content.en || item.content.ur) {
          return item.content[currentLanguage] || item.content.en || item.content.ur || "";
        }
        // Dashboard format: content: { descriptions: { en, ur } }
        if (item.content.descriptions) {
          return item.content.descriptions[currentLanguage] || item.content.descriptions.en || item.content.descriptions.ur || "";
        }
      }
    }
    return "";
  };

  // Get levels for selected course
  const getFilteredLevels = () => {
    if (!selectedCourseId) return [];
    return getValidCourseLevels()
      .filter(level => level.courseId === selectedCourseId)
      .sort((a, b) => (a.level || 1) - (b.level || 1));
  };

  // Get lessons/quizzes for selected level
  const getFilteredLessons = () => {
    if (!selectedLevelId) return [];
    return lessons
      .filter(lesson => lesson.levelId === selectedLevelId)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  };

  // Get the selected level object
  const getSelectedLevel = () => {
    return courseLevels.find(l => l.id === selectedLevelId);
  };

  // Get next order number
  const getNextOrder = () => {
    const currentLessons = getFilteredLessons();
    if (currentLessons.length === 0) return 1;
    return Math.max(...currentLessons.map(l => l.order || 0)) + 1;
  };

  // Reset lesson form
  const resetLessonForm = () => {
    setLessonForm({
      title: { en: "", ur: "" },
      content: { en: "", ur: "" },
      analogy: { en: "", ur: "" },
      hasAnalogy: false
    });
  };

  // Reset quiz form
  const resetQuizForm = () => {
    const level = getSelectedLevel();
    const quizNumber = getFilteredLessons().filter(l => l.type === 'quiz').length + 1;
    setQuizForm({
      title: { en: `Quiz ${quizNumber}`, ur: `کوئز ${quizNumber}` },
      questions: [{
        id: `q_${Date.now()}`,
        question: { en: "", ur: "" },
        options: [
          { en: "", ur: "" },
          { en: "", ur: "" },
          { en: "", ur: "" },
          { en: "", ur: "" }
        ],
        correctAnswer: 0,
        explanation: {
          correct: { en: "", ur: "" },
          incorrect: { en: "", ur: "" }
        }
      }]
    });
  };

  // Open add lesson modal
  const openAddLessonModal = () => {
    resetLessonForm();
    setModalType("add-lesson");
    setSelectedItem(null);
    setShowModal(true);
  };

  // Open edit lesson modal
  const openEditLessonModal = (lesson) => {
    // Handle both JSON format (title, content) and dashboard format (titles, content.descriptions)
    const title = lesson.title || lesson.titles || { en: "", ur: "" };
    let content = { en: "", ur: "" };
    let analogy = { en: "", ur: "" };
    let hasAnalogy = false;

    // Extract content
    if (lesson.content) {
      if (lesson.content.en || lesson.content.ur) {
        // JSON format
        content = lesson.content;
      } else if (lesson.content.descriptions) {
        // Dashboard format
        content = lesson.content.descriptions;
      }
      // Check for analogy
      if (lesson.analogy) {
        analogy = lesson.analogy;
        hasAnalogy = true;
      } else if (lesson.content.analogy) {
        analogy = lesson.content.analogy;
        hasAnalogy = true;
      }
    }

    setLessonForm({
      title,
      content,
      analogy,
      hasAnalogy
    });
    setModalType("edit-lesson");
    setSelectedItem(lesson);
    setShowModal(true);
  };

  // Open add quiz modal
  const openAddQuizModal = () => {
    resetQuizForm();
    setModalType("add-quiz");
    setSelectedItem(null);
    setShowModal(true);
  };

  // Open edit quiz modal
  const openEditQuizModal = (quiz) => {
    const title = quiz.title || quiz.titles || { en: "Quiz", ur: "کوئز" };

    // Extract questions - handle both formats
    let questions = [];
    if (quiz.questions && Array.isArray(quiz.questions)) {
      // JSON format: questions at root
      questions = quiz.questions.map(q => ({
        id: q.id || `q_${Date.now()}`,
        question: q.question || { en: "", ur: "" },
        options: q.options || [{ en: "", ur: "" }, { en: "", ur: "" }, { en: "", ur: "" }, { en: "", ur: "" }],
        correctAnswer: q.correctAnswer || 0,
        explanation: q.explanation || { correct: { en: "", ur: "" }, incorrect: { en: "", ur: "" } }
      }));
    } else if (quiz.content?.questions && Array.isArray(quiz.content.questions)) {
      // Dashboard format: questions inside content
      questions = quiz.content.questions.map(q => ({
        id: q.id || `q_${Date.now()}`,
        question: q.questions || q.question || { en: "", ur: "" },
        options: q.options || [{ en: "", ur: "" }, { en: "", ur: "" }, { en: "", ur: "" }, { en: "", ur: "" }],
        correctAnswer: q.correctAnswer || 0,
        explanation: {
          correct: q.explanation?.correct || q.explanations || { en: "", ur: "" },
          incorrect: q.explanation?.incorrect || { en: "", ur: "" }
        }
      }));
    }

    if (questions.length === 0) {
      questions = [{
        id: `q_${Date.now()}`,
        question: { en: "", ur: "" },
        options: [{ en: "", ur: "" }, { en: "", ur: "" }, { en: "", ur: "" }, { en: "", ur: "" }],
        correctAnswer: 0,
        explanation: { correct: { en: "", ur: "" }, incorrect: { en: "", ur: "" } }
      }];
    }

    setQuizForm({ title, questions });
    setModalType("edit-quiz");
    setSelectedItem(quiz);
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setModalType("");
    setSelectedItem(null);
    resetLessonForm();
    resetQuizForm();
  };

  // Save lesson
  const saveLesson = async () => {
    if (!lessonForm.title.en) {
      alert("English title is required");
      return;
    }
    if (!lessonForm.content.en) {
      alert("English content is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const level = getSelectedLevel();
      if (!level) {
        alert("Please select a level");
        setIsSubmitting(false);
        return;
      }

      // Build lesson object in JSON format
      const lessonData = {
        id: selectedItem?.id || `lesson_${Date.now()}`,
        type: "lesson",
        title: lessonForm.title,
        content: lessonForm.content,
        order: selectedItem?.order || getNextOrder(),
        subtitleKey: "lesson",
        created_at: selectedItem?.created_at || new Date().toISOString()
      };

      // Add analogy if present
      if (lessonForm.hasAnalogy && (lessonForm.analogy.en || lessonForm.analogy.ur)) {
        lessonData.analogy = lessonForm.analogy;
      }

      if (modalType === "add-lesson") {
        const result = await addLessonsToLevel(level.courseId, selectedLevelId, [lessonData]);
        if (result.success) {
          await loadLessons();
          await loadCourseLevels();
          closeModal();
        }
      } else if (modalType === "edit-lesson") {
        const result = await updateLessonInLevel(selectedItem.courseId, selectedItem.levelId, lessonData);
        if (result.success) {
          await loadLessons();
          await loadCourseLevels();
          closeModal();
        }
      }
    } catch (error) {
      console.error("Error saving lesson:", error);
      alert("Failed to save lesson. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Save quiz
  const saveQuiz = async () => {
    if (!quizForm.title.en) {
      alert("English title is required");
      return;
    }

    // Validate questions
    for (let i = 0; i < quizForm.questions.length; i++) {
      const q = quizForm.questions[i];
      if (!q.question.en) {
        alert(`Question ${i + 1}: English question text is required`);
        return;
      }
      const hasAllOptions = q.options.every(opt => opt.en);
      if (!hasAllOptions) {
        alert(`Question ${i + 1}: All English options are required`);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const level = getSelectedLevel();
      if (!level) {
        alert("Please select a level");
        setIsSubmitting(false);
        return;
      }

      // Build quiz object in JSON format
      const quizData = {
        id: selectedItem?.id || `quiz_${Date.now()}`,
        type: "quiz",
        title: quizForm.title,
        questions: quizForm.questions.map((q, idx) => ({
          id: q.id || `q_${Date.now()}_${idx}`,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation
        })),
        order: selectedItem?.order || getNextOrder(),
        subtitleKey: "mcq",
        created_at: selectedItem?.created_at || new Date().toISOString()
      };

      if (modalType === "add-quiz") {
        const result = await addLessonsToLevel(level.courseId, selectedLevelId, [quizData]);
        if (result.success) {
          await loadLessons();
          await loadCourseLevels();
          closeModal();
        }
      } else if (modalType === "edit-quiz") {
        const result = await updateLessonInLevel(selectedItem.courseId, selectedItem.levelId, quizData);
        if (result.success) {
          await loadLessons();
          await loadCourseLevels();
          closeModal();
        }
      }
    } catch (error) {
      console.error("Error saving quiz:", error);
      alert("Failed to save quiz. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete lesson/quiz
  const handleDelete = async (item) => {
    if (!window.confirm(`Are you sure you want to delete this ${item.type}?`)) return;

    const result = await deleteLessonFromLevel(item.courseId, item.levelId, item.id);
    if (result.success) {
      await loadLessons();
      await loadCourseLevels();
    }
  };

  // Update question in quiz form
  const updateQuestion = (index, field, value) => {
    setQuizForm(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => {
        if (i !== index) return q;
        return { ...q, [field]: value };
      })
    }));
  };

  // Update question option
  const updateQuestionOption = (qIndex, optIndex, language, value) => {
    setQuizForm(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => {
        if (i !== qIndex) return q;
        return {
          ...q,
          options: q.options.map((opt, j) => {
            if (j !== optIndex) return opt;
            return { ...opt, [language]: value };
          })
        };
      })
    }));
  };

  // Add question to quiz
  const addQuestion = () => {
    setQuizForm(prev => ({
      ...prev,
      questions: [...prev.questions, {
        id: `q_${Date.now()}`,
        question: { en: "", ur: "" },
        options: [
          { en: "", ur: "" },
          { en: "", ur: "" },
          { en: "", ur: "" },
          { en: "", ur: "" }
        ],
        correctAnswer: 0,
        explanation: {
          correct: { en: "", ur: "" },
          incorrect: { en: "", ur: "" }
        }
      }]
    }));
  };

  // Remove question from quiz
  const removeQuestion = (index) => {
    if (quizForm.questions.length <= 1) {
      alert("Quiz must have at least one question");
      return;
    }
    setQuizForm(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const filteredLessons = getFilteredLessons();
  const lessonCount = filteredLessons.filter(l => l.type === 'lesson').length;
  const quizCount = filteredLessons.filter(l => l.type === 'quiz').length;

  return (
    <div className="tab-content-wrapper">
      <div className="tab-header">
        <h3 className="mb-0">{t("lessonsManagement") || "Lessons & Quizzes Management"}</h3>
      </div>

      {/* Course and Level Selection */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={5}>
              <Form.Group>
                <Form.Label><strong>1. Select Course</strong></Form.Label>
                <Form.Select
                  value={selectedCourseId}
                  onChange={(e) => {
                    setSelectedCourseId(e.target.value);
                    setSelectedLevelId("");
                  }}
                >
                  <option value="">-- Select a Course --</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {getDisplayTitle(course)} (#{course.courseNumber})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={5}>
              <Form.Group>
                <Form.Label><strong>2. Select Level</strong></Form.Label>
                <Form.Select
                  value={selectedLevelId}
                  onChange={(e) => setSelectedLevelId(e.target.value)}
                  disabled={!selectedCourseId}
                >
                  <option value="">-- Select a Level --</option>
                  {getFilteredLevels().map(level => (
                    <option key={level.id} value={level.id}>
                      Level {level.level}: {getDisplayTitle(level)}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2} className="d-flex align-items-end">
              {selectedLevelId && (
                <div className="text-center w-100">
                  <Badge bg="info" className="p-2">
                    {lessonCount} Lessons, {quizCount} Quizzes
                  </Badge>
                </div>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Content Area */}
      {!selectedLevelId ? (
        <Alert variant="info">
          Please select a course and level to manage lessons and quizzes.
        </Alert>
      ) : (
        <>
          {/* Action Buttons */}
          <div className="d-flex gap-2 mb-3">
            <Button variant="success" onClick={openAddLessonModal}>
              <BookOpen size={16} className="me-1" />
              Add Lesson
            </Button>
            <Button variant="warning" onClick={openAddQuizModal}>
              <HelpCircle size={16} className="me-1" />
              Add Quiz
            </Button>
          </div>

          {/* Lessons/Quizzes List */}
          <Card>
            <Card.Header>
              <strong>Content in Level {getSelectedLevel()?.level}: {getDisplayTitle(getSelectedLevel())}</strong>
            </Card.Header>
            <Card.Body className="p-0">
              {filteredLessons.length === 0 ? (
                <div className="text-center py-5">
                  <p className="text-muted mb-3">No content added yet</p>
                  <div className="d-flex gap-2 justify-content-center">
                    <Button variant="success" size="sm" onClick={openAddLessonModal}>
                      <Plus size={14} className="me-1" />
                      Add First Lesson
                    </Button>
                    <Button variant="warning" size="sm" onClick={openAddQuizModal}>
                      <Plus size={14} className="me-1" />
                      Add First Quiz
                    </Button>
                  </div>
                </div>
              ) : (
                <ListGroup variant="flush">
                  {filteredLessons.map((item, index) => (
                    <ListGroup.Item key={item.id} className="d-flex align-items-center py-3">
                      <div className="me-3 text-muted">
                        <GripVertical size={16} />
                      </div>
                      <Badge
                        bg={item.type === 'quiz' ? 'warning' : 'primary'}
                        className="me-3"
                        style={{ minWidth: '60px' }}
                      >
                        {item.type === 'quiz' ? 'Quiz' : 'Lesson'}
                      </Badge>
                      <div className="flex-grow-1">
                        <div className="fw-bold">{getDisplayTitle(item)}</div>
                        <small className="text-muted">
                          Order: {item.order || index + 1}
                          {item.type === 'quiz' && item.questions && ` • ${item.questions.length} question(s)`}
                          {item.type === 'quiz' && item.content?.questions && ` • ${item.content.questions.length} question(s)`}
                        </small>
                      </div>
                      <div className="d-flex gap-2">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => item.type === 'quiz' ? openEditQuizModal(item) : openEditLessonModal(item)}
                        >
                          <Edit size={14} />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete(item)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card.Body>
          </Card>
        </>
      )}

      {/* Lesson Modal */}
      <Modal
        show={showModal && (modalType === "add-lesson" || modalType === "edit-lesson")}
        onHide={closeModal}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {modalType === "add-lesson" ? "Add New Lesson" : "Edit Lesson"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Title (English) *</Form.Label>
                  <Form.Control
                    type="text"
                    value={lessonForm.title.en}
                    onChange={(e) => setLessonForm(prev => ({
                      ...prev,
                      title: { ...prev.title, en: e.target.value }
                    }))}
                    placeholder="Enter lesson title"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Title (Urdu)</Form.Label>
                  <Form.Control
                    type="text"
                    value={lessonForm.title.ur}
                    onChange={(e) => setLessonForm(prev => ({
                      ...prev,
                      title: { ...prev.title, ur: e.target.value }
                    }))}
                    placeholder="سبق کا عنوان"
                    dir="rtl"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Content (English) *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={5}
                    value={lessonForm.content.en}
                    onChange={(e) => setLessonForm(prev => ({
                      ...prev,
                      content: { ...prev.content, en: e.target.value }
                    }))}
                    placeholder="Enter lesson content"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Content (Urdu)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={5}
                    value={lessonForm.content.ur}
                    onChange={(e) => setLessonForm(prev => ({
                      ...prev,
                      content: { ...prev.content, ur: e.target.value }
                    }))}
                    placeholder="سبق کا مواد"
                    dir="rtl"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Check
              type="checkbox"
              label="Add Analogy (Optional)"
              checked={lessonForm.hasAnalogy}
              onChange={(e) => setLessonForm(prev => ({ ...prev, hasAnalogy: e.target.checked }))}
              className="mb-3"
            />

            {lessonForm.hasAnalogy && (
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Analogy (English)</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      value={lessonForm.analogy.en}
                      onChange={(e) => setLessonForm(prev => ({
                        ...prev,
                        analogy: { ...prev.analogy, en: e.target.value }
                      }))}
                      placeholder="Enter analogy"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Analogy (Urdu)</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      value={lessonForm.analogy.ur}
                      onChange={(e) => setLessonForm(prev => ({
                        ...prev,
                        analogy: { ...prev.analogy, ur: e.target.value }
                      }))}
                      placeholder="مثال"
                      dir="rtl"
                    />
                  </Form.Group>
                </Col>
              </Row>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>Cancel</Button>
          <Button variant="primary" onClick={saveLesson} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Lesson"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Quiz Modal */}
      <Modal
        show={showModal && (modalType === "add-quiz" || modalType === "edit-quiz")}
        onHide={closeModal}
        size="xl"
        centered
        scrollable
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {modalType === "add-quiz" ? "Add New Quiz" : "Edit Quiz"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: '70vh' }}>
          <Form>
            <Row className="mb-4">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Quiz Title (English)</Form.Label>
                  <Form.Control
                    type="text"
                    value={quizForm.title.en}
                    onChange={(e) => setQuizForm(prev => ({
                      ...prev,
                      title: { ...prev.title, en: e.target.value }
                    }))}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Quiz Title (Urdu)</Form.Label>
                  <Form.Control
                    type="text"
                    value={quizForm.title.ur}
                    onChange={(e) => setQuizForm(prev => ({
                      ...prev,
                      title: { ...prev.title, ur: e.target.value }
                    }))}
                    dir="rtl"
                  />
                </Form.Group>
              </Col>
            </Row>

            <hr />

            {quizForm.questions.map((question, qIndex) => (
              <Card key={qIndex} className="mb-4">
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <strong>Question {qIndex + 1}</strong>
                  {quizForm.questions.length > 1 && (
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => removeQuestion(qIndex)}
                    >
                      <Trash2 size={14} /> Remove
                    </Button>
                  )}
                </Card.Header>
                <Card.Body>
                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Question (English) *</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={2}
                          value={question.question.en}
                          onChange={(e) => updateQuestion(qIndex, 'question', { ...question.question, en: e.target.value })}
                          placeholder="Enter question"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Question (Urdu)</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={2}
                          value={question.question.ur}
                          onChange={(e) => updateQuestion(qIndex, 'question', { ...question.question, ur: e.target.value })}
                          placeholder="سوال"
                          dir="rtl"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <div className="mb-3">
                    <Form.Label><strong>Options</strong> (Select correct answer)</Form.Label>
                    {question.options.map((option, optIndex) => (
                      <Row key={optIndex} className="mb-2 align-items-center">
                        <Col xs={1}>
                          <Form.Check
                            type="radio"
                            name={`correct-${qIndex}`}
                            checked={question.correctAnswer === optIndex}
                            onChange={() => updateQuestion(qIndex, 'correctAnswer', optIndex)}
                            label=""
                          />
                        </Col>
                        <Col xs={5}>
                          <Form.Control
                            type="text"
                            value={option.en}
                            onChange={(e) => updateQuestionOption(qIndex, optIndex, 'en', e.target.value)}
                            placeholder={`Option ${optIndex + 1} (English)`}
                            className={question.correctAnswer === optIndex ? 'border-success' : ''}
                          />
                        </Col>
                        <Col xs={5}>
                          <Form.Control
                            type="text"
                            value={option.ur}
                            onChange={(e) => updateQuestionOption(qIndex, optIndex, 'ur', e.target.value)}
                            placeholder={`آپشن ${optIndex + 1}`}
                            dir="rtl"
                            className={question.correctAnswer === optIndex ? 'border-success' : ''}
                          />
                        </Col>
                        <Col xs={1}>
                          {question.correctAnswer === optIndex && (
                            <Badge bg="success">Correct</Badge>
                          )}
                        </Col>
                      </Row>
                    ))}
                  </div>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-2">
                        <Form.Label>Correct Answer Explanation (English)</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={2}
                          value={question.explanation.correct.en}
                          onChange={(e) => updateQuestion(qIndex, 'explanation', {
                            ...question.explanation,
                            correct: { ...question.explanation.correct, en: e.target.value }
                          })}
                          placeholder="Explanation when correct answer is selected"
                        />
                      </Form.Group>
                      <Form.Group>
                        <Form.Label>Wrong Answer Explanation (English)</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={2}
                          value={question.explanation.incorrect.en}
                          onChange={(e) => updateQuestion(qIndex, 'explanation', {
                            ...question.explanation,
                            incorrect: { ...question.explanation.incorrect, en: e.target.value }
                          })}
                          placeholder="Explanation when wrong answer is selected"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-2">
                        <Form.Label>Correct Answer Explanation (Urdu)</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={2}
                          value={question.explanation.correct.ur}
                          onChange={(e) => updateQuestion(qIndex, 'explanation', {
                            ...question.explanation,
                            correct: { ...question.explanation.correct, ur: e.target.value }
                          })}
                          placeholder="درست جواب کی وضاحت"
                          dir="rtl"
                        />
                      </Form.Group>
                      <Form.Group>
                        <Form.Label>Wrong Answer Explanation (Urdu)</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={2}
                          value={question.explanation.incorrect.ur}
                          onChange={(e) => updateQuestion(qIndex, 'explanation', {
                            ...question.explanation,
                            incorrect: { ...question.explanation.incorrect, ur: e.target.value }
                          })}
                          placeholder="غلط جواب کی وضاحت"
                          dir="rtl"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            ))}

            <Button variant="outline-primary" onClick={addQuestion} className="w-100">
              <Plus size={16} className="me-1" />
              Add Another Question
            </Button>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>Cancel</Button>
          <Button variant="primary" onClick={saveQuiz} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Quiz"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default LessonsManagement;
