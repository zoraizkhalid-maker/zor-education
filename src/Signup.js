import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles/signup.css";
import { useLanguage } from "./LanguageContext";
import { useAuth } from "./context/AuthContext";
import { toast } from "react-toastify";
import { Eye, EyeOff } from 'lucide-react';
import LanguageSelector from './components/LanguageSelector';

const Signup = () => {
  const { t, isRTL } = useLanguage();
  const { signUp, signInWithGoogle, isLoading } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim() || !email || !password || !confirmPassword || !agreeToTerms) {
      toast.error('Please fill all the fields!');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Password and Confirm password did not matched!');
      return;
    }

    setIsSubmitting(true);

    const result = await signUp({
      email,
      password,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
    });

    if (result.success) {
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setAgreeToTerms(false);
    }

    setIsSubmitting(false);
  };

  const handleGoogleSignUp = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const result = await signInWithGoogle();
      if (result.success) {
        // Navigation will be handled by AuthContext
      }
    } catch (error) {
      console.error('Google sign-up error:', error);
    }
    
    setIsSubmitting(false);
  };

  const handleSignInClick = () => {
    navigate("/login");
  };

  return (
    <div className={`zor-signup-wrapper-signup ${isRTL ? "rtl-signup" : ""}`}>
      <LanguageSelector className="auth-page-language-selector" />
      <div className="zor-signup-container-signup">
        <div className="zor-signup-form-section-signup">
          <div
            className={`zor-signup-form-container-signup ${isRTL ? "rtl-form" : ""
              }`}
          >
            <div className="zor-brand-section-signup">
              <div className="zor-logo-circle-signup">
                <img
                  src={"./assets/logo.png"}
                  alt="ZOR Logo"
                  className="zor-logo-image-signup"
                />
              </div>

              <h2 className="zor-welcome-title-signup">{t("createAccount")}</h2>
              <p className="zor-welcome-subtitle-signup">{t("joinZor")}</p>
            </div>

            <form onSubmit={handleSubmit} className="zor-form-container-signup">
              <div
                className={`zor-name-row-signup ${isRTL ? "rtl-name-row" : ""}`}
              >
                {isRTL ? (
                  <>
                    <div className="zor-form-group-signup zor-form-group-half-signup">
                      <label
                        className="zor-form-label-signup"
                        htmlFor="lastName"
                      >
                        {t("lastName")}
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        placeholder="Enter your last name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className={`zor-form-input-signup ${isRTL ? "rtl-input" : ""
                          }`}
                        autoComplete="family-name"
                        required
                        disabled={isSubmitting}
                        style={{ direction: 'ltr', textAlign: 'left' }}
                      />
                    </div>
                    <div className="zor-form-group-signup zor-form-group-half-signup">
                      <label
                        className="zor-form-label-signup"
                        htmlFor="firstName"
                      >
                        {t("firstName")}
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        placeholder="Enter your first name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className={`zor-form-input-signup ${isRTL ? "rtl-input" : ""
                          }`}
                        autoComplete="given-name"
                        required
                        disabled={isSubmitting}
                        style={{ direction: 'ltr', textAlign: 'left' }}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="zor-form-group-signup zor-form-group-half-signup">
                      <label
                        className="zor-form-label-signup"
                        htmlFor="firstName"
                      >
                        {t("firstName")}
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        placeholder="Enter your first name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className={`zor-form-input-signup ${isRTL ? "rtl-input" : ""
                          }`}
                        autoComplete="given-name"
                        required
                        disabled={isSubmitting}
                        style={{ direction: 'ltr', textAlign: 'left' }}
                      />
                    </div>

                    <div className="zor-form-group-signup zor-form-group-half-signup">
                      <label
                        className="zor-form-label-signup"
                        htmlFor="lastName"
                      >
                        {t("lastName")}
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        placeholder="Enter your last name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className={`zor-form-input-signup ${isRTL ? "rtl-input" : ""
                          }`}
                        autoComplete="family-name"
                        required
                        disabled={isSubmitting}
                        style={{ direction: 'ltr', textAlign: 'left' }}
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="zor-form-group-signup">
                <label className="zor-form-label-signup" htmlFor="email">
                  {t("email")}
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`zor-form-input-signup ${isRTL ? "rtl-input" : ""
                    }`}
                  autoComplete="email"
                  required
                  disabled={isSubmitting}
                  style={{ direction: 'ltr', textAlign: 'left' }}
                />
              </div>

              <div className="zor-form-group-signup">
                <label className="zor-form-label-signup" htmlFor="password">
                  {t("password")}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`zor-form-input-signup ${isRTL ? "rtl-input" : ""
                      }`}
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

              <div className="zor-form-group-signup">
                <label
                  className="zor-form-label-signup"
                  htmlFor="confirmPassword"
                >
                  {t("confirmPassword")}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`zor-form-input-signup ${isRTL ? "rtl-input" : ""
                      }`}
                    autoComplete="new-password"
                    required
                    disabled={isSubmitting}
                    style={{ direction: 'ltr', textAlign: 'left', paddingRight: '40px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="zor-form-options-signup">
                <div
                  className={`zor-terms-container-signup ${isRTL ? "rtl-terms" : ""
                    }`}
                >
                  <input
                    type="checkbox"
                    id="agree-terms"
                    checked={agreeToTerms}
                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                    className="zor-terms-checkbox-signup"
                    required
                    disabled={isSubmitting}
                  />
                  <label
                    htmlFor="agree-terms"
                    className="zor-terms-label-signup"
                  >
                    {t("agreeToTerms")}{" "}
                    <a href="#terms" className="zor-terms-link-signup">
                      {t("termsOfService")}
                    </a>{" "}
                    {t("and")}{" "}
                    <a href="#privacy" className="zor-terms-link-signup">
                      {t("privacyPolicy")}
                    </a>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="zor-signup-btn-signup"
                disabled={isSubmitting || isLoading}
              >
                {isSubmitting ? "Creating Account..." : t("createAccountBtn")}
              </button>
            </form>

            <button
              type="button"
              onClick={handleGoogleSignUp}
              className={`zor-google-btn ${isRTL ? 'rtl-google-btn' : ''}`}
              disabled={isSubmitting || isLoading}
              style={{
                marginTop: "1rem",
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                padding: "0.75rem 1rem",
                border: "1px solid #ddd",
                borderRadius: "0.375rem",
                backgroundColor: "#fff",
                color: "#333",
                fontSize: "0.875rem",
                fontWeight: "500",
                cursor: isSubmitting || isLoading ? "not-allowed" : "pointer",
                opacity: isSubmitting || isLoading ? 0.6 : 1
              }}
            >
              <img 
                src="/assets/google.png" 
                alt="Google Logo" 
                style={{ width: "20px", height: "20px" }}
              />
              {isSubmitting ? "Signing up..." : t('signUpWithGoogle') || 'Sign up with Google'}
            </button>

            <p className="zor-signin-text-signup">
              {t("alreadyHaveAccount")}{" "}
              <button
                type="button"
                onClick={handleSignInClick}
                className="zor-signin-link-signup"
                disabled={isSubmitting}
              >
                {t("signIn")}
              </button>
            </p>
          </div>
        </div>

        <div className="zor-hero-section-signup">
          <div
            className="zor-hero-background-signup"
            style={{ backgroundImage: "url(/assets/1.png)" }}
          ></div>

          <div
            className={`zor-text-overlay-signup ${isRTL ? "rtl-overlay" : ""}`}
            style={{
              fontFamily: isRTL ? '"Noto Nastaliq Urdu", serif' : "inherit",
            }}
          >
            <h1
              className="zor-hero-title-signup"
              style={{
                fontFamily: isRTL ? '"Noto Nastaliq Urdu", serif' : "inherit",
              }}
            >
              {t("heroWelcomeTitle")}{" "}
              <span className="zor-hero-highlight-signup">
                {t("heroStartNow")}
              </span>
            </h1>
            <p
              className="zor-hero-subtitle-signup"
              style={{
                fontFamily: isRTL ? '"Noto Nastaliq Urdu", serif' : "inherit",
              }}
            >
              {t("heroSubtitle")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;