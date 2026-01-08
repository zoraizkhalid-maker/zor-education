import React, { useState } from "react";
import { Card, Button, Badge, Modal, Form, Row, Col } from "react-bootstrap";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useLanguage } from "../../LanguageContext";
import { useAuth } from "../../context/AuthContext";

const CourseManagement = ({
  courses,
  courseLevels,
  lessons,
  loadCourses,
  loadCourseLevels,
  loadLessons,
  getValidCourseLevels,
}) => {
  const { t, currentLanguage } = useLanguage();
  const { createCourse, updateCourse, deleteCourse, uploadFile } = useAuth();

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(""); // "add" or "edit"
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    titles: { en: "", ur: "" },
    descriptions: { en: "", ur: "" },
    image: "/assets/cap.png",
    active: true,
    courseNumber: "",
    estimated_duration: "25-30 hours"
  });

  const getDisplayTitle = (item) => {
    if (!item) return "Unknown Item";
    if (item.titles && typeof item.titles === "object") {
      return item.titles[currentLanguage] || item.titles.en || item.titles.ur || "";
    }
    return "";
  };

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

  const openAddModal = () => {
    setModalType("add");
    setSelectedCourse(null);
    setFormData({
      titles: { en: "", ur: "" },
      descriptions: { en: "", ur: "" },
      image: "/assets/cap.png",
      active: true,
      courseNumber: generateNextCourseNumber(),
      estimated_duration: "25-30 hours"
    });
    setShowModal(true);
  };

  const openEditModal = (course) => {
    setModalType("edit");
    setSelectedCourse(course);
    setFormData({
      titles: course.titles || { en: "", ur: "" },
      descriptions: course.descriptions || { en: "", ur: "" },
      image: course.image || "/assets/cap.png",
      active: course.active !== false,
      courseNumber: course.courseNumber || "",
      estimated_duration: course.estimated_duration || "25-30 hours"
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCourse(null);
    setFormData({
      titles: { en: "", ur: "" },
      descriptions: { en: "", ur: "" },
      image: "/assets/cap.png",
      active: true,
      courseNumber: "",
      estimated_duration: "25-30 hours"
    });
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.titles?.en) {
      alert("English title is required");
      return;
    }

    setIsSubmitting(true);

    try {
      let courseData = { ...formData };

      // Handle image upload if there's a new file
      if (formData.imageFile) {
        const imageUrl = await handleImageUpload(formData.imageFile);
        if (imageUrl) {
          courseData.image = imageUrl;
        }
        delete courseData.imageFile;
      }

      if (modalType === "add") {
        const result = await createCourse(courseData);
        if (result.success) {
          await loadCourses();
          closeModal();
        }
      } else if (modalType === "edit") {
        delete courseData.id;
        delete courseData.created_at;
        delete courseData.updated_at;
        const result = await updateCourse(selectedCourse.id, courseData);
        if (result.success) {
          await loadCourses();
          closeModal();
        }
      }
    } catch (error) {
      console.error("Error saving course:", error);
      alert("Failed to save course. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm(t("confirmDelete"))) return;
    const result = await deleteCourse(courseId);
    if (result.success) {
      await Promise.all([loadCourses(), loadCourseLevels(), loadLessons()]);
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
            {t("courses")} ({courses.length})
          </h3>
          <Button variant="primary" onClick={openAddModal} className="btn-add-course">
            <Plus size={16} className="me-1" />
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
              <Button variant="primary" onClick={openAddModal} className="mt-2">
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
                          <Badge bg={course.active ? "success" : "secondary"} className="status-badge">
                            {course.active ? t("active") : t("inactive")}
                          </Badge>
                        </div>
                      </div>
                      <div className="course-info">
                        <h5 className="course-title">{getDisplayTitle(course) || `Course ${index + 1}`}</h5>
                        <div className="course-meta">
                          <small className="text-muted">
                            Course #{course.courseNumber || 'N/A'}
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
                        <Row>
                          <Col xs={6}>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => openEditModal(course)}
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
                              onClick={() => handleDelete(course.id)}
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
          )}
        </Card.Body>
      </Card>

      {/* Add/Edit Course Modal */}
      <Modal show={showModal} onHide={closeModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {modalType === "add" ? "Add New Course" : "Edit Course"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Title (English) *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.titles?.en || ""}
                    onChange={(e) => updateBilingualField("titles", "en", e.target.value)}
                    placeholder="Enter course title in English"
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
                    placeholder="کورس کا عنوان اردو میں"
                    dir="rtl"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Description (English)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={formData.descriptions?.en || ""}
                    onChange={(e) => updateBilingualField("descriptions", "en", e.target.value)}
                    placeholder="Enter course description in English"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Description (Urdu)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={formData.descriptions?.ur || ""}
                    onChange={(e) => updateBilingualField("descriptions", "ur", e.target.value)}
                    placeholder="کورس کی تفصیل اردو میں"
                    dir="rtl"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Course Number</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.courseNumber || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, courseNumber: e.target.value }))}
                    placeholder="e.g., 0001"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Estimated Duration</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.estimated_duration || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimated_duration: e.target.value }))}
                    placeholder="e.g., 25-30 hours"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={formData.active ? "active" : "inactive"}
                    onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.value === "active" }))}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Course Image</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFormData(prev => ({ ...prev, imageFile: e.target.files[0] }))}
                  />
                  {formData.image && (
                    <div className="mt-2">
                      <img
                        src={formData.image}
                        alt="Course preview"
                        style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'cover' }}
                      />
                    </div>
                  )}
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
            {isSubmitting ? "Saving..." : (modalType === "add" ? "Create Course" : "Save Changes")}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CourseManagement;
