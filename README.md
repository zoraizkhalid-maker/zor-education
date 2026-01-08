<p align="center">
  <img src="https://img.shields.io/badge/React-19.1.1-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React"/>
  <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase"/>
  <img src="https://img.shields.io/badge/Bootstrap-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white" alt="Bootstrap"/>
  <img src="https://img.shields.io/badge/PWA-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white" alt="PWA"/>
</p>

<h1 align="center">📚 ZOR Educational Platform</h1>

<p align="center">
  <strong>A bilingual (English/Urdu) educational web application for learning computer science and programming concepts</strong>
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-demo">Demo</a> •
  <a href="#-installation">Installation</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-project-structure">Project Structure</a> •
  <a href="#-documentation">Documentation</a> •
  <a href="#-contributing">Contributing</a> •
  <a href="#-license">License</a>
</p>

---

## 🎯 About

**ZOR** is a modern Learning Management System (LMS) designed specifically for bilingual education. The platform supports both English and Urdu with full RTL (Right-to-Left) support, making quality computer science education accessible to Urdu-speaking students.

### Key Highlights

- 🌐 **Bilingual Interface** — Full English/Urdu support with dynamic RTL switching
- 📱 **Progressive Web App** — Installable on mobile and desktop with offline support
- 📊 **Real-time Progress Tracking** — Student progress synced instantly via Firebase
- 👨‍💼 **Admin Dashboard** — Complete CMS for courses, levels, and lessons
- 🔒 **Secure Authentication** — Email/password + Google OAuth
- 🎓 **Structured Learning** — Sequential lesson unlocking with interactive quizzes

---

## ✨ Features

### For Students
| Feature | Description |
|---------|-------------|
| 🔐 **Authentication** | Email/password & Google Sign-In |
| 📖 **Course Enrollment** | Browse and enroll in available courses |
| 📈 **Progress Tracking** | Visual progress indicators and completion status |
| 📝 **Interactive Quizzes** | Multiple-choice questions with instant feedback |
| 🌍 **Language Toggle** | Switch between English and Urdu instantly |
| 📱 **Responsive Design** | Works on desktop, tablet, and mobile |
| 💾 **Offline Access** | PWA with offline capability |

### For Admins
| Feature | Description |
|---------|-------------|
| 📚 **Course Management** | Create, edit, delete courses with bilingual content |
| 📊 **Level Management** | Organize courses into structured levels |
| 📝 **Lesson Builder** | Add lessons with analogies and examples |
| ❓ **Quiz Builder** | Create quizzes with explanations |
| 🖼️ **Media Upload** | Upload course images and thumbnails |
| ✅ **Activation Control** | Toggle course visibility |

---

## 🚀 Demo

> 🔗 **Live Demo:** [Coming Soon]

### Screenshots

<details>
<summary>📸 Click to view screenshots</summary>

| Login Page | Home Dashboard |
|------------|----------------|
| ![Login](docs/screenshots/login.png) | ![Home](docs/screenshots/home.png) |

| Course Levels | Lesson View |
|---------------|-------------|
| ![Levels](docs/screenshots/levels.png) | ![Lesson](docs/screenshots/lesson.png) |

| Admin Dashboard | Quiz Interface |
|-----------------|----------------|
| ![Admin](docs/screenshots/admin.png) | ![Quiz](docs/screenshots/quiz.png) |

</details>

---

## 📦 Installation

### Prerequisites

- **Node.js** v14.0.0 or higher — [Download](https://nodejs.org/)
- **npm** v6.0.0 or higher (comes with Node.js)
- **Git** (optional) — [Download](https://git-scm.com/)

### Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/zor-educational-platform.git

# Navigate to project directory
cd zor-educational-platform

# Install dependencies
npm install

# Start development server
npm start
```

The app will open automatically at `http://localhost:3000`

### Environment Setup

Create a `.env` file in the root directory (optional - Firebase config is pre-configured):

```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React.js | 19.1.1 | UI Framework |
| React Router | 7.8.1 | Navigation |
| React Bootstrap | Latest | UI Components |
| Lucide React | Latest | Icons |
| React Toastify | Latest | Notifications |
| CSS3 | - | Styling & RTL Support |

### Backend & Services
| Technology | Purpose |
|------------|---------|
| Firebase Auth | User Authentication |
| Firebase Firestore | NoSQL Database |
| Firebase Storage | File Storage |
| Firebase Hosting | Deployment |

### Development Tools
| Tool | Purpose |
|------|---------|
| Create React App | Build Configuration |
| npm | Package Management |
| ESLint | Code Linting |
| Prettier | Code Formatting |

---

## 📁 Project Structure

```
zor-educational-platform/
├── 📂 public/
│   ├── index.html              # Main HTML file
│   ├── manifest.json           # PWA manifest
│   └── 📂 assets/              # Static assets (images, icons)
│
├── 📂 src/
│   ├── 📂 pages/               # Screen components
│   │   ├── Login.js            # Login screen
│   │   ├── Signup.js           # Registration screen
│   │   ├── Home.js             # Main dashboard
│   │   ├── ExploreCourses.js   # Course catalog
│   │   ├── CourseLevel.js      # Course levels view
│   │   ├── CourseLessons.js    # Lesson/quiz interface
│   │   ├── ProfileScreen.js    # User profile
│   │   └── 📂 Dashboard/       # Admin panel
│   │       ├── index.js
│   │       ├── CourseManagement.js
│   │       ├── LevelManagement.js
│   │       └── LessonsManagement.js
│   │
│   ├── 📂 components/          # Reusable components
│   │   └── Header.js           # Navigation header
│   │
│   ├── 📂 context/             # React Context providers
│   │   ├── AuthContext.js      # Authentication state
│   │   └── LanguageContext.js  # Language preferences
│   │
│   ├── 📂 styles/              # CSS stylesheets
│   │   ├── App.css             # Global styles
│   │   └── rtl.css             # RTL language support
│   │
│   ├── App.js                  # Main app component
│   ├── firebase.js             # Firebase configuration
│   └── index.js                # Entry point
│
├── 📂 scripts/
│   └── firebase-course-uploader.js  # Course upload utility
│
├── 📂 docs/
│   └── PROJECT_DOCUMENTATION.md     # Detailed documentation
│
├── .gitignore
├── package.json
└── README.md
```

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start development server on `localhost:3000` |
| `npm run build` | Create production build in `/build` folder |
| `npm test` | Run test suite |
| `npm run upload-course` | Upload course data to Firebase |
| `npm run extract-course-data` | Extract course data for review |

---

## 📚 Documentation

For comprehensive documentation including:

- 📐 **Design System** — Figma designs and UI/UX guidelines
- 🖥️ **Frontend Architecture** — Component structure and state management
- 🔧 **Backend Setup** — Firebase configuration and database schema
- 📊 **Database Schema** — Collections and document structures
- 🔄 **Content Workflow** — PDF to live course pipeline
- 🔐 **Security Rules** — Firebase security implementation

👉 See **[PROJECT_DOCUMENTATION.md](docs/PROJECT_DOCUMENTATION.md)**

---

## 🗄️ Database Schema

### Collections Overview

```
Firestore Database
│
├── 📁 users/
│   └── {userId}
│       ├── email
│       ├── first_name
│       ├── last_name
│       ├── profile_pic
│       └── course_progress[]
│
└── 📁 courses/
    └── {courseId}
        ├── courseNumber
        ├── titles { en, ur }
        ├── descriptions { en, ur }
        ├── active
        ├── image
        └── 📁 levels/
            └── {levelId}
                ├── level
                ├── titles { en, ur }
                └── lessons[]
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### Code Style

- Follow ESLint configuration
- Use Prettier for formatting
- Write meaningful commit messages
- Add comments for complex logic

---

## 🐛 Troubleshooting

<details>
<summary><strong>Port 3000 already in use</strong></summary>

```bash
# macOS/Linux
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```
</details>

<details>
<summary><strong>Module not found errors</strong></summary>

```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```
</details>

<details>
<summary><strong>Firebase connection errors</strong></summary>

- Check your internet connection
- Verify Firebase configuration in `src/firebase.js`
- Ensure Firebase project is active
</details>

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

| Role | Contribution |
|------|--------------|
| **Frontend Developer** | React application, UI/UX implementation |
| **Backend Developer** | Firebase setup, database architecture |
| **Content Team** | Course material preparation |
| **AI Assistant** | Course content generation & translation |

---

## 🙏 Acknowledgments

- [React.js](https://reactjs.org/) - UI Framework
- [Firebase](https://firebase.google.com/) - Backend Services
- [React Bootstrap](https://react-bootstrap.github.io/) - UI Components
- [Lucide Icons](https://lucide.dev/) - Icon Library
- [Create React App](https://create-react-app.dev/) - Build Tools

---

<p align="center">
  Made with ❤️ for Education
</p>

<p align="center">
  <a href="#-zor-educational-platform">⬆️ Back to Top</a>
</p>
