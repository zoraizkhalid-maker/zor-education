// LanguageContext.js - Updated with Dashboard Translations
import React, { createContext, useContext, useState, useEffect } from 'react';

// Translation data
const translations = {
  en: {
    // Header translations
    home: "Home",
    courses: "Courses",
    search: "Search",
    viewProfile: "View Profile",

    // Navigation
    back: "Back",

    // Course page specific translations
    structureForCSCoding: "Structure for Computer Science & Coding",
    estimatedDuration: "Estimated Duration",
    hoursRange: "1.5 - 2 hours",
    level: "Level",
    completed: "Completed",
    inProgress: "In progress",
    locked: "Locked",
    view: "View",

    addlevel: "Add Level",

    // Dashboard specific translations
    adminDashboard: "Admin Dashboard",
    coursesManagement: "Courses Management",
    lessonsManagement: "Lessons Management",
    addCourse: "Add Course",
    addLessonsQuizzes: "Add Lessons & Quizzes",
    addContent: "Add Content",
    items: "Items",
    questions: "Questions",
    totalQuestions: "Total Questions",
    selectCourse: "Select Course",
    chooseCourse: "Choose a course...",
    lessons: "Lessons",
    quizzes: "Quizzes",
    addLesson: "Add Lesson",
    addQuiz: "Add Quiz",
    addQuestion: "Add Question",
    addPoint: "Add Point",
    titleKey: "Title Key",
    descriptionKey: "Description Key",
    pointKeys: "Point Keys",
    quizTitleKey: "Quiz Title Key",
    questionKey: "Question Key",
    options: "Options",
    optionKey: "Option Key",
    explanationKey: "Explanation Key",
    correctAnswer: "Correct answer",
    fixedOptions: "4 Fixed",
    subtitleKey: "Subtitle Key",
    status: "Status",
    duration: "Duration",
    actions: "Actions",
    id: "ID",
    title: "Title",
    type: "Type",
    order: "Order",
    course: "Course",
    unknown: "Unknown",
    viewDetails: "View Details",
    editCourse: "Edit Course",
    saveAll: "Save All",
    cancel: "Cancel",
    save: "Save",
    delete: "Delete",
    duplicate: "Duplicate",
    remove: "Remove",
    confirmDelete: "Are you sure you want to delete this item?",
    pleaseSelectCourse: "Please select a course",
    lesson: "Lesson",
    quiz: "Quiz",
    mcq: "MCQ",
    question: "Question",
    point: "Point",

    // Form placeholders and labels
    enterTitleKey: "e.g., microLesson11",
    enterDescriptionKey: "e.g., computerDefinition",
    enterPointKey: "Point key",
    enterQuizTitleKey: "e.g., quiz1",
    enterQuestionKey: "e.g., quiz1Question1",
    enterOptionKey: "Option key",
    enterExplanationKey: "e.g., quiz1Explanation1",
    entercourseLevelTitle: "e.g., courseLevelTitle1",
    entercourseLevelSubtitle: "e.g., courseLevelSubtitle1",
    enterDuration: "e.g., 1.5 - 2 hours",

    // Course titles (expanded)
    courseLevelTitle1: "What is a Computer?",
    courseLevelTitle2: "Computer Hardware",
    courseLevelTitle3: "Software Fundamentals",
    courseLevelTitle4: "Programming Basics",
    courseLevelTitle5: "Data and Information",
    courseLevelTitle6: "Networks and Internet",
    courseLevelTitle7: "Cybersecurity Basics",
    courseLevelTitle8: "Database Fundamentals",
    courseLevelTitle9: "Web Development Basics",
    courseLevelTitle10: "Mobile App Development",
    courseLevelTitle11: "Artificial Intelligence Intro",

    // Course subtitles (expanded)
    courseLevelSubtitle1: "Basics of Computer Science",
    courseLevelSubtitle2: "Understanding Hardware Components",
    courseLevelSubtitle3: "Software and Operating Systems",
    courseLevelSubtitle4: "Introduction to Programming",
    courseLevelSubtitle5: "Data Processing and Storage",
    courseLevelSubtitle6: "Connecting Computers Worldwide",
    courseLevelSubtitle7: "Protecting Digital Information",
    courseLevelSubtitle8: "Managing and Organizing Data",
    courseLevelSubtitle9: "Creating Web Applications",
    courseLevelSubtitle10: "Building Mobile Applications",
    courseLevelSubtitle11: "Introduction to AI and Machine Learning",

    // Course duration variations
    duration1: "30 - 45 minutes",
    duration2: "1 - 1.5 hours", 
    duration3: "1.5 - 2 hours",
    duration4: "2 - 2.5 hours",
    duration5: "2.5 - 3 hours",
    duration6: "3 - 4 hours",
    duration7: "4 - 5 hours",
    duration8: "5+ hours",

    // Home page specific translations
    profileName: "Mian Hamad Khalil",
    profileEmail: "example@gmail.com",
    courseCompleted: "Course Completed",
    courseCompletedCount: "2",
    viewProfileBtn: "View Profile",

    // Course Progress Section
    yourCourseProgress: "Your Course Progress",
    trackProgressSubtitle: "Track how far you've come in your learning journey.",
    computerScienceCoding: "Computer Science & Coding",
    levelsCompleted: "Levels Completed",
    currentLevelTitle: "Level 8 — Applications & Software",
    nextMilestone: "Next milestone",
    encouragementText: "You're making steady progress, keep it up!",
    continueCourse: "Continue Course",
    viewAllLevels: "View All Levels",
    courseCompletedPercent: "45%",
    courseCompletedLabel: "Course Completed",

    // Explore Courses Section
    exploreCourses: "Explore Courses",
    viewAll: "View All",
    structureForCS: "Structure for Computer Science",
    courseNumber: "Course Number",
    previous: "Previous",
    next: "Next",
    EnrollNow: "Enroll Now",
    courseEnrollment: "Course Enrollment",

    // Explore Courses Page - Course Titles
    explorecourseLevelTitle1: "Structure for Computer Science",
    explorecourseLevelTitle2: "Data Structures and Algorithms",
    explorecourseLevelTitle3: "Web Development Fundamentals",
    explorecourseLevelTitle4: "Machine Learning Basics",
    explorecourseLevelTitle5: "Database Management Systems",
    explorecourseLevelTitle6: "Mobile App Development",
    explorecourseLevelTitle7: "Cybersecurity Fundamentals",
    explorecourseLevelTitle8: "Cloud Computing Essentials",
    explorecourseLevelTitle9: "Software Engineering Principles",
    explorecourseLevelTitle10: "Artificial Intelligence Overview",
    explorecourseLevelTitle11: "Network Programming",
    explorecourseLevelTitle12: "Game Development Basics",

    // Home1 specific translations
    noCourseEnrolled: "No Course Enrolled Yet",
    nocourseLevelSubtitle: "Start your learning journey and select your first course.",
    browseCourses: "Browse Courses",

    // Login page
    welcomeToZor: "Welcome to ZOR",
    welcomeSubtitle: "An easy, interactive way to explore computer science.",
    email: "Email",
    password: "Password",
    enterEmail: "Enter your email",
    rememberMe: "Remember me",
    forgotPassword: "Forgot password?",
    signIn: "Sign in",
    signingIn: "Signing in...",
    signInWithGoogle: "Sign in with Google",
    dontHaveAccount: "Don't have an account?",
    signUp: "Sign up",

    // Signup page
    createAccount: "Create Your Account",
    joinZor: "Join ZOR and start your computer science journey today.",
    firstName: "First Name",
    lastName: "Last Name",
    enterFirstName: "Enter your first name",
    enterLastName: "Enter your last name",
    createPassword: "Create a password",
    confirmPassword: "Confirm your password",
    confirmPasswordPlaceholder: "Confirm your password",
    agreeToTerms: "I agree to the",
    termsOfService: "Terms of Service",
    and: "and",
    privacyPolicy: "Privacy Policy",
    createAccountBtn: "Create Account",
    alreadyHaveAccount: "Already have an account?",

    // Signup Hero Section
    heroWelcomeTitle: "Welcome to your learning journey!",
    heroStartNow: "Start now",
    heroSubtitle: "Learn free computer courses, enhance your skills and discover new opportunities",

    // CourseLessons page
    toggleMenu: "Toggle Menu",
    menu: "Menu",
    graduationCap: "Graduation Cap",
    notCompleted: "Not completed",
    submit: "Submit",
    greatJobCorrect: "Great job! You got it right",
    oopsIncorrect: "Oops! That's not correct",
    success: "Success",
    error: "Error",

    // Status and UI messages
    loading: "Loading...",
    pleaseWait: "Please wait",
    tryAgain: "Try again",
    goBack: "Go back",
    continue: "Continue",
    start: "Start",
    finish: "Finish",
    confirm: "Confirm",

    // Lesson content
    microLesson11: "Micro Lesson 1.1",
    microLesson12: "Micro Lesson 1.2",
    microLesson13: "Micro Lesson 1.3",
    microLesson14: "Micro Lesson 1.4",
    microLesson15: "Micro Lesson 1.5",
    realLifeAnalogy: "Real-Life Analogy",

    computerDefinition: "A computer is a machine that receives data, processes it (Processing), and produces results (Output).",
    computerCharacteristics: "It is fast, reliable, trustworthy, and tireless.",
    computerInstructions: "But remember a computer does not do anything by itself; it only follows the instructions given by a human.",
    officeAssistant: "Think of a computer like a very efficient assistant in an office.",
    assistantAnalogy1: "Just like an assistant receives tasks, processes them, and delivers results",
    assistantAnalogy2: "A computer receives data (input), processes it, and gives you results (output)",
    assistantAnalogy3: "The assistant needs clear instructions - so does a computer!",

    basicComponents: "Understanding the basic components of a computer system.",
    hardwareComponents: "Hardware components: CPU, Memory, Storage",
    softwareComponents: "Software components: Operating System, Applications",
    hardwareSoftware: "How hardware and software work together",

    processInformation: "How computers process information and make decisions.",
    binarySystem: "Binary system: How computers understand 0s and 1s",
    processingSpeed: "Processing speed and efficiency",
    decisionMaking: "Decision-making through algorithms",

    inputOutputDevices: "Input and Output devices - How we communicate with computers.",
    inputDevices: "Input devices: Keyboard, mouse, microphone, camera",
    outputDevices: "Output devices: Monitor, printer, speakers",
    dataFlow: "How data flows from input to output",

    completeSystemsTitle: "Putting it all together - Complete computer systems.",
    componentsWorking: "How all components work together",
    computerTypes: "Different types of computer systems",
    realWorldApps: "Real-world applications and examples",

    // Quiz content
    quiz1: "Quiz 1",
    quiz2: "Quiz 2",
    quiz3: "Quiz 3",
    quiz4: "Quiz 4",
    quiz5: "Quiz 5",

    quiz1Question: "Which of the following is an example of Processing?",
    quiz1Option1: "Pressing a key on the keyboard",
    quiz1Option2: "Moving the mouse",
    quiz1Option3: "Performing calculations",
    quiz1Option4: "Viewing an image on the monitor",
    quiz1Explanation: "Processing means the computer works on input data, like performing calculations or analysis. Other options are just input (keyboard, mouse) or output (monitor), not actual processing.",

    quiz2Question: "Which component is considered the \"brain\" of the computer?",
    quiz2Option1: "Memory (RAM)",
    quiz2Option2: "Hard Drive",
    quiz2Option3: "CPU (Central Processing Unit)",
    quiz2Option4: "Monitor",
    quiz2Explanation: "The CPU (Central Processing Unit) is called the \"brain\" of the computer because it executes instructions and performs calculations.",

    quiz3Question: "What number system do computers use internally?",
    quiz3Option1: "Decimal (base 10)",
    quiz3Option2: "Binary (base 2)",
    quiz3Option3: "Hexadecimal (base 16)",
    quiz3Option4: "Octal (base 8)",
    quiz3Explanation: "Computers use the binary system (base 2) internally, which consists of only 0s and 1s. This is because computer circuits can easily represent two states: on (1) and off (0).",

    quiz4Question: "Which of the following is an OUTPUT device?",
    quiz4Option1: "Keyboard",
    quiz4Option2: "Mouse",
    quiz4Option3: "Microphone",
    quiz4Option4: "Printer",
    quiz4Explanation: "A printer is an output device because it produces physical results (printed documents) from digital data. Keyboard, mouse, and microphone are input devices.",

    quiz5Question: "What makes a computer system complete?",
    quiz5Option1: "Only hardware components",
    quiz5Option2: "Only software components",
    quiz5Option3: "Hardware and software working together",
    quiz5Option4: "Only the CPU",
    quiz5Explanation: "A complete computer system requires both hardware and software working together. Hardware provides the physical components, while software provides the instructions and programs.",

    contentWillDisplay: "Content for {title} will be displayed here.",
    level3: "Level 3",
    learnFundamentals: "Learn the fundamentals of computer systems",

    titleEnglish: "Title (English)",
    titleUrdu: "Title (Urdu)",
    subtitleEnglish: "Subtitle (English)",
    subtitleUrdu: "Subtitle (Urdu)",


    quizTitleEnglish: "Quiz Title (English)",
    quizTitleUrdu: "Quiz Title (Urdu)",

    descriptionEnglish: "Description (English)",
    descriptionUrdu: "Description (Urdu)",

    pointEnglish: "Point (English)",
    pointUrdu: "Point (Urdu)",

    quizDescriptionEnglish: "Quiz Description (English)",
    quizDescriptionUrdu: "Quiz Description (Urdu)",

    questionEnglish: "Question (English)",
    questionUrdu: "Question (Urdu)",

    explanationEnglish: "Explanation (English)",
    explanationUrdu: "Explanation (Urdu)",


    profile: "Profile",
    fullName: "Full Name",
    enterFullName: "Enter your full name",
    email: "Email",
    emailCannotBeChanged: "Email address cannot be changed",
    clickToChangePhoto: "Click to change profile photo",
    saveChanges: "Save Changes",
    saving: "Saving...",
    profileUpdated: "Profile updated successfully!",
    updateError: "Failed to update profile. Please try again.",
    invalidImageType: "Please select a valid image file",
    imageSizeLimit: "Image size should be less than 5MB",
    uploadingImage: "Uploading image...",
    imageUploadError: "Failed to upload image. Please try again.",

    // Header profile dropdown
    signOut: "Sign Out",
    profileName: "User Name",
    profileEmail: "user@example.com",

    // Dashboard (if needed)
    dashboard: "Dashboard",

    // General UI
    back: "Back",
    noCourseSubtitle: "Start your learning journey and choose your first course",
    
    // Dashboard Course Management
    noCoursesFound: "No Courses Found",
    createFirstCourse: "Create your first course to get started",
    edit: "Edit",
    
    // Course Level Management
    levelsManagement: "Course Levels Management",
    addCourseLevel: "Add Course Level",
    noLevelsFound: "No Course Levels Found",
    addFirstLevel: "Add your first course level to get started",
    autoAssigned: "Auto-assigned",
    levelAutoAssigned: "Level number is automatically assigned based on existing levels",
    levelAlreadyExists: "This level already exists for this course",
    editLevelInfo: "You can edit the level number, but it must be unique for this course",
    
    // Lesson Management
    noLessonsFound: "No Lessons Found",
    addFirstLesson: "Create your first lesson to get started",
    noLessonsInLevel: "No lessons in this level yet",
    points: "Points",
    addingContentTo: "Adding content to",

    // Notification translations
    notifications: "Notifications",
    noNotifications: "No notifications yet",
    newNotificationsWillAppearHere: "New notifications will appear here",
    markAllAsRead: "Mark all as read",
    viewAllNotifications: "View all notifications",
    translatingNotifications: "Translating notifications..."
  },
  ur: {
    // Header translations (Urdu)
    home: "ہوم",
    courses: "کورسز",
    search: "تلاش کریں",
    viewProfile: "پروفائل دیکھیں",

    // Navigation (Urdu)
    back: "واپس",

    // Course page specific translations (Urdu)
    structureForCSCoding: "کمپیوٹر سائنس اور کوڈنگ کی ساخت",
    estimatedDuration: "متوقع وقت",
    hoursRange: "1.5 - 2 گھنٹے",
    level: "لیول",
    completed: "مکمل",
    inProgress: "جاری",
    locked: "بند",
    view: "دیکھیں",

    // Dashboard specific translations (Urdu)
    adminDashboard: "ایڈمن ڈیش بورڈ",
    coursesManagement: "کورسز کا انتظام",
    lessonsManagement: "اسباق کا انتظام",
    addCourse: "کورس شامل کریں",
    addLessonsQuizzes: "اسباق اور کوئزز شامل کریں",
    addContent: "مواد شامل کریں",
    items: "آئٹمز",
    questions: "سوالات",
    totalQuestions: "کل سوالات",
    selectCourse: "کورس منتخب کریں",
    chooseCourse: "کورس منتخب کریں...",
    lessons: "اسباق",
    quizzes: "کوئزز",
    addLesson: "سبق شامل کریں",
    addQuiz: "کوئز شامل کریں",
    addQuestion: "سوال شامل کریں",
    addPoint: "نکتہ شامل کریں",
    titleKey: "ٹائٹل کی",
    descriptionKey: "تفصیل کی",
    pointKeys: "نکات کی کیز",
    quizTitleKey: "کوئز ٹائٹل کی",
    questionKey: "سوال کی",
    options: "اختیارات",
    optionKey: "آپشن کی",
    explanationKey: "وضاحت کی",
    correctAnswer: "صحیح جواب",
    fixedOptions: "4 مقرر",
    subtitleKey: "ذیلی عنوان کی",
    status: "حالت",
    duration: "مدت",
    actions: "اعمال",
    id: "آئی ڈی",
    title: "ٹائٹل",
    type: "قسم",
    order: "ترتیب",
    course: "کورس",
    unknown: "نامعلوم",
    viewDetails: "تفصیلات دیکھیں",
    editCourse: "کورس میں ترمیم",
    saveAll: "سب محفوظ کریں",
    cancel: "منسوخ",
    save: "محفوظ کریں",
    delete: "حذف کریں",
    duplicate: "کاپی کریں",
    remove: "ہٹا دیں",
    confirmDelete: "کیا آپ واقعی اس آئٹم کو حذف کرنا چاہتے ہیں؟",
    pleaseSelectCourse: "براہ کرم کورس منتخب کریں",
    lesson: "سبق",
    quiz: "کوئز",
    mcq: "MCQ",
    question: "سوال",
    point: "نکتہ",

    // Form placeholders and labels (Urdu)
    enterTitleKey: "مثال: microLesson11",
    enterDescriptionKey: "مثال: computerDefinition",
    enterPointKey: "نکتہ کی",
    enterQuizTitleKey: "مثال: quiz1",
    enterQuestionKey: "مثال: quiz1Question1",
    enterOptionKey: "آپشن کی",
    enterExplanationKey: "مثال: quiz1Explanation1",
    entercourseLevelTitle: "مثال: courseLevelTitle1",
    entercourseLevelSubtitle: "مثال: courseLevelSubtitle1",
    enterDuration: "مثال: 1.5 - 2 گھنٹے",

    // Course titles (Urdu) (expanded)
    courseLevelTitle1: "کمپیوٹر کیا ہے؟",
    courseLevelTitle2: "کمپیوٹر ہارڈ ویئر",
    courseLevelTitle3: "سافٹ ویئر کی بنیادی باتیں",
    courseLevelTitle4: "پروگرامنگ کی بنیادی باتیں",
    courseLevelTitle5: "ڈیٹا اور معلومات",
    courseLevelTitle6: "نیٹ ورک اور انٹرنیٹ",
    courseLevelTitle7: "سائبر سیکیورٹی کی بنیادی باتیں",
    courseLevelTitle8: "ڈیٹابیس کی بنیادی باتیں",
    courseLevelTitle9: "ویب ڈیولپمنٹ کی بنیادی باتیں",
    courseLevelTitle10: "موبائل ایپ ڈیولپمنٹ",
    courseLevelTitle11: "مصنوعی ذہانت کا تعارف",

    // Course subtitles (Urdu) (expanded)
    courseLevelSubtitle1: "کمپیوٹر سائنس کی بنیادی باتیں",
    courseLevelSubtitle2: "ہارڈ ویئر کے اجزاء کو سمجھنا",
    courseLevelSubtitle3: "سافٹ ویئر اور آپریٹنگ سسٹم",
    courseLevelSubtitle4: "پروگرامنگ کا تعارف",
    courseLevelSubtitle5: "ڈیٹا پروسیسنگ اور اسٹوریج",
    courseLevelSubtitle6: "کمپیوٹرز کو دنیا بھر میں جوڑنا",
    courseLevelSubtitle7: "ڈیجیٹل معلومات کی حفاظت",
    courseLevelSubtitle8: "ڈیٹا کا انتظام اور تنظیم",
    courseLevelSubtitle9: "ویب ایپلیکیشنز بنانا",
    courseLevelSubtitle10: "موبائل ایپلیکیشنز بنانا",
    courseLevelSubtitle11: "AI اور مشین لرننگ کا تعارف",

    // Course duration variations (Urdu)
    duration1: "30 - 45 منٹ",
    duration2: "1 - 1.5 گھنٹے",
    duration3: "1.5 - 2 گھنٹے", 
    duration4: "2 - 2.5 گھنٹے",
    duration5: "2.5 - 3 گھنٹے",
    duration6: "3 - 4 گھنٹے",
    duration7: "4 - 5 گھنٹے",
    duration8: "5+ گھنٹے",

    // Home page specific translations (Urdu)
    profileName: "میاں حماد خلیل",
    profileEmail: "example@gmail.com",
    courseCompleted: "کورس مکمل",
    courseCompletedCount: "2",
    viewProfileBtn: "پروفائل دیکھیں",

    // Course Progress Section (Urdu)
    yourCourseProgress: "آپ کی کورس کی پیش قدمی",
    trackProgressSubtitle: "دیکھیں کہ آپ نے اپنے سیکھنے کے سفر میں کتنی ترقی کی ہے۔",
    computerScienceCoding: "کمپیوٹر سائنس اور کوڈنگ",
    levelsCompleted: "سطحیں مکمل",
    currentLevelTitle: "لیول 8 — ایپلیکیشنز اور سافٹ ویئر",
    nextMilestone: "اگلا مقام",
    encouragementText: "آپ مستقل ترقی کر رہے ہیں، یوں ہی جاری رکھیں!",
    continueCourse: "کورس جاری رکھیں",
    viewAllLevels: "تمام لیولز دیکھیں",
    courseCompletedPercent: "45%",
    courseCompletedLabel: "کورس مکمل",

    // Explore Courses Section (Urdu)
    exploreCourses: "کورسز دریافت کریں",
    viewAll: "سب دیکھیں",
    structureForCS: "کمپیوٹر سائنس کی ساخت",
    courseNumber: "کورس نمبر",
    previous: "پچھلا",
    next: "اگلا",
    EnrollNow: "ابھی داخلہ لیں",
    courseEnrollment: "کورس میں داخلہ",

    // Explore Courses Page - Course Titles (Urdu)
    explorecourseLevelTitle1: "کمپیوٹر سائنس کی ساخت",
    explorecourseLevelTitle2: "ڈیٹا سٹرکچرز اور الگورتھمز",
    explorecourseLevelTitle3: "ویب ڈیولپمنٹ کی بنیادی باتیں",
    explorecourseLevelTitle4: "مشین لرننگ کی بنیادی باتیں",
    explorecourseLevelTitle5: "ڈیٹابیس مینجمنٹ سسٹمز",
    explorecourseLevelTitle6: "موبائل ایپ ڈیولپمنٹ",
    explorecourseLevelTitle7: "سائبر سیکیورٹی کی بنیادی باتیں",
    explorecourseLevelTitle8: "کلاؤڈ کمپیوٹنگ کی ضروری باتیں",
    explorecourseLevelTitle9: "سافٹ ویئر انجینئرنگ کے اصول",
    explorecourseLevelTitle10: "مصنوعی ذہانت کا جائزہ",
    explorecourseLevelTitle11: "نیٹ ورک پروگرامنگ",
    explorecourseLevelTitle12: "گیم ڈیولپمنٹ کی بنیادی باتیں",

    // Home1 specific translations (Urdu)
    noCourseEnrolled: "ابھی تک کوئی کورس میں داخلہ نہیں لیا",
    nocourseLevelSubtitle: "اپنے لرننگ سفر کا آغاز کریں اور پہلا کورس منتخب کریں۔",
    browseCourses: "کورسز دیکھیں",

    // Login page (Urdu)
    welcomeToZor: "ZOR میں خوش آمدید",
    welcomeSubtitle: "کمپیوٹر سائنس سیکھنے کا آسان اور دلچسپ طریقہ۔",
    email: "ای میل",
    password: "پاس ورڈ",
    enterEmail: "اپنا ای میل درج کریں",
    rememberMe: "مجھے یاد رکھیں",
    forgotPassword: "پاس ورڈ بھول گئے؟",
    signIn: "سائن ان",
    signingIn: "سائن اِن ہو رہا ہے",
    signInWithGoogle: "گوگل سے سائن ان کریں",
    dontHaveAccount: "اکاؤنٹ نہیں ہے؟",
    signUp: "سائن اپ",

    // Signup page (Urdu)
    createAccount: "اپنا اکاؤنٹ بنائیں",
    joinZor: "ZOR میں شامل ہوں اور آج ہی اپنا کمپیوٹر سائنس کا سفر شروع کریں۔",
    firstName: "پہلا نام",
    lastName: "آخری نام",
    enterFirstName: "اپنا پہلا نام درج کریں",
    enterLastName: "اپنا آخری نام درج کریں",
    createPassword: "پاس ورڈ بنائیں",
    confirmPassword: "پاس ورڈ کی تصدیق کریں",
    confirmPasswordPlaceholder: "اپنے پاس ورڈ کی تصدیق کریں",
    agreeToTerms: "میں",
    termsOfService: "خدمات کی شرائط",
    and: "اور",
    privacyPolicy: "پرائیویسی پالیسی",
    createAccountBtn: "اکاؤنٹ بنائیں",
    alreadyHaveAccount: "پہلے سے اکاؤنٹ موجود ہے؟",

    // Signup Hero Section (Urdu)
    heroWelcomeTitle: "آپ کے سیکھنے کے سفر میں خوش آمدید!",
    heroStartNow: "ابھی شروع کریں",
    heroSubtitle: "مفت کمپیوٹر کورسز سیکھیں، اپنی مہارت بڑھائیں اور نئے مواقع دریافت کریں",

    // CourseLessons page (Urdu)
    toggleMenu: "مینو ٹوگل کریں",
    menu: "مینو",
    graduationCap: "گریجویشن کیپ",
    notCompleted: "مکمل نہیں",
    submit: "جمع کریں",
    greatJobCorrect: "بہترین! آپ کا جواب صحیح ہے",
    oopsIncorrect: "اوہو! یہ صحیح نہیں ہے",
    success: "کامیابی",
    error: "خرابی",
    lesson: "سبق",
    mcq: "MCQ",

    // Status and UI messages (Urdu)
    loading: "لوڈ ہو رہا ہے...",
    pleaseWait: "براہ کرم انتظار کریں",
    tryAgain: "دوبارہ کوشش کریں",
    goBack: "واپس جائیں",
    continue: "جاری رکھیں",
    start: "شروع کریں",
    finish: "ختم کریں",
    save: "محفوظ کریں",
    cancel: "منسوخ کریں",
    confirm: "تصدیق کریں",

    addlevel: "لیول شامل کریں",

    // Lesson content (Urdu)
    microLesson11: "چھوٹا سبق 1.1",
    microLesson12: "چھوٹا سبق 1.2",
    microLesson13: "چھوٹا سبق 1.3",
    microLesson14: "چھوٹا سبق 1.4",
    microLesson15: "چھوٹا سبق 1.5",
    realLifeAnalogy: "حقیقی زندگی کی مثال",

    computerDefinition: "کمپیوٹر ایک مشین ہے جو ڈیٹا وصول کرتا ہے، اس پر عمل کرتا ہے (پروسیسنگ)، اور نتائج پیدا کرتا ہے (آؤٹ پٹ)۔",
    computerCharacteristics: "یہ تیز، قابل اعتماد، بھروسہ مند اور انتھک ہے۔",
    computerInstructions: "لیکن یاد رکھیں کہ کمپیوٹر خود سے کچھ نہیں کرتا؛ یہ صرف انسان کی دی گئی ہدایات کا پیروی کرتا ہے۔",
    officeAssistant: "کمپیوٹر کو ایک دفتر میں بہت موثر اسسٹنٹ کی طرح سمجھیں۔",
    assistantAnalogy1: "جیسے ایک اسسٹنٹ کام وصول کرتا ہے، ان پر عمل کرتا ہے، اور نتائج فراہم کرتا ہے",
    assistantAnalogy2: "کمپیوٹر ڈیٹا وصول کرتا ہے (ان پٹ)، اس پر عمل کرتا ہے، اور آپ کو نتائج دیتا ہے (آؤٹ پٹ)",
    assistantAnalogy3: "اسسٹنٹ کو واضح ہدایات کی ضرورت ہے - کمپیوٹر کو بھی!",

    basicComponents: "کمپیوٹر سسٹم کے بنیادی اجزاء کو سمجھنا۔",
    hardwareComponents: "ہارڈ ویئر اجزاء: CPU، میموری، اسٹوریج",
    softwareComponents: "سافٹ ویئر اجزاء: آپریٹنگ سسٹم، ایپلیکیشنز",
    hardwareSoftware: "ہارڈ ویئر اور سافٹ ویئر کیسے مل کر کام کرتے ہیں",

    processInformation: "کمپیوٹر معلومات کو کیسے پروسیس کرتے ہیں اور فیصلے کرتے ہیں۔",
    binarySystem: "بائنری سسٹم: کمپیوٹر 0 اور 1 کو کیسے سمجھتے ہیں",
    processingSpeed: "پروسیسنگ کی رفتار اور کارکردگی",
    decisionMaking: "الگورتھم کے ذریعے فیصلہ سازی",

    inputOutputDevices: "ان پٹ اور آؤٹ پٹ ڈیوائسز - ہم کمپیوٹر کے ساتھ کیسے بات چیت کرتے ہیں۔",
    inputDevices: "ان پٹ ڈیوائسز: کی بورڈ، ماؤس، مائیکروفون، کیمرہ",
    outputDevices: "آؤٹ پٹ ڈیوائسز: مانیٹر، پرنٹر، اسپیکر",
    dataFlow: "ڈیٹا ان پٹ سے آؤٹ پٹ تک کیسے بہتا ہے",

    completeSystemsTitle: "سب کچھ ملا کر - مکمل کمپیوٹر سسٹمز۔",
    componentsWorking: "تمام اجزاء کیسے مل کر کام کرتے ہیں",
    computerTypes: "کمپیوٹر سسٹمز کی مختلف اقسام",
    realWorldApps: "حقیقی دنیا کی ایپلیکیشنز اور مثالیں",

    // Quiz content (Urdu)
    quiz1: "کوئز 1",
    quiz2: "کوئز 2",
    quiz3: "کوئز 3",
    quiz4: "کوئز 4",
    quiz5: "کوئز 5",

    quiz1Question: "مندرجہ ذیل میں سے کون سا پروسیسنگ کی مثال ہے؟",
    quiz1Option1: "کی بورڈ پر کلید دبانا",
    quiz1Option2: "ماؤس کو ہلانا",
    quiz1Option3: "حسابات کرنا",
    quiz1Option4: "مانیٹر پر تصویر دیکھنا",
    quiz1Explanation: "پروسیسنگ کا مطلب یہ ہے کہ کمپیوٹر ان پٹ ڈیٹا پر کام کرتا ہے، جیسے حسابات یا تجزیہ کرنا۔ دیگر اختیارات صرف ان پٹ (کی بورڈ، ماؤس) یا آؤٹ پٹ (مانیٹر) ہیں، حقیقی پروسیسنگ نہیں۔",

    quiz2Question: "کون سا جزو کمپیوٹر کا \"دماغ\" سمجھا جاتا ہے؟",
    quiz2Option1: "میموری (RAM)",
    quiz2Option2: "ہارڈ ڈرائیو",
    quiz2Option3: "CPU (سینٹرل پروسیسنگ یونٹ)",
    quiz2Option4: "مانیٹر",
    quiz2Explanation: "CPU (سینٹرل پروسیسنگ یونٹ) کو کمپیوٹر کا \"دماغ\" کہا جاتا ہے کیونکہ یہ ہدایات پر عمل کرتا ہے اور حسابات کرتا ہے۔",

    quiz3Question: "کمپیوٹر اندرونی طور پر کون سا نمبر سسٹم استعمال کرتے ہیں؟",
    quiz3Option1: "ڈیسیمل (بیس 10)",
    quiz3Option2: "بائنری (بیس 2)",
    quiz3Option3: "ہیکساڈیسیمل (بیس 16)",
    quiz3Option4: "آکٹل (بیس 8)",
    quiz3Explanation: "کمپیوٹر اندرونی طور پر بائنری سسٹم (بیس 2) استعمال کرتے ہیں، جو صرف 0 اور 1 پر مشتمل ہے۔ اس کی وجہ یہ ہے کہ کمپیوٹر سرکٹس آسانی سے دو states کو ظاہر کر سکتے ہیں: آن (1) اور آف (0)۔",

    quiz4Question: "مندرجہ ذیل میں سے کون سا آؤٹ پٹ ڈیوائس ہے؟",
    quiz4Option1: "کی بورڈ",
    quiz4Option2: "ماؤس",
    quiz4Option3: "مائیکروفون",
    quiz4Option4: "پرنٹر",
    quiz4Explanation: "پرنٹر ایک آؤٹ پٹ ڈیوائس ہے کیونکہ یہ ڈیجیٹل ڈیٹا سے فزیکل نتائج (پرنٹ شدہ دستاویزات) پیدا کرتا ہے۔ کی بورڈ، ماؤس، اور مائیکروفون ان پٹ ڈیوائسز ہیں۔",

    quiz5Question: "کمپیوٹر سسٹم کو مکمل کیا بناتا ہے؟",
    quiz5Option1: "صرف ہارڈ ویئر اجزاء",
    quiz5Option2: "صرف سافٹ ویئر اجزاء",
    quiz5Option3: "ہارڈ ویئر اور سافٹ ویئر کا مل کر کام کرنا",
    quiz5Option4: "صرف CPU",
    quiz5Explanation: "ایک مکمل کمپیوٹر سسٹم کے لیے ہارڈ ویئر اور سافٹ ویئر دونوں کا مل کر کام کرنا ضروری ہے۔ ہارڈ ویئر فزیکل اجزاء فراہم کرتا ہے، جبکہ سافٹ ویئر ہدایات اور پروگرام فراہم کرتا ہے۔",

    contentWillDisplay: "{title} کے لیے مواد یہاں دکھایا جائے گا۔",
    level3: "لیول 3",
    learnFundamentals: "کمپیوٹر سسٹمز کی بنیادی باتیں سیکھیں",

    titleEnglish: "عنوان (انگریزی)",
    titleUrdu: "عنوان (اردو)",
    subtitleEnglish: "ذیلی عنوان (انگریزی)",
    subtitleUrdu: "ذیلی عنوان (اردو)",

    quizTitleEnglish: "کوئز عنوان (انگریزی)",
    quizTitleUrdu: "کوئز عنوان (اردو)",

    descriptionEnglish: "تفصیل (انگریزی)",
    descriptionUrdu: "تفصیل (اردو)",

    pointEnglish: "نکتہ (انگریزی)",
    pointUrdu: "نکتہ (اردو)",

    quizDescriptionEnglish: "کوئز کی تفصیل (انگریزی)",
    quizDescriptionUrdu: "کوئز کی تفصیل (اردو)",

    questionEnglish: "سوال (انگریزی)",
    questionUrdu: "سوال (اردو)",

    explanationEnglish: "وضاحت (انگریزی)",
    explanationUrdu: "وضاحت (اردو)",

    profile: "پروفائل",
    fullName: "مکمل نام",
    enterFullName: "اپنا مکمل نام درج کریں",
    email: "ای میل",
    emailCannotBeChanged: "ای میل ایڈریس تبدیل نہیں کیا جا سکتا",
    clickToChangePhoto: "پروفائل تصویر تبدیل کرنے کے لیے کلک کریں",
    saveChanges: "تبدیلیاں محفوظ کریں",
    saving: "محفوظ ہو رہا ہے...",
    profileUpdated: "پروفائل کامیابی سے اپڈیٹ ہو گیا!",
    updateError: "پروفائل اپڈیٹ کرنے میں ناکامی۔ براہ کرم دوبارہ کوشش کریں۔",
    invalidImageType: "براہ کرم ایک صحیح تصویری فائل منتخب کریں",
    imageSizeLimit: "تصویر کا سائز 5MB سے کم ہونا چاہیے",
    uploadingImage: "تصویر اپ لوڈ ہو رہی ہے...",
    imageUploadError: "تصویر اپ لوڈ کرنے میں ناکامی۔ براہ کرم دوبارہ کوشش کریں۔",

    // Header profile dropdown (Urdu)
    signOut: "سائن آؤٹ",
    profileName: "صارف کا نام",
    profileEmail: "user@example.com",

    // Dashboard (if needed)
    dashboard: "ڈیش بورڈ",

    // General UI (Urdu)
    back: "واپس",
    
    noCourseSubtitle: "اپنے لرننگ سفر کا آغاز کریں اور پہلا کورس منتخب کریں۔",
    
    // Dashboard Course Management (Urdu)
    noCoursesFound: "کوئی کورس نہیں ملا",
    createFirstCourse: "شروعات کے لیے اپنا پہلا کورس بنائیں",
    edit: "ترمیم",
    
    // Course Level Management (Urdu)
    levelsManagement: "کورس لیولز کا انتظام",
    addCourseLevel: "کورس لیول شامل کریں",
    noLevelsFound: "کوئی کورس لیول نہیں ملا",
    addFirstLevel: "شروعات کے لیے اپنا پہلا کورس لیول شامل کریں",
    autoAssigned: "خودکار تفویض",
    levelAutoAssigned: "لیول نمبر موجودہ لیولز کی بنیاد پر خودکار طور پر تفویض کیا جاتا ہے",
    levelAlreadyExists: "یہ لیول اس کورس کے لیے پہلے سے موجود ہے",
    editLevelInfo: "آپ لیول نمبر میں ترمیم کر سکتے ہیں، لیکن یہ اس کورس کے لیے منفرد ہونا چاہیے",
    
    // Lesson Management (Urdu)
    noLessonsFound: "کوئی اسباق نہیں ملے",
    addFirstLesson: "شروعات کے لیے اپنا پہلا سبق بنائیں",
    noLessonsInLevel: "اس لیول میں ابھی تک کوئی اسباق نہیں ہیں",
    points: "نکات",
    addingContentTo: "مواد شامل کرنا",

    // Notification translations (Urdu)
    notifications: "اطلاعات",
    noNotifications: "ابھی تک کوئی اطلاع نہیں",
    newNotificationsWillAppearHere: "نئی اطلاعات یہاں آئیں گی",
    markAllAsRead: "تمام کو پڑھا ہوا نشان زد کریں",
    viewAllNotifications: "تمام اطلاعات دیکھیں",
    translatingNotifications: "اطلاعات کا ترجمہ ہو رہا ہے..."
  }
};

// Language Context
const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    return localStorage.getItem('selectedLanguage') || 'ur';
  });

  useEffect(() => {
    const isRTL = currentLanguage === 'ur';
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLanguage;

    localStorage.setItem('selectedLanguage', currentLanguage);

    document.body.classList.toggle('rtl', isRTL);
    document.body.classList.toggle('ltr', !isRTL);
  }, [currentLanguage]);

  const changeLanguage = (language) => {
    setCurrentLanguage(language);
  };

  const t = (key) => {
    return translations[currentLanguage]?.[key] || key;
  };

  const isRTL = currentLanguage === 'ur';

  const value = {
    currentLanguage,
    changeLanguage,
    t,
    isRTL,
    languages: {
      en: 'English',
      ur: 'اردو'
    }
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};