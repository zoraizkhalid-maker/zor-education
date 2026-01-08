import React, { useState } from 'react';

const Avatar = ({ 
  name = '', 
  profilePic = null, 
  size = 80, 
  className = '' 
}) => {
  const [imageError, setImageError] = useState(false);
  
  // Generate a consistent color based on the name
  const generateColor = (str) => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
      '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#F4D03F',
      '#AED6F1', '#A9DFBF', '#F9E79F', '#D2B4DE', '#AED6F1'
    ];
    
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  // Get first letter of the name
  const getInitial = (name) => {
    if (!name || name.trim() === '') return '?';
    
    // Handle full name (take first letter of first name)
    const firstName = name.trim().split(' ')[0];
    return firstName.charAt(0).toUpperCase();
  };

  // Check if we should show profile picture
  const shouldShowImage = profilePic && 
                          profilePic !== '/assets/avatar1.png' && 
                          profilePic !== './assets/avatar1.png' &&
                          profilePic !== 'avatar1.png' &&
                          profilePic.trim() !== '' &&
                          !imageError;

  // Common styles for both image and letter avatar
  const baseStyle = {
    width: size,
    height: size,
    minWidth: size,
    minHeight: size,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    cursor: 'default',
    overflow: 'hidden'
  };

  const handleImageError = () => {
    setImageError(true);
  };

  if (shouldShowImage) {
    return (
      <div 
        className={className ? className : 'profile-image-home'}
        style={baseStyle}
      >
        <img
          src={profilePic}
          alt={name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: '50%'
          }}
          onError={handleImageError}
        />
      </div>
    );
  }

  // Show letter avatar
  const backgroundColor = generateColor(name || 'User');
  const initial = getInitial(name);

  return (
    <div
      className={className ? className : 'profile-image-home'}
      style={{
        ...baseStyle,
        backgroundColor: backgroundColor,
        color: '#FFFFFF',
        fontSize: size * 0.4,
        fontWeight: '600',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        textShadow: '0 1px 2px rgba(0,0,0,0.1)',
        border: '2px solid rgba(255,255,255,0.2)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        textAlign: 'center',
        lineHeight: '1',
        position: 'relative'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
      }}
    >
      <span style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        lineHeight: '1',
        textAlign: 'center'
      }}>
        {initial}
      </span>
    </div>
  );
};

export default Avatar;