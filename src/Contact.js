import React, { useState } from "react";
import { Container, Row, Col, Form, Button, Image, Alert } from "react-bootstrap";
import Header from "./Header"; // ✅ Import Header.js
import "./styles/contact.css";

const Contact = () => {
  // State for form data
  const [formData, setFormData] = useState({
    firstName: "",
    email: "",
    message: ""
  });

  // State for form validation errors
  const [errors, setErrors] = useState({});

  // State for form submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' or 'error'

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // First Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = "First name must be at least 2 characters";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Simulate API call - replace with your actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate success/failure (90% success rate for demo)
      if (Math.random() > 0.1) {
        setSubmitStatus('success');
        // Reset form on success
        setFormData({
          firstName: "",
          email: "",
          message: ""
        });
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <>
      {/* Top Navigation/Header */}
      <Header />

      <Container className="contact-section-contact">
        {/* Top Title & Subtitle */}
        <Row className="justify-content-center text-center">
          <Col md={8}>
            <h2 className="contact-title-contact">Get in Touch</h2>
            <p className="contact-subtitle-contact">
              We'd love to hear from you! Whether you have questions, feedback,
              or just want to say hello, our team is here to help.
            </p>
          </Col>
        </Row>

        {/* Status Messages */}
        {submitStatus && (
          <Row className="justify-content-center mt-3">
            <Col md={10}>
              {submitStatus === 'success' && (
                <Alert variant="success" className="text-center">
                  <strong>Thank you!</strong> Your message has been sent successfully. 
                  We'll get back to you soon!
                </Alert>
              )}
              {submitStatus === 'error' && (
                <Alert variant="danger" className="text-center">
                  <strong>Oops!</strong> There was an error sending your message. 
                  Please try again later.
                </Alert>
              )}
            </Col>
          </Row>
        )}

        {/* Main Content */}
        <Row className="justify-content-center mt-4">
          {/* Left Side */}
          <Col md={5} className="contact-left-contact">
            <div className="contact-card-contact">
              {/* Brand logo */}
              <div className="brand-logo-contact">
                <img 
                  src="/assets/logo.png" 
                  alt="Brand Logo" 
                  className="logo-img-contact"
                  onError={(e) => {
                    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%23007bff'/%3E%3Ctext x='20' y='25' text-anchor='middle' fill='white' font-family='Arial' font-size='16' font-weight='bold'%3EZ%3C/text%3E%3C/svg%3E";
                  }}
                />
                <h5 className="brand-name-contact">ZOR</h5>
              </div>

              {/* Profile Image */}
              <Image
                src="/assets/15.png"
                alt="Contact Person"
                rounded
                fluid
                className="contact-img-contact"
                onError={(e) => {
                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Ccircle cx='100' cy='100' r='100' fill='%23f8f9fa'/%3E%3Ccircle cx='100' cy='80' r='30' fill='%236c757d'/%3E%3Cpath d='M50 150 Q100 120 150 150 L150 200 L50 200 Z' fill='%236c757d'/%3E%3C/svg%3E";
                }}
              />

              {/* Email Box */}
              <div className="email-box-contact">
                <img 
                  src="/assets/16.png" 
                  alt="Email Icon" 
                  className="email-icon-contact"
                  onError={(e) => {
                    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' fill='%23007bff' viewBox='0 0 24 24'%3E%3Cpath d='M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z'/%3E%3C/svg%3E";
                  }}
                />
                <span>Example@gmail.com</span>
              </div>

              {/* Social Links */}
              <div className="social-links-contact">
                <div>
                  <p>Follow us on</p>
                </div>
                <div>
                  <a href="#x" aria-label="Follow us on X">
                    <img 
                      src="/assets/17.png" 
                      alt="X" 
                      className="social-icon-contact"
                      onError={(e) => {
                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' fill='%23000' viewBox='0 0 24 24'%3E%3Cpath d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z'/%3E%3C/svg%3E";
                      }}
                    />
                  </a>
                  <a href="#linkedin" aria-label="Follow us on LinkedIn">
                    <img 
                      src="/assets/18.png" 
                      alt="LinkedIn" 
                      className="social-icon-contact"
                      onError={(e) => {
                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' fill='%230077b5' viewBox='0 0 24 24'%3E%3Cpath d='M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z'/%3E%3C/svg%3E";
                      }}
                    />
                  </a>
                  <a href="#insta" aria-label="Follow us on Instagram">
                    <img 
                      src="/assets/19.png" 
                      alt="Instagram" 
                      className="social-icon-contact"
                      onError={(e) => {
                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' fill='%23E4405F' viewBox='0 0 24 24'%3E%3Cpath d='M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z'/%3E%3C/svg%3E";
                      }}
                    />
                  </a>
                </div>
              </div>
            </div>
          </Col>

          {/* Right Side */}
          <Col md={5} className="contact-right-contact">
            <Form className="contact-form-contact" onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="formName">
                <Form.Label>
                  First Name <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="firstName"
                  placeholder="Enter here..."
                  value={formData.firstName}
                  onChange={handleInputChange}
                  isInvalid={!!errors.firstName}
                  disabled={isSubmitting}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.firstName}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="formEmail">
                <Form.Label>
                  Your Email <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  placeholder="Demo@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  isInvalid={!!errors.email}
                  disabled={isSubmitting}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.email}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="formMessage">
                <Form.Label>
                  Message <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  name="message"
                  placeholder="Type here..."
                  value={formData.message}
                  onChange={handleInputChange}
                  isInvalid={!!errors.message}
                  disabled={isSubmitting}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.message}
                </Form.Control.Feedback>
                <Form.Text className="text-muted">
                  {formData.message.length}/500 characters
                </Form.Text>
              </Form.Group>

              <Button 
                className="submit-btn-contact" 
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Sending...
                  </>
                ) : (
                  'Submit Now'
                )}
              </Button>
            </Form>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Contact;