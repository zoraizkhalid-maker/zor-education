import React, { useState, useRef } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert } from 'react-bootstrap';
import { Camera, User, Save, ArrowLeft, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import { useLanguage } from './LanguageContext';
import { useAuth } from './context/AuthContext';
import './styles/profile.css';

const Profile = () => {
    const { user, userData, isAdmin, updateDocById, refreshUserData, uploadFile } = useAuth();
    const { t, isRTL } = useLanguage();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        full_name: userData?.full_name || userData?.first_name || '',
        profile_pic: userData?.profile_pic || ''
    });

    const [isLoading, setIsLoading] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [previewImage, setPreviewImage] = useState(userData?.profile_pic || '');
    const [selectedFile, setSelectedFile] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setMessage({
                    type: 'error',
                    text: t('invalidImageType') || 'Please select a valid image file'
                });
                return;
            }

            // Validate file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                setMessage({
                    type: 'error',
                    text: t('imageSizeLimit') || 'Image size should be less than 5MB'
                });
                return;
            }

            // Set selected file and create preview
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewImage(e.target.result);
            };
            reader.readAsDataURL(file);
            
            // Clear any previous messages
            setMessage({ type: '', text: '' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ type: '', text: '' });

        try {
            let profilePicUrl = formData.profile_pic;

            // If there's a new image file selected, upload it first
            if (selectedFile) {
                setIsUploadingImage(true);
                console.log('Uploading profile image...');
                
                try {
                    const uploadResult = await uploadFile(selectedFile, `profile_images/${user.uid}_${Date.now()}`);
                    if (uploadResult.success) {
                        profilePicUrl = uploadResult.downloadURL;
                        console.log('Profile image uploaded successfully:', profilePicUrl);
                    } else {
                        throw new Error(uploadResult.error || 'Failed to upload image');
                    }
                } catch (uploadError) {
                    console.error('Image upload error:', uploadError);
                    setMessage({
                        type: 'error',
                        text: t('imageUploadError') || 'Failed to upload image. Please try again.'
                    });
                    return;
                } finally {
                    setIsUploadingImage(false);
                }
            }

            // Update user profile data
            const updatedData = {
                ...userData,
                full_name: formData.full_name,
                profile_pic: profilePicUrl
            };

            await updateDocById('users', user?.uid, updatedData);
            await refreshUserData();

            // Update form data with the uploaded image URL
            setFormData(prev => ({
                ...prev,
                profile_pic: profilePicUrl
            }));

            // Clear selected file since it's now uploaded
            setSelectedFile(null);

            setMessage({
                type: 'success',
                text: t('profileUpdated') || 'Profile updated successfully!'
            });

            // Clear message after 3 seconds
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);

        } catch (error) {
            console.error('Profile update error:', error);
            setMessage({
                type: 'error',
                text: t('updateError') || 'Failed to update profile. Please try again.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoBack = () => {
        if (isAdmin) {
            navigate('/dashboard');
        } else {
            navigate('/home');
        }
    };

    const getProfileInitial = () => {
        const name = formData.full_name || userData?.email || 'U';
        return name.charAt(0).toUpperCase();
    };

    return (
        <>
            <Header />
            <div className={`profile-container ${isRTL ? 'rtl' : 'ltr'}`}>
                <Container>
                    <Row className="justify-content-center">
                        <Col xs={12} md={8} lg={6}>
                            <Card className="profile-card">
                                <Card.Header className="profile-card-header">
                                    <div className={`profile-header-content ${isRTL ? 'rtl-flex-reverse' : ''}`}>
                                        <Button
                                            variant="outline-secondary"
                                            size="sm"
                                            onClick={handleGoBack}
                                            className="back-button"
                                        >
                                            <ArrowLeft size={16} style={{ transform: isRTL ? 'scaleX(-1)' : 'none' }} />
                                            {t('back') || 'Back'}
                                        </Button>
                                        <h3 className="profile-title">
                                            <User size={20} />
                                            {t('profile') || 'Profile'}
                                        </h3>
                                    </div>
                                </Card.Header>

                                <Card.Body className="profile-card-body">
                                    {message.text && (
                                        <Alert
                                            variant={message.type === 'success' ? 'success' : 'danger'}
                                            className="profile-alert"
                                        >
                                            {message.text}
                                        </Alert>
                                    )}

                                    <Form onSubmit={handleSubmit}>
                                        {/* Profile Picture Section */}
                                        <div className="profile-image-section">
                                            <div className="profile-image-wrapper">
                                                <div
                                                    className="profile-image-container"
                                                    onClick={handleImageClick}
                                                >
                                                    {previewImage ? (
                                                        <img
                                                            src={previewImage}
                                                            alt="Profile"
                                                            className="profile-image"
                                                        />
                                                    ) : (
                                                        <div className="profile-image-placeholder">
                                                            <span className="profile-initial">{getProfileInitial()}</span>
                                                        </div>
                                                    )}
                                                    <div className="profile-image-overlay">
                                                        {isUploadingImage ? (
                                                            <div className="upload-spinner">
                                                                <div className="spinner-border text-light" role="status">
                                                                    <span className="visually-hidden">Uploading...</span>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <Camera size={24} />
                                                        )}
                                                    </div>
                                                </div>
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                    style={{ display: 'none' }}
                                                />
                                            </div>
                                            <p className="profile-image-hint">
                                                {isUploadingImage 
                                                    ? (t('uploadingImage') || 'Uploading image...')
                                                    : selectedFile
                                                        ? (t('imageSelected') || `Selected: ${selectedFile.name}`)
                                                        : (t('clickToChangePhoto') || 'Click to change profile photo')
                                                }
                                            </p>
                                        </div>

                                        {/* Form Fields */}
                                        <Row>
                                            <Col xs={12}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label className="profile-form-label">
                                                        {t('fullName') || 'Full Name'}
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="full_name"
                                                        value={formData.full_name}
                                                        onChange={handleInputChange}
                                                        placeholder={t('enterFullName') || 'Enter your full name'}
                                                        className="profile-form-input"
                                                        required
                                                    />
                                                </Form.Group>
                                            </Col>

                                            <Col xs={12}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label className="profile-form-label">
                                                        {t('email') || 'Email'}
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="email"
                                                        value={userData?.email || ''}
                                                        className="profile-form-input"
                                                        disabled
                                                        style={{
                                                            backgroundColor: '#f8f9fa',
                                                            color: '#6c757d',
                                                            cursor: 'not-allowed'
                                                        }}
                                                    />
                                                    <Form.Text className="text-muted">
                                                        {t('emailCannotBeChanged') || 'Email address cannot be changed'}
                                                    </Form.Text>
                                                </Form.Group>
                                            </Col>

                                            <Col xs={12}>
                                                <div className="profile-form-actions">
                                                    <Button
                                                        type="submit"
                                                        className="save-profile-button"
                                                        disabled={isLoading || isUploadingImage}
                                                    >
                                                        {isLoading ? (
                                                            <div className="loading-spinner">
                                                                <div className="spinner-border spinner-border-sm me-2" role="status">
                                                                    <span className="visually-hidden">Loading...</span>
                                                                </div>
                                                                {isUploadingImage 
                                                                    ? (t('uploadingImage') || 'Uploading Image...') 
                                                                    : (t('saving') || 'Saving...')
                                                                }
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <Save size={16} />
                                                                {t('saveChanges') || 'Save Changes'}
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                            </Col>
                                        </Row>
                                    </Form>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        </>
    );
};

export default Profile;