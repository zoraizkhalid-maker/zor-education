Note on README:

The content of this README was written entirely by me (Zoraiz). Grok AI was used solely to refine the language, eliminate grammatical and spelling errors, and enhance readability.

# ZOR Educational Platform

<p align="center">
  <img src="https://img.shields.io/badge/React-19.1.1-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React"/>
  <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase"/>
  <img src="https://img.shields.io/badge/Bootstrap-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white" alt="Bootstrap"/>
  <img src="https://img.shields.io/badge/PWA-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white" alt="PWA"/>
</p>

<p align="center">
  <strong>Bilingual (English + Urdu) web-based learning platform for Computer Science & Programming</strong><br>
  Made accessible for Urdu-speaking students with full RTL support
</p>


## Key Features

### For Students
- Secure login (Email/Password + Google Sign-in)
- Browse & enroll in courses
- Real-time progress tracking & completion status
- Interactive multiple-choice quizzes with instant feedback
- Instant English ↔ Urdu language switching (full RTL support)
- Progressive Web App (installable + offline capable)
- Clean & responsive design (mobile + desktop)

### For Admins / Teachers
- Complete course & content management dashboard
- Create/edit courses, levels & lessons (bilingual)
- Quiz builder with explanations
- Upload images & thumbnails
- Toggle course visibility/activation
- Structured level-based learning path

## Demo

## Tech Stack

- **Frontend:** React 19, React Bootstrap, Lucide Icons
- **Backend & Database:** Firebase (Auth, Firestore, Storage)
- **PWA:** Service Worker + Manifest
- **Language Support:** Dynamic English/Urdu + RTL
- **Build Tool:** Create React App

## How to Run Locally

1. Clone the repository
   
   git clone https://github.com/yourusername/zor-education-platform.git
   cd zor-education-platform

2. Install dependencies

npm install

3. Create Firebase project & add config

Create project at https://console.firebase.google.com
Enable Authentication (Email/Password + Google)
Enable Firestore & Storage
Copy config and create src/firebase.js

4. Start Server
npm start
opens at: (example) http://localhost:3000


Simplified project structure:
src/
├── components/         → Reusable UI components
├── pages/              → Main views (Home, Courses, Dashboard, etc.)
├── firebase.js         → Firebase config & initialization
├── services/           → Firestore helpers, auth functions
├── contexts/           → Auth & Language contexts
├── assets/             → Images, translations
└── utils/              → Helpers (RTL toggle, progress calc, etc.)


- Zoraiz
