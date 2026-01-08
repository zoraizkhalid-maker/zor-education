import React, { useState } from "react";
import { Card, Button, Badge, Modal, Form, Row, Col } from "react-bootstrap";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useLanguage } from "../../LanguageContext";
import { useAuth } from "../../context/AuthContext";

const LevelManagement = ({
  courses,
  courseLevels,
  lessons,
  loadCourseLevels,
  loadLessons,
  getValidCourseLevels,
}) => {
  const { t, currentLanguage } = useLanguage();
  const { createCourseLevel, updateCourseLevel, deleteCourseLevel } = useAuth();

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(""); // "add" or "edit"
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    titles: { en: "", ur: "" },
    subtitles: { en: "", ur: "" },
    level: 1,
    estimated_duration: "1.5-2 hours",
    courseId: ""
  });

  const getDisplayTitle = (item) => {
    if (!item) return "Unknown Item";
    if (item.titles && typeof item.titles === "object") {
      return item.titles[currentLanguage] || item.titles.en || item.titles.ur || "";
    }
    return "";
  };

  const getDisplaySubtitle = (item) => {
    if (item?.subtitles && typeof item.subtitles === "object") {
      return item.subtitles[currentLanguage] || item.subtitles.en || item.subtitles.ur || "";
    }
    return "";
  };

  // Get next available level for a course
  const getNextAvailableLevel = (courseId) => {
    const courseLevelsList = getValidCourseLevels()
      .filter(level => level.courseId === courseId)
      .map(level => level.level || 1)
      .sort((a, b) => a - b);

    if (courseLevelsList.length === 0) return 1;

    for (let i = 1; i <= courseLevelsList.length + 1; i++) {
      if (!courseLevelsList.includes(i)) return i;
    }
    return courseLevelsList[courseLevelsList.length - 1] + 1;
  };

  // Check if level already exists
  const isLevelExists = (courseId, level, excludeLevelId = null) => {
    return getValidCourseLevels().some(l =>
      l.courseId === courseId &&
      l.level === level &&
      l.id !== excludeLevelId
    );
  };

  // Get course levels grouped by course
  const getCourseLevelsGrouped = () => {
    const grouped = {};
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

  const openAddModal = (course = null) => {
    setModalType("add");
    setSelectedLevel(null);
    const courseId = course?.id || "";
    setSelectedCourseId(courseId);
    setFormData({
      titles: { en: "", ur: "" },
      subtitles: { en: "", ur: "" },
      level: courseId ? getNextAvailableLevel(courseId) : 1,
      estimated_duration: "1.5-2 hours",
      courseId: courseId
    });
    setShowModal(true);
  };

  const openEditModal = (level) => {
    setModalType("edit");
    setSelectedLevel(level);
    setSelectedCourseId(level.courseId);
    setFormData({
      titles: level.titles || { en: "", ur: "" },
      subtitles: level.subtitles || { en: "", ur: "" },
      level: level.level || 1,
      estimated_duration: level.estimated_duration || "1.5-2 hours",
      courseId: level.courseId
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedLevel(null);
    setSelectedCourseId("");
    setFormData({
      titles: { en: "", ur: "" },
      subtitles: { en: "", ur: "" },
      level: 1,
      estimated_duration: "1.5-2 hours",
      courseId: ""
    });
  };

  const handleCourseChange = (courseId) => {
    setSelectedCourseId(courseId);
    const nextLevel = courseId ? getNextAvailableLevel(courseId) : 1;
    setFormData(prev => ({
      ...prev,
      courseId: courseId,
      level: nextLevel
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.titles?.en) {
      alert("English title is required");
      return;
    }
    if (!formData.subtitles?.en) {
      alert("English subtitle is required");
      return;
    }
    if (!formData.courseId) {
      alert("Please select a course");
      return;
    }

    // Check for level conflicts
    const excludeLevelId = modalType === "edit" ? selectedLevel?.id : null;
    if (isLevelExists(formData.courseId, formData.level, excludeLevelId)) {
      const course = courses.find(c => c.id === formData.courseId);
      const courseName = getDisplayTitle(course) || "this course";
      alert(`Level ${formData.level} already exists for ${courseName}. Please choose a different level.`);
      return;
    }

    setIsSubmitting(true);

    try {
      if (modalType === "add") {
        const result = await createCourseLevel(formData.courseId, formData);
        if (result.success) {
          await loadCourseLevels();
          closeModal();
        }
      } else if (modalType === "edit") {
        let levelData = { ...formData };
        delete levelData.id;
        delete levelData.created_at;
        delete levelData.updated_at;
        const result = await updateCourseLevel(selectedLevel.courseId, selectedLevel.id, levelData);
        if (result.success) {
          await loadCourseLevels();
          closeModal();
        }
      }
    } catch (error) {
      console.error("Error saving level:", error);
      alert("Failed to save level. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (level) => {
    if (!window.confirm(t("confirmDelete"))) return;
    const result = await deleteCourseLevel(level.courseId, level.id);
    if (result.success) {
      await Promise.all([loadCourseLevels(), loadLessons()]);
    }
  };

  const updateBilingualField = (field, language, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [language]: value,
      },
    }));
  };

  return (
    <div className="tab-content-wrapper">
      <div className="tab-header">
        <div className="d-flex justify-content-between align-items-center w-100">
          <h3 className="mb-0">
            {t("courseLevels")} ({getValidCourseLevels().length})
          </h3>
          <Button variant="primary" onClick={() => openAddModal()} className="btn-add-level">
            <Plus size={16} className="me-1" />
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
              <Button variant="primary" onClick={() => openAddModal()} className="mt-2">
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
                          {courseData.count} {t("levels")} • Course #{courseData.course.courseNumber || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => openAddModal(courseData.course)}
                      className="add-level-btn"
                    >
                      <Plus size={14} className="me-1" />
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
                                  Duration: {level.estimated_duration || "Not specified"}
                                </Badge>
                              </div>
                            </div>

                            <div className="level-actions-enhanced">
                              <Row>
                                <Col xs={6}>
                                  <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={() => openEditModal(level)}
                                    className="w-100 action-btn-edit"
                                  >
                                    <Edit size={14} className="me-1" />
                                    Edit
                                  </Button>
                                </Col>
                                <Col xs={6}>
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => handleDelete(level)}
                                    className="w-100 action-btn-delete"
                                  >
                                    <Trash2 size={14} className="me-1" />
                                    Delete
                                  </Button>
                                </Col>
                              </Row>
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

      {/* Add/Edit Level Modal */}
      <Modal show={showModal} onHide={closeModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {modalType === "add" ? "Add New Level" : "Edit Level"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Select Course *</Form.Label>
                  <Form.Select
                    value={formData.courseId || ""}
                    onChange={(e) => handleCourseChange(e.target.value)}
                    required
                    disabled={modalType === "edit"}
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
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Level Number *</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    value={formData.level || 1}
                    onChange={(e) => setFormData(prev => ({ ...prev, level: parseInt(e.target.value) || 1 }))}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Duration</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.estimated_duration || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimated_duration: e.target.value }))}
                    placeholder="e.g., 1.5-2 hours"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Title (English) *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.titles?.en || ""}
                    onChange={(e) => updateBilingualField("titles", "en", e.target.value)}
                    placeholder="Enter level title in English"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Title (Urdu)</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.titles?.ur || ""}
                    onChange={(e) => updateBilingualField("titles", "ur", e.target.value)}
                    placeholder="لیول کا عنوان اردو میں"
                    dir="rtl"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Subtitle (English) *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.subtitles?.en || ""}
                    onChange={(e) => updateBilingualField("subtitles", "en", e.target.value)}
                    placeholder="Enter level subtitle in English"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Subtitle (Urdu)</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.subtitles?.ur || ""}
                    onChange={(e) => updateBilingualField("subtitles", "ur", e.target.value)}
                    placeholder="لیول کا ذیلی عنوان اردو میں"
                    dir="rtl"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : (modalType === "add" ? "Create Level" : "Save Changes")}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default LevelManagement;
