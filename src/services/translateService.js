// Google Translate Service for Notifications
class TranslateService {
  constructor() {
    // Use Google Translate API (requires API key setup)
    // For production, you should store the API key securely
    this.apiKey = process.env.REACT_APP_GOOGLE_TRANSLATE_API_KEY || 'YOUR_API_KEY_HERE';
    this.baseUrl = 'https://translation.googleapis.com/language/translate/v2';

    // Cache translations to avoid repeated API calls
    this.translationCache = new Map();
  }

  // Generate cache key for storing translations
  getCacheKey(text, targetLang, sourceLang = 'auto') {
    return `${sourceLang}_${targetLang}_${text}`;
  }

  // Translate text using Google Translate API
  async translateText(text, targetLanguage, sourceLanguage = 'auto') {
    try {
      console.log('🔍 translateText called with:', {
        text: text.substring(0, 100) + '...',
        targetLanguage,
        sourceLanguage
      });

      // Check cache first
      const cacheKey = this.getCacheKey(text, targetLanguage, sourceLanguage);
      if (this.translationCache.has(cacheKey)) {
        console.log('📋 Using cached translation for:', text.substring(0, 50) + '...');
        return this.translationCache.get(cacheKey);
      }

      // Skip translation if target language matches detected/assumed source
      if (this.isLikelySameLanguage(text, targetLanguage)) {
        console.log('⏭️ Skipping translation - same language detected');
        this.translationCache.set(cacheKey, text);
        return text;
      }

      // Make API request
      console.log('🌍 Translating to', targetLanguage, ':', text.substring(0, 50) + '...');

      // Check if API key is available
      if (!this.apiKey || this.apiKey === 'YOUR_API_KEY_HERE') {
        console.warn('⚠️ Google Translate API key not configured, using fallback translations');
        return this.getFallbackTranslation(text, targetLanguage);
      }

      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          target: targetLanguage,
          source: sourceLanguage !== 'auto' ? sourceLanguage : undefined,
        }),
      });

      if (!response.ok) {
        console.error(`❌ Translation API error: ${response.status} ${response.statusText}`);
        throw new Error(`Translation API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data.error) {
        console.error('❌ Translation API returned error:', data.error);
        throw new Error(data.error.message);
      }

      const translatedText = data.data.translations[0].translatedText;

      // Cache the translation
      this.translationCache.set(cacheKey, translatedText);

      console.log('✅ Translation completed:', translatedText.substring(0, 50) + '...');
      return translatedText;

    } catch (error) {
      console.error('❌ Translation error:', error);

      // Try fallback translation first
      try {
        console.log('🔄 Trying fallback translation...');
        const fallbackTranslation = this.getFallbackTranslation(text, targetLanguage);
        const cacheKey = this.getCacheKey(text, targetLanguage, sourceLanguage);
        this.translationCache.set(cacheKey, fallbackTranslation);
        return fallbackTranslation;
      } catch (fallbackError) {
        console.error('❌ Fallback translation also failed:', fallbackError);
        // Final fallback: return original text if all translation fails
        const cacheKey = this.getCacheKey(text, targetLanguage, sourceLanguage);
        this.translationCache.set(cacheKey, text);
        return text;
      }
    }
  }

  // Fallback translation for common notification texts
  getFallbackTranslation(text, targetLanguage) {
    console.log('🔄 Using fallback translation for:', text, 'to', targetLanguage);

    if (targetLanguage !== 'ur') {
      return text; // Only provide Urdu fallbacks
    }

    // Common notification translations to Urdu
    const fallbackTranslations = {
      // Title translations
      'New Course Available! 📚': 'نیا کورس دستیاب ہے! 📚',
      'New Level Added! 📊': 'نیا لیول شامل کیا گیا! 📊',
      'New Lesson Added! 📖': 'نیا سبق شامل کیا گیا! 📖',
      'New Quiz Added! ❓': 'نیا کوئز شامل کیا گیا! ❓',
      'New Quiz Added!': 'نیا کوئز شامل کیا گیا!',
      'New Lessons Added! 📖': 'نئے اسباق شامل کیے گئے! 📖',
      'New Quizzes Added! ❓': 'نئے کوئز شامل کیے گئے! ❓',

      // Message content translations
      'Check out the new course:': 'نئے کورس کو چیک کریں:',
      'added to': 'میں شامل کیا گیا',
      'new lesson': 'نیا سبق',
      'new lessons': 'نئے اسباق',
      'new quiz': 'نیا کوئز',
      'new quizzes': 'نئے کوئز',
      'New level': 'نیا لیول',
      'New Level': 'نیا لیول',

      // Technical terms and common words
      'Level': 'لیول',
      'level': 'لیول',
      'Course': 'کورس',
      'course': 'کورس',
      'Lesson': 'سبق',
      'lesson': 'سبق',
      'Quiz': 'کوئز',
      'quiz': 'کوئز',
      'quizzes': 'کوئز',
      'basic electronics': 'بنیادی الیکٹرانکس',
      'basic': 'بنیادی',
      'electronics': 'الیکٹرانکس',
      'what is': 'کیا ہے',
      'computer science': 'کمپیوٹر سائنس',
      'programming': 'پروگرامنگ'
    };

    // Try exact match first
    if (fallbackTranslations[text]) {
      console.log('✅ Found exact fallback translation:', fallbackTranslations[text]);
      return fallbackTranslations[text];
    }

    // Try partial matches for dynamic content
    for (const [english, urdu] of Object.entries(fallbackTranslations)) {
      if (text.includes(english)) {
        const translated = text.replace(english, urdu);
        console.log('✅ Found partial fallback translation:', translated);
        return translated;
      }
    }

    // Advanced pattern-based translation for complex notification messages
    let translatedText = text;

    // Handle specific patterns from the screenshot
    const advancedPatterns = [
      // Pattern: "Quiz" added to [course name] - "نیا کوئز"
      {
        pattern: /^"?([^"]*)"?\s+added to\s+(.+?)(?:\s*-\s*"([^"]*)")?$/i,
        replacement: (_, item, courseName) => {
          const translatedItem = fallbackTranslations[item.toLowerCase()] || item;
          const translatedCourseName = fallbackTranslations[courseName.toLowerCase()] || courseName;
          return `"${translatedItem}" ${translatedCourseName} میں شامل کیا گیا`;
        }
      },

      // Pattern: new lessons X میں شامل کیا گیا [course name]
      {
        pattern: /^(new lessons?\s*\d*)\s+(.+?)\s+(.+?)(?:\s*-\s*(.+))?$/i,
        replacement: (_, lessonPart, __, courseName) => {
          const translatedLessonPart = lessonPart.replace(/new lessons?/gi, 'نئے اسباق').replace(/new lesson/gi, 'نیا سبق');
          const translatedCourseName = fallbackTranslations[courseName.toLowerCase()] || courseName;
          return `${translatedLessonPart} ${translatedCourseName} میں شامل کیے گئے`;
        }
      },

      // Pattern: new quizzes X میں شامل کیا گیا [course name]
      {
        pattern: /^(new quizzes?\s*\d*)\s+(.+?)\s+(.+?)(?:\s*-\s*(.+))?$/i,
        replacement: (_, quizPart, __, courseName) => {
          const translatedQuizPart = quizPart.replace(/new quizzes/gi, 'نئے کوئز').replace(/new quiz/gi, 'نیا کوئز');
          const translatedCourseName = fallbackTranslations[courseName.toLowerCase()] || courseName;
          return `${translatedQuizPart} ${translatedCourseName} میں شامل کیے گئے`;
        }
      },

      // Pattern: "New level" [level name] میں شامل
      {
        pattern: /^"?New level"?\s+"?([^"]+)"?\s+(.+?)$/i,
        replacement: (_, levelName, rest) => {
          const translatedLevelName = fallbackTranslations[levelName.toLowerCase()] || levelName;
          return `نیا لیول "${translatedLevelName}" ${rest.replace('میں شامل', 'میں شامل کیا گیا')}`;
        }
      }
    ];

    // Try advanced pattern matching
    for (const patternObj of advancedPatterns) {
      const match = text.match(patternObj.pattern);
      if (match) {
        const result = patternObj.replacement(...match);
        console.log('✅ Applied advanced pattern translation:', result);
        translatedText = result;
        break;
      }
    }

    // If no advanced pattern matched, try comprehensive word replacement
    if (translatedText === text) {
      // Sort by length (longest first) to avoid partial replacements
      const sortedTranslations = Object.entries(fallbackTranslations)
        .sort(([a], [b]) => b.length - a.length);

      for (const [english, urdu] of sortedTranslations) {
        // Use word boundaries for better matching
        const regex = new RegExp(`\\b${english.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        translatedText = translatedText.replace(regex, urdu);
      }

      // Additional cleanup and specific replacements
      translatedText = translatedText
        .replace(/(\d+)\s*new\s*(lessons?|quizzes?)/gi, (match, num, type) => {
          if (type.toLowerCase().startsWith('lesson')) {
            return `${num} نئے اسباق`;
          } else if (type.toLowerCase().startsWith('quiz')) {
            return `${num} نئے کوئز`;
          }
          return match;
        })
        .replace(/\bwhat is\b/gi, 'کیا ہے')
        .replace(/\b(\w+)\s+level\s+(\d+)\b/gi, '$1 لیول $2');
    }

    if (translatedText !== text) {
      console.log('✅ Generated enhanced fallback translation:', translatedText);
      return translatedText;
    }

    console.log('⚠️ No fallback translation available, returning original text');
    return text;
  }

  // Simple heuristic to detect if text might already be in target language
  isLikelySameLanguage(text, targetLanguage) {
    // Simple checks for common cases
    const englishPattern = /^[a-zA-Z\s\d\.,!?;:'"()[\]{}\-_@#$%^&*+=<>\/\\~`|📚📊📖❓]*$/;
    const urduPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

    // For English target: only skip if text is English and has no Urdu
    if (targetLanguage === 'en' && englishPattern.test(text) && !urduPattern.test(text)) {
      console.log('🔄 Skipping translation to English - already English:', text.substring(0, 50));
      return true;
    }

    // For Urdu target: only skip if text contains Urdu characters
    if (targetLanguage === 'ur' && urduPattern.test(text)) {
      console.log('🔄 Skipping translation to Urdu - already Urdu:', text.substring(0, 50));
      return true;
    }

    // IMPORTANT: Always translate English notification text to Urdu
    if (targetLanguage === 'ur' && englishPattern.test(text) && !urduPattern.test(text)) {
      console.log('🌍 English notification detected, will translate to Urdu:', text.substring(0, 50));
      return false; // Force translation
    }

    return false;
  }

  // Translate notification object
  async translateNotification(notification, targetLanguage) {
    try {
      const translatedNotification = { ...notification };

      // Determine source language based on content
      const sourceLanguage = this.detectSourceLanguage(notification);

      // Translate title and message
      const [translatedTitle, translatedMessage] = await Promise.all([
        this.translateText(notification.title, targetLanguage, sourceLanguage),
        this.translateText(notification.message, targetLanguage, sourceLanguage)
      ]);

      translatedNotification.title = translatedTitle;
      translatedNotification.message = translatedMessage;

      // Add translation metadata
      translatedNotification._translated = {
        targetLanguage,
        sourceLanguage,
        translatedAt: new Date().toISOString()
      };

      return translatedNotification;
    } catch (error) {
      console.error('❌ Error translating notification:', error);
      // Return original notification if translation fails
      return notification;
    }
  }

  // Detect source language of notification content
  detectSourceLanguage(notification) {
    const text = `${notification.title} ${notification.message}`;
    const englishPattern = /^[a-zA-Z\s\d\.,!?;:'"()[\]{}\-_@#$%^&*+=<>\/\\~`|]*$/;
    const urduPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

    // Check for Urdu characters
    if (urduPattern.test(text)) {
      return 'ur';
    }

    // Check if primarily English
    if (englishPattern.test(text.replace(/[^\w\s]/g, ''))) {
      return 'en';
    }

    // Default to auto-detect
    return 'auto';
  }

  // Batch translate multiple notifications
  async translateNotifications(notifications, targetLanguage) {
    console.log('🚀 Starting batch translation:', {
      count: notifications.length,
      targetLanguage,
      notifications: notifications.map(n => ({ id: n.id, title: n.title?.substring(0, 50) }))
    });

    const translationPromises = notifications.map((notification, index) => {
      console.log(`🔄 Translating notification ${index + 1}/${notifications.length}:`, {
        id: notification.id,
        title: notification.title,
        message: notification.message?.substring(0, 100)
      });
      return this.translateNotification(notification, targetLanguage);
    });

    try {
      const translatedNotifications = await Promise.all(translationPromises);
      console.log(`✅ Batch translation completed: ${translatedNotifications.length} notifications to ${targetLanguage}`);
      console.log('📊 Translation results sample:', {
        before: notifications.slice(0, 2).map(n => ({ title: n.title, message: n.message })),
        after: translatedNotifications.slice(0, 2).map(n => ({ title: n.title, message: n.message }))
      });
      return translatedNotifications;
    } catch (error) {
      console.error('❌ Error batch translating notifications:', error);
      console.log('🔄 Returning original notifications due to batch error');
      return notifications; // Return original if batch translation fails
    }
  }

  // Clear translation cache (useful for memory management)
  clearCache() {
    this.translationCache.clear();
    console.log('🗑️ Translation cache cleared');
  }

  // Get cache statistics
  getCacheStats() {
    return {
      size: this.translationCache.size,
      entries: Array.from(this.translationCache.keys()).slice(0, 5) // First 5 keys for debugging
    };
  }

  // Test function to verify translations work correctly
  async testNotificationTranslations() {
    console.log('🧪 Testing notification translations...');

    const testNotifications = [
      {
        id: '1',
        title: 'New Quiz Added! ❓',
        message: '"Quiz" added to basic electronics - "نیا کوئز"'
      },
      {
        id: '2',
        title: '2 New Lessons Added! 📖',
        message: 'new lessons 2 میں شامل کیا گیا basic electronics - basic electronics level 2'
      },
      {
        id: '3',
        title: 'New Level Added! 📊',
        message: '"New level "basic electronics level 2" میں شامل basic electronics کیا گیا'
      },
      {
        id: '4',
        title: '5 New Quizzes Added! ❓',
        message: 'new quizzes 5 میں شامل کیا گیا basic electronics - what is basic electronics'
      }
    ];

    const results = await this.translateNotifications(testNotifications, 'ur');

    console.log('🔍 Test Results:');
    results.forEach((result, index) => {
      console.log(`\n📝 Notification ${index + 1}:`);
      console.log(`Original Title: ${testNotifications[index].title}`);
      console.log(`Translated Title: ${result.title}`);
      console.log(`Original Message: ${testNotifications[index].message}`);
      console.log(`Translated Message: ${result.message}`);
    });

    return results;
  }
}

// Create singleton instance
const translateService = new TranslateService();

// Expose test function globally for debugging
if (typeof window !== 'undefined') {
  window.testNotificationTranslation = () => translateService.testNotificationTranslations();
  window.translateService = translateService;
}

export default translateService;