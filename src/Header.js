import React from 'react';
import { Search, Bell, Globe, User, LogOut, RefreshCw, Download } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from './LanguageContext';
import { useAuth } from './context/AuthContext';
import Avatar from './components/Avatar';
import NotificationDropdown from './components/NotificationDropdown';
import './styles/header.css';

const Header = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = React.useState(false);
    const [isSyncing, setIsSyncing] = React.useState(false);
    const [deferredPrompt, setDeferredPrompt] = React.useState(null);
    const [isInstallable, setIsInstallable] = React.useState(false);
    const [isInstalling, setIsInstalling] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [searchResults, setSearchResults] = React.useState([]);
    const [showSearchResults, setShowSearchResults] = React.useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { t, changeLanguage, currentLanguage, isRTL, languages } = useLanguage();
    const { userData, isAdmin, signOut, triggerManualSync, allCourses, allCoursesLevels } = useAuth();

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const toggleProfileDropdown = () => {
        setIsProfileDropdownOpen(!isProfileDropdownOpen);
    };

    const handleNavigation = (path) => {
        navigate(path);
        setIsMobileMenuOpen(false);
    };

    const handleLogoClick = () => {
        if (isAdmin) {
            navigate('/dashboard');
        } else {
            navigate('/home');
        }
    };

    const handleLogout = () => {
        signOut();
        navigate('/login');
        setIsProfileDropdownOpen(false);
    };

    const handleProfile = () => {
        navigate('/profile');
        setIsProfileDropdownOpen(false);
    };

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            await triggerManualSync();
        } catch (error) {
            console.error('Sync error:', error);
        } finally {
            setIsSyncing(false);
        }
    };

    // Search functionality
    const handleSearch = (query) => {
        setSearchQuery(query);

        if (!query.trim()) {
            setSearchResults([]);
            setShowSearchResults(false);
            return;
        }

        const results = [];
        const searchLower = query.toLowerCase();

        // Search through courses
        allCourses.forEach(course => {
            const courseTitleEn = course.titles?.en?.toLowerCase() || '';
            const courseTitleUr = course.titles?.ur?.toLowerCase() || '';

            // Check if course title matches
            if (courseTitleEn.includes(searchLower) || courseTitleUr.includes(searchLower)) {
                results.push({
                    type: 'course',
                    id: course.id,
                    title: currentLanguage === 'ur' ? (course.titles?.ur || course.titles?.en) : (course.titles?.en || course.titles?.ur),
                    courseId: course.id,
                    courseName: currentLanguage === 'ur' ? (course.titles?.ur || course.titles?.en) : (course.titles?.en || course.titles?.ur)
                });
            }

            // Search through course levels (lessons)
            const courseLevels = allCoursesLevels.filter(level => level.courseId === course.id);
            courseLevels.forEach(level => {
                const levelTitleEn = level.titles?.en?.toLowerCase() || '';
                const levelTitleUr = level.titles?.ur?.toLowerCase() || '';

                // Check if level title matches
                if (levelTitleEn.includes(searchLower) || levelTitleUr.includes(searchLower)) {
                    results.push({
                        type: 'lesson',
                        id: level.id,
                        title: currentLanguage === 'ur' ? (level.titles?.ur || level.titles?.en) : (level.titles?.en || level.titles?.ur),
                        courseId: course.id,
                        courseName: currentLanguage === 'ur' ? (course.titles?.ur || course.titles?.en) : (course.titles?.en || course.titles?.ur),
                        levelId: level.id,
                        level: level.level
                    });
                }

                // Search through lessons inside levels
                if (level.lessons && Array.isArray(level.lessons)) {
                    level.lessons.forEach(lesson => {
                        const lessonTitleEn = lesson.titles?.en?.toLowerCase() || '';
                        const lessonTitleUr = lesson.titles?.ur?.toLowerCase() || '';

                        if (lessonTitleEn.includes(searchLower) || lessonTitleUr.includes(searchLower)) {
                            results.push({
                                type: 'lesson',
                                id: lesson.id,
                                title: currentLanguage === 'ur' ? (lesson.titles?.ur || lesson.titles?.en) : (lesson.titles?.en || lesson.titles?.ur),
                                courseId: course.id,
                                courseName: currentLanguage === 'ur' ? (course.titles?.ur || course.titles?.en) : (course.titles?.en || course.titles?.ur),
                                levelId: level.id,
                                level: level.level,
                                lessonType: lesson.type
                            });
                        }
                    });
                }
            });
        });

        setSearchResults(results);
        setShowSearchResults(results.length > 0);
    };

    const handleSearchResultClick = (result) => {
        if (result.type === 'course') {
            navigate('/course-levels', { state: { selectedCourseId: result.courseId } });
        } else if (result.type === 'lesson') {
            navigate('/course-lessons', {
                state: {
                    selectedCourseId: result.courseId,
                    selectedLevelId: result.levelId
                }
            });
        }
        setSearchQuery('');
        setSearchResults([]);
        setShowSearchResults(false);
    };

    const handleSearchInputChange = (e) => {
        handleSearch(e.target.value);
    };

    const handleSearchKeyPress = (e) => {
        if (e.key === 'Enter' && searchResults.length > 0) {
            // Navigate to first result on Enter
            handleSearchResultClick(searchResults[0]);
        }
    };

    // PWA Install functionality
    React.useEffect(() => {
        const handleBeforeInstallPrompt = (e) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Save the event so it can be triggered later
            setDeferredPrompt(e);
            setIsInstallable(true);
            console.log('🎯 PWA install prompt available');
        };

        const handleAppInstalled = () => {
            console.log('✅ PWA was installed successfully');
            setIsInstallable(false);
            setDeferredPrompt(null);
            localStorage.removeItem('pwa-install-available');
        };

        // Check if already installed
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
            || window.navigator.standalone 
            || document.referrer.includes('android-app://');
        
        if (isStandalone) {
            setIsInstallable(false);
            console.log('📱 PWA is already installed');
        } else {
            // Listen for the install prompt
            window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.addEventListener('appinstalled', handleAppInstalled);
            
            // IMMEDIATE CHECK: Show install button right away on HTTPS
            const isHttps = location.protocol === 'https:' || location.hostname === 'localhost';
            const hasManifest = document.querySelector('link[rel="manifest"]');
            const hasServiceWorker = 'serviceWorker' in navigator;
            
            console.log('🔍 Immediate PWA Check:', {
                isHttps,
                hasManifest: !!hasManifest,
                hasServiceWorker,
                hostname: location.hostname
            });
            
            // Show install button immediately if basic criteria are met
            if (isHttps && hasManifest && hasServiceWorker) {
                console.log('🚀 Showing install button immediately - PWA ready');
                setIsInstallable(true);
            }
            
            // Additional check after a short delay for service worker readiness
            setTimeout(() => {
                if (!isInstallable && isHttps && hasManifest && hasServiceWorker) {
                    console.log('🔄 Secondary check - showing install button');
                    setIsInstallable(true);
                }
            }, 1000);
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const handleInstallClick = async () => {
        setIsInstalling(true);
        
        try {
            if (deferredPrompt) {
                // Real PWA install in production
                console.log('🚀 Triggering PWA install prompt...');
                await deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                
                if (outcome === 'accepted') {
                    console.log('✅ User accepted the install prompt');
                    // Hide the button immediately since app will be installed
                    setIsInstallable(false);
                    localStorage.setItem('pwa-installed', 'true');
                } else {
                    console.log('❌ User dismissed the install prompt');
                    // Keep button visible in case user changes mind
                }
                
                // Clear the prompt as it can only be used once
                setDeferredPrompt(null);
            } else {
                // Fallback: No deferred prompt available
                console.log('⚠️ No deferred prompt available');
                
                if (process.env.NODE_ENV === 'development') {
                    // Development mode - show instructions
                    alert(`Install Button Works! 🎉\n\nTo test real PWA installation:\n1. Build the app: npm run build\n2. Serve it: serve -s build\n3. Open in Chrome/Edge\n4. Look for install icon in address bar\n\nOr visit the live HTTPS version of your app.`);
                } else {
                    // Production: Guide user to browser's native install
                    console.log('💡 Guiding user to browser install option');
                    
                    // Check browser type for specific instructions
                    const isChrome = /Chrome/.test(navigator.userAgent);
                    const isEdge = /Edge/.test(navigator.userAgent);
                    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
                    
                    let message = 'To install this app:\n\n';
                    
                    if (isChrome || isEdge) {
                        message += '1. Look for the install icon (⬇️) in your address bar\n2. Or click the three dots menu ⋮\n3. Select "Install ZOR" or "Add to Home screen"';
                    } else if (isSafari) {
                        message += '1. Tap the Share button (📤)\n2. Scroll down and tap "Add to Home Screen"\n3. Tap "Add" to install';
                    } else {
                        message += '1. Look for install options in your browser menu\n2. Or check the address bar for install icons\n3. Follow your browser\'s installation prompts';
                    }
                    
                    alert(message);
                }
            }
        } catch (error) {
            console.error('❌ Error during PWA installation:', error);
            
            // Show user-friendly error message
            alert('Installation temporarily unavailable. Please try refreshing the page or use your browser\'s install option from the menu.');
        } finally {
            setIsInstalling(false);
        }
    };

    const isActive = (path) => {
        if (path === '/home' && !isAdmin) {
            // For regular users, home is active for all screens except explore-courses
            return location.pathname !== '/explore-courses';
        }
        if (path === '/dashboard' && isAdmin) {
            return location.pathname === '/dashboard';
        }
        if (path === '/explore-courses') {
            return location.pathname === '/explore-courses';
        }
        return location.pathname === path;
    };


    return (
        <>
            <nav className={`navbar navbar-expand-lg custom-header ${isRTL ? 'rtl' : 'ltr'}`}>
                <div className="container">
                    {/* Brand Section */}
                    <a href="#" className="navbar-brand brand-section" onClick={(e) => {e.preventDefault(); handleLogoClick();}}>
                        <div className="logo-container">
                            <img src="/assets/logo.png" alt="Zor Logo" className="logo-img"  />
                            <span className="logo-text" style={{marginRight: '10px'}}>ZOR</span>
                        </div>
                    </a>

                    {/* Navigation Links */}
                    <ul className="navigation-links">
                        {isAdmin ? (
                            <>
                                {/* Admin has no navigation links - clean header */}
                            </>
                        ) : (
                            <>
                                <li>
                                    <a 
                                        href="#" 
                                        className={`nav-item ${isActive('/home') ? 'active-nav' : ''}`}
                                        onClick={(e) => {e.preventDefault(); handleNavigation('/home');}}
                                    >
                                        {t('home')}
                                    </a>
                                </li>
                                <li>
                                    <a 
                                        href="#" 
                                        className={`nav-item ${isActive('/explore-courses') ? 'active-nav' : ''}`}
                                        onClick={(e) => {e.preventDefault(); handleNavigation('/explore-courses');}}
                                    >
                                        {t('courses')}
                                    </a>
                                </li>
                            </>
                        )}
                    </ul>

                    {/* Right Section - Desktop Only */}
                    <div className="header-right desktop-only">
                        {/* Search - Hide for admin */}
                        {!isAdmin && (
                            <div className="search-container" style={{ position: 'relative' }}>
                                <Search className="search-icon" size={16} />
                                <input
                                    type="text"
                                    placeholder={t('search')}
                                    className="form-control search-input"
                                    value={searchQuery}
                                    onChange={handleSearchInputChange}
                                    onKeyPress={handleSearchKeyPress}
                                    onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
                                />

                                {/* Search Results Dropdown */}
                                {showSearchResults && searchResults.length > 0 && (
                                    <div className="search-results-dropdown" style={{
                                        position: 'absolute',
                                        top: '100%',
                                        left: 0,
                                        right: 0,
                                        marginTop: '8px',
                                        backgroundColor: '#fff',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                                        maxHeight: '400px',
                                        overflowY: 'auto',
                                        zIndex: 1000,
                                        border: '1px solid #e0e0e0'
                                    }}>
                                        {searchResults.slice(0, 10).map((result, index) => (
                                            <div
                                                key={`${result.type}-${result.id}-${index}`}
                                                className="search-result-item"
                                                onClick={() => handleSearchResultClick(result)}
                                                style={{
                                                    padding: '12px 16px',
                                                    cursor: 'pointer',
                                                    borderBottom: index < searchResults.length - 1 ? '1px solid #f0f0f0' : 'none',
                                                    transition: 'background-color 0.2s'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div style={{
                                                        padding: '6px',
                                                        borderRadius: '6px',
                                                        backgroundColor: result.type === 'course' ? '#e3f2fd' : '#fff3e0',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}>
                                                        {result.type === 'course' ? '📚' : '📖'}
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{
                                                            fontWeight: '500',
                                                            fontSize: '14px',
                                                            color: '#333',
                                                            marginBottom: '2px'
                                                        }}>
                                                            {result.title}
                                                        </div>
                                                        <div style={{
                                                            fontSize: '12px',
                                                            color: '#666'
                                                        }}>
                                                            {result.type === 'course' ? t('course') || 'Course' : `${result.courseName} ${result.level ? `- Level ${result.level}` : ''}`}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {searchResults.length > 10 && (
                                            <div style={{
                                                padding: '8px 16px',
                                                textAlign: 'center',
                                                fontSize: '12px',
                                                color: '#999',
                                                backgroundColor: '#fafafa'
                                            }}>
                                                {searchResults.length - 10} more results...
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Sync Button - Hide for admin */}
                        {!isAdmin && (
                            <button
                                className="sync-btn"
                                onClick={handleSync}
                                disabled={isSyncing}
                                title={t('syncContent') || 'Sync Content'}
                            >
                                <RefreshCw 
                                    size={18} 
                                    className={`sync-icon ${isSyncing ? 'spinning' : ''}`}
                                />
                            </button>
                        )}

                        {/* PWA Install Button */}
                        {isInstallable && (
                            <button
                                className="install-btn"
                                onClick={handleInstallClick}
                                disabled={isInstalling}
                                title="Install App"
                            >
                                <Download 
                                    size={18} 
                                    className={`install-icon ${isInstalling ? 'installing' : ''}`}
                                />
                                <span className="install-text">Install</span>
                            </button>
                        )}

                        {/* Language Dropdown - Available for all users */}
                        <LanguageDropdown />

                        {/* Notification Dropdown - Hide for admin */}
                        {!isAdmin && <NotificationDropdown />}

                        {/* Profile Dropdown */}
                        <div className="profile-dropdown-container position-relative">
                            <div 
                                className="profile-avatar"
                                onClick={toggleProfileDropdown}
                                style={{ cursor: 'pointer' }}
                            >
                                <Avatar
                                    name={userData?.full_name || userData?.first_name || userData?.display_name || userData?.email}
                                    profilePic={userData?.profile_pic}
                                    size={40}
                                    className="profile-avatar-img"
                                />
                            </div>

                            {/* Profile Dropdown Menu */}
                            {isProfileDropdownOpen && (
                                <div className="profile-dropdown-menu">
                                    <div className="profile-dropdown-header">
                                        <div className="profile-dropdown-avatar">
                                            <Avatar
                                                name={userData?.full_name || userData?.first_name || userData?.display_name || userData?.email}
                                                profilePic={userData?.profile_pic}
                                                size={48}
                                                className="profile-dropdown-avatar-img"
                                            />
                                        </div>
                                        <div className="profile-dropdown-info">
                                            <div className="profile-dropdown-name">
                                                {userData?.full_name || userData?.first_name || t('profileName')}
                                            </div>
                                            <div className="profile-dropdown-email">
                                                {userData?.email || t('profileEmail')}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="profile-dropdown-divider"></div>
                                    
                                    <button 
                                        className="profile-dropdown-item"
                                        onClick={handleProfile}
                                    >
                                        <User size={16} />
                                        {t('profile') || 'Profile'}
                                    </button>
                                    
                                    <button 
                                        className="profile-dropdown-item logout-item"
                                        onClick={handleLogout}
                                    >
                                        <LogOut size={16} />
                                        {t('signOut') || 'Sign Out'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile Right Section - Sync, Notification and Menu Button */}
                    <div className="header-right mobile-only">
                        {/* Sync Button - Hide for admin */}
                        {!isAdmin && (
                            <button
                                className="sync-btn"
                                onClick={handleSync}
                                disabled={isSyncing}
                                title={t('syncContent') || 'Sync Content'}
                            >
                                <RefreshCw 
                                    size={18} 
                                    className={`sync-icon ${isSyncing ? 'spinning' : ''}`}
                                />
                            </button>
                        )}

                        {/* Notification Dropdown - Hide for admin */}
                        {!isAdmin && <NotificationDropdown />}

                        {/* Mobile Menu Button */}
                        <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
                            {isMobileMenuOpen ? (
                                <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                <div className={`mobile-menu ${isMobileMenuOpen ? 'show' : ''}`}>
                    <div className="mobile-menu-content">
                        {/* Mobile Navigation Links */}
                        <ul className="mobile-nav-links">
                            {isAdmin ? (
                                <>
                                    {/* Admin has no mobile navigation links - clean mobile menu */}
                                </>
                            ) : (
                                <>
                                    <li>
                                        <a 
                                            href="#" 
                                            className={`mobile-nav-item ${isActive('/home') ? 'active' : ''}`}
                                            onClick={(e) => {e.preventDefault(); handleNavigation('/home');}}
                                        >
                                            {t('home')}
                                        </a>
                                    </li>
                                    <li>
                                        <a 
                                            href="#" 
                                            className={`mobile-nav-item ${isActive('/explore-courses') ? 'active' : ''}`}
                                            onClick={(e) => {e.preventDefault(); handleNavigation('/explore-courses');}}
                                        >
                                            {t('courses')}
                                        </a>
                                    </li>
                                </>
                            )}
                        </ul>

                        {/* Mobile Actions - Install, Language and Profile inside toggle menu */}
                        <div className="mobile-actions">
                            {/* PWA Install Button for Mobile */}
                            {isInstallable && (
                                <button
                                    className="mobile-install-btn"
                                    onClick={handleInstallClick}
                                    disabled={isInstalling}
                                    title="Install App"
                                >
                                    <Download size={16} />
                                    <span>Install App</span>
                                </button>
                            )}

                            {/* Language Dropdown for Mobile - Available for all users */}
                            <MobileLanguageDropdown />

                            {/* Profile Section for Mobile */}
                            <div className="mobile-profile-section">
                                <div 
                                    className="profile-avatar"
                                    onClick={handleProfile}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <Avatar
                                        name={userData?.full_name || userData?.first_name || userData?.display_name || userData?.email}
                                        profilePic={userData?.profile_pic}
                                        size={32}
                                        className="profile-avatar-img"
                                    />
                                </div>
                                <div className="mobile-profile-info">
                                    <div className="mobile-profile-name">
                                        {userData?.full_name || userData?.first_name || t('profileName')}
                                    </div>
                                    <div className="mobile-profile-email">
                                        {userData?.email || t('profileEmail')}
                                    </div>
                                </div>
                                <button 
                                    className="mobile-logout-btn"
                                    onClick={handleLogout}
                                    title="Sign Out"
                                >
                                    <LogOut size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Backdrop for closing dropdowns */}
            {(isProfileDropdownOpen || showSearchResults) && (
                <div
                    className="dropdown-backdrop"
                    onClick={() => {
                        setIsProfileDropdownOpen(false);
                        setShowSearchResults(false);
                    }}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 998
                    }}
                />
            )}
        </>
    );
};

// Desktop Language Dropdown Component
const LanguageDropdown = () => {
    const [isOpen, setIsOpen] = React.useState(false);
    const { changeLanguage, currentLanguage, languages } = useLanguage();

    const handleLanguageSelect = (language) => {
        changeLanguage(language);
        setIsOpen(false);
        console.log('Language changed to:', language);
    };

    return (
        <div className="position-relative">
            <button
                className="language-btn"
                onClick={() => setIsOpen(!isOpen)}
                onBlur={() => setTimeout(() => setIsOpen(false), 200)}
            >
                <Globe size={16} className="globe-icon" />
                <span className="language-text">{languages[currentLanguage]}</span>
            </button>

            <div className={`dropdown-menu ${isOpen ? 'show' : ''}`}>
                <button 
                    className={`dropdown-item ${currentLanguage === 'en' ? 'active' : ''}`}
                    onClick={() => handleLanguageSelect('en')}
                >
                    English
                </button>
                <button 
                    className={`dropdown-item ${currentLanguage === 'ur' ? 'active' : ''}`}
                    onClick={() => handleLanguageSelect('ur')}
                >
                    اردو
                </button>
            </div>
        </div>
    );
};

// Mobile Language Dropdown Component
const MobileLanguageDropdown = () => {
    const [isOpen, setIsOpen] = React.useState(false);
    const { changeLanguage, currentLanguage, languages } = useLanguage();

    const handleLanguageSelect = (language) => {
        changeLanguage(language);
        setIsOpen(false);
        console.log('Mobile language changed to:', language);
    };

    return (
        <div className="position-relative mobile-language-dropdown">
            <button
                className="language-btn"
                onClick={() => setIsOpen(!isOpen)}
                onBlur={() => setTimeout(() => setIsOpen(false), 200)}
            >
                <Globe size={16} />
                <span className="language-text">{languages[currentLanguage]}</span>
            </button>

            <div className={`dropdown-menu ${isOpen ? 'show' : ''}`}>
                <button 
                    className={`dropdown-item ${currentLanguage === 'en' ? 'active' : ''}`}
                    onClick={() => handleLanguageSelect('en')}
                >
                    English
                </button>
                <button 
                    className={`dropdown-item ${currentLanguage === 'ur' ? 'active' : ''}`}
                    onClick={() => handleLanguageSelect('ur')}
                >
                    اردو
                </button>
            </div>
        </div>
    );
};

export default Header;