import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from './LanguageContext';
import './styles/login.css';
import { useAuth } from './context/AuthContext';
import { toast } from 'react-toastify';
import { Eye, EyeOff } from 'lucide-react';
import LanguageSelector from './components/LanguageSelector';

const Login = () => {
    const { login, signInWithGoogle } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();
    const { t, isRTL } = useLanguage();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error('Please fill all the fields!');
            return;
        }

        setIsSubmitting(true);

        const result = await login(
            email,
            password,
        );

        if (result.success) {
            setEmail("");
            setPassword("");
        }

        setIsSubmitting(false);
    };
    const handleGoogleSignIn = async () => {
        if (isSubmitting) return;
        
        setIsSubmitting(true);
        
        try {
            const result = await signInWithGoogle();
            if (result.success) {
                // Navigation will be handled by AuthContext
            }
        } catch (error) {
            console.error('Google sign-in error:', error);
        }
        
        setIsSubmitting(false);
    };

    const handleSignUpClick = () => {
        navigate('/signup');
    };

    return (
        <div className={`zor-login-wrapper ${isRTL ? 'rtl-login' : ''}`}>
            <LanguageSelector className="auth-page-language-selector" />
            <div className="zor-login-container">
                {/* Left side - Login Form */}
                <div className="zor-login-form-section">
                    <div className={`zor-login-form-container ${isRTL ? 'rtl-form' : ''}`}>
                        {/* Brand Section */}
                        <div className="zor-brand-section">
                            <div className="zor-logo-circle">
                                <img src={('./assets/logo.png')} alt="ZOR Logo" className="zor-logo-image" />
                            </div>

                            <h2 className="zor-welcome-title">{t('welcomeToZor')}</h2>
                            <p className="zor-welcome-subtitle">
                                {t('welcomeSubtitle')}
                            </p>
                        </div>

                        {/* Login Form */}
                        <form onSubmit={handleSubmit} className="zor-form-container">
                            <div className="zor-form-group">
                                <label className="zor-form-label" htmlFor="email">{t('email')}</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={`zor-form-input ${isRTL ? 'rtl-input' : ''}`}
                                    autoComplete="new-email"
                                    autoFocus={false}
                                    required
                                    disabled={isSubmitting}
                                    style={{ direction: 'ltr', textAlign: 'left' }}
                                />
                            </div>

                            <div className="zor-form-group">
                                <label className="zor-form-label" htmlFor="password">{t('password')}</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        name="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className={`zor-form-input ${isRTL ? 'rtl-input' : ''}`}
                                        autoComplete="new-password"
                                        required
                                        disabled={isSubmitting}
                                        style={{ direction: 'ltr', textAlign: 'left', paddingRight: '40px' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{
                                            position: 'absolute',
                                            right: '12px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            padding: '4px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#666'
                                        }}
                                        disabled={isSubmitting}
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <div className={`zor-form-options ${isRTL ? 'rtl-form-options' : ''}`}>
                                <div className={`zor-remember-container ${isRTL ? 'rtl-remember' : ''}`}>
                                    <input
                                        type="checkbox"
                                        id="remember-me"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="zor-remember-checkbox"
                                    />
                                    <label htmlFor="remember-me" className="zor-remember-label">
                                        {t('rememberMe')}
                                    </label>
                                </div>
                                <a href="#forgot" className="zor-forgot-link">
                                    {t('forgotPassword')}
                                </a>
                            </div>

                            <button
                                type="submit"
                                className="zor-signin-btn"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? t('signingIn') : t('signIn')}
                            </button>
                        </form>

                        <button
                            type="button"
                            onClick={handleGoogleSignIn}
                            className={`zor-google-btn ${isRTL ? 'rtl-google-btn' : ''}`}
                            disabled={isSubmitting}
                        >
                            <img src="/assets/google.png" alt="Google Logo" className="zor-google-icon" />
                            {isSubmitting ? 'Signing in...' : t('signInWithGoogle')}
                        </button>

                        <p className="zor-signup-text">
                            {t('dontHaveAccount')}{' '}
                            <button
                                type="button"
                                onClick={handleSignUpClick}
                                className="zor-signup-link"
                            >
                                {t('signUp')}
                            </button>
                        </p>
                    </div>
                </div>

                {/* Right side - Hero Image with Bus */}
                <div className="zor-hero-section">
                    <div
                        className="zor-hero-background"
                        style={{ backgroundImage: 'url(/assets/1.png)' }}
                    ></div>

                    {/* Text Overlay at Bottom */}
                    <div className={`zor-text-overlay ${isRTL ? 'rtl-overlay' : ''}`}
                        style={{ fontFamily: isRTL ? '"Noto Nastaliq Urdu", serif' : 'inherit' }}>
                        <h1 className="zor-hero-title"
                            style={{ fontFamily: isRTL ? '"Noto Nastaliq Urdu", serif' : 'inherit' }}>
                            {isRTL ? (
                                <>
                                    آپ کے لرننگ جرنی میں{' '}
                                    <span className="zor-hero-highlight">خوش آمدید!</span>
                                </>
                            ) : (
                                <>
                                    <span className="zor-hero-highlight">Welcome!</span>
                                    to your learning journey
                                </>
                            )}
                        </h1>
                        <p className="zor-hero-subtitle"
                            style={{ fontFamily: isRTL ? '"Noto Nastaliq Urdu", serif' : 'inherit' }}>
                            {isRTL
                                ? 'مفت کمپیوٹر کورسز سیکھیں، اپنی مہارت بڑھائیں اور نئے مواقع حاصل کریں'
                                : 'Learn free computer courses, enhance your skills and discover new opportunities'
                            }
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;