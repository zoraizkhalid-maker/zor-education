import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import '../styles/languageSelector.css';

const LanguageSelector = ({ className = '', style = {} }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const { changeLanguage, currentLanguage, languages } = useLanguage();

    const handleLanguageSelect = (language) => {
        changeLanguage(language);
        setIsOpen(false);
    };

    return (
        <div className={`language-selector-container ${className}`} style={style}>
            <button
                className="language-selector-btn"
                onClick={() => setIsOpen(!isOpen)}
                onBlur={() => setTimeout(() => setIsOpen(false), 200)}
            >
                <Globe size={16} className="language-selector-icon" />
                <span className="language-selector-text">{languages[currentLanguage]}</span>
            </button>

            <div className={`language-selector-dropdown ${isOpen ? 'show' : ''}`}>
                <button 
                    className={`language-selector-item ${currentLanguage === 'en' ? 'active' : ''}`}
                    onClick={() => handleLanguageSelect('en')}
                >
                    English
                </button>
                <button 
                    className={`language-selector-item ${currentLanguage === 'ur' ? 'active' : ''}`}
                    onClick={() => handleLanguageSelect('ur')}
                >
                    اردو
                </button>
            </div>
        </div>
    );
};

export default LanguageSelector;