import React, { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, Clock, BookOpen, FileText, HelpCircle, BarChart2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../LanguageContext';
import translateService from '../services/translateService';
import './NotificationDropdown.css';

const NotificationDropdown = () => {
    const { 
        notifications, 
        unreadNotificationCount, 
        markNotificationAsRead, 
        markAllNotificationsAsRead,
        fetchNotifications,
        user 
    } = useAuth();
    const { t, isRTL, currentLanguage } = useLanguage();

    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [translatedNotifications, setTranslatedNotifications] = useState([]);
    const [isTranslating, setIsTranslating] = useState(false);

    // Refresh notifications periodically (less frequently)
    useEffect(() => {
        if (user) {
            const interval = setInterval(() => {
                fetchNotifications();
            }, 60000); // Refresh every 60 seconds instead of 30

            return () => clearInterval(interval);
        }
    }, [user]);

    // Translate notifications when language changes or notifications update
    useEffect(() => {
        const translateNotifications = async () => {
            console.log('🔄 Translation effect triggered:', {
                notificationsCount: notifications.length,
                currentLanguage,
                notifications: notifications.map(n => ({ id: n.id, title: n.title, message: n.message }))
            });

            if (!notifications.length) {
                console.log('⏭️ No notifications to translate');
                setTranslatedNotifications([]);
                return;
            }

            setIsTranslating(true);

            try {
                console.log('🌍 Starting translation process to:', currentLanguage);
                const targetLang = currentLanguage === 'ur' ? 'ur' : 'en';
                console.log('📝 Target language set to:', targetLang);

                const translated = await translateService.translateNotifications(notifications, targetLang);

                console.log('📋 Translation results:', {
                    original: notifications.map(n => n.title),
                    translated: translated.map(n => n.title)
                });

                setTranslatedNotifications(translated);
                console.log('✅ Notifications translated and state updated');
            } catch (error) {
                console.error('❌ Error translating notifications:', error);
                console.error('🔄 Falling back to original notifications');
                // Fallback to original notifications if translation fails
                setTranslatedNotifications(notifications);
            } finally {
                setIsTranslating(false);
                console.log('🏁 Translation process completed');
            }
        };

        translateNotifications();
    }, [notifications, currentLanguage]);

    const toggleDropdown = async () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            // Refresh notifications when opening
            await fetchNotifications();
        }
    };

    const handleNotificationClick = async (notificationId) => {
        if (!notifications.find(n => n.id === notificationId)?.readBy?.includes(user.uid)) {
            await markNotificationAsRead(notificationId);
        }
    };

    const handleMarkAllAsRead = async () => {
        setIsLoading(true);
        await markAllNotificationsAsRead();
        setIsLoading(false);
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'course_added':
                return <BookOpen size={16} className="notification-type-icon course-icon" />;
            case 'level_added':
                return <BarChart2 size={16} className="notification-type-icon level-icon" />;
            case 'lesson_added':
                return <FileText size={16} className="notification-type-icon lesson-icon" />;
            case 'quiz_added':
                return <HelpCircle size={16} className="notification-type-icon quiz-icon" />;
            default:
                return <Bell size={16} className="notification-type-icon default-icon" />;
        }
    };

    const formatNotificationTime = (timestamp) => {
        if (!timestamp) return '';
        
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));
        
        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
        if (diffInMinutes < 43200) return `${Math.floor(diffInMinutes / 1440)}d ago`;
        
        return date.toLocaleDateString();
    };

    const isNotificationRead = (notification) => {
        return notification.readBy?.includes(user.uid) || false;
    };

    return (
        <>
            <div className="notification-dropdown-container">
                <button 
                    className="notification-btn"
                    onClick={toggleDropdown}
                    aria-label="Notifications"
                >
                    <Bell size={20} />
                    {unreadNotificationCount > 0 && (
                        <span className="notification-badge">
                            {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                        </span>
                    )}
                </button>

                {isOpen && (
                    <div className={`notification-dropdown ${isRTL ? 'rtl' : 'ltr'}`}>
                        <div className="notification-header">
                            <div className="notification-title">
                                <Bell size={16} />
                                <span>{t('notifications') || 'Notifications'}</span>
                                {unreadNotificationCount > 0 && (
                                    <span className="unread-count">({unreadNotificationCount})</span>
                                )}
                            </div>
                            
                            {unreadNotificationCount > 0 && (
                                <button
                                    className="mark-all-read-btn"
                                    onClick={handleMarkAllAsRead}
                                    disabled={isLoading}
                                    title={t('markAllAsRead') || 'Mark all as read'}
                                >
                                    {isLoading ? (
                                        <div className="loading-spinner-small" />
                                    ) : (
                                        <CheckCheck size={14} />
                                    )}
                                </button>
                            )}
                        </div>

                        <div className="notification-list">
                            {isTranslating && (
                                <div className="notification-translating">
                                    <div className="loading-spinner-small" />
                                    <span>{t('translatingNotifications') || 'Translating notifications...'}</span>
                                </div>
                            )}
                            {(translatedNotifications.length === 0 && notifications.length === 0) ? (
                                <div className="no-notifications">
                                    <Bell size={32} className="no-notifications-icon" />
                                    <p>{t('noNotifications') || 'No notifications yet'}</p>
                                    <small>{t('newNotificationsWillAppearHere') || 'New notifications will appear here'}</small>
                                </div>
                            ) : (
                                (translatedNotifications.length > 0 ? translatedNotifications : notifications).slice(0, 10).map((notification) => {
                                    const isRead = isNotificationRead(notification);
                                    
                                    return (
                                        <div
                                            key={notification.id}
                                            className={`notification-item ${isRead ? 'read' : 'unread'}`}
                                            onClick={() => handleNotificationClick(notification.id)}
                                        >
                                            <div className="notification-icon">
                                                {getNotificationIcon(notification.type)}
                                            </div>
                                            
                                            <div className="notification-content">
                                                <div className="notification-text">
                                                    <h4 className="notification-item-title">
                                                        {notification.title}
                                                    </h4>
                                                    <p className="notification-message">
                                                        {notification.message}
                                                    </p>
                                                </div>
                                                
                                                <div className="notification-meta">
                                                    <span className="notification-time">
                                                        <Clock size={12} />
                                                        {formatNotificationTime(notification.createdAt)}
                                                    </span>
                                                    
                                                    {!isRead && (
                                                        <span className="unread-indicator" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {(translatedNotifications.length > 0 ? translatedNotifications : notifications).length > 10 && (
                            <div className="notification-footer">
                                <button className="view-all-btn">
                                    {t('viewAllNotifications') || 'View all notifications'}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Backdrop */}
            {isOpen && (
                <div 
                    className="notification-backdrop"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
};

export default NotificationDropdown;