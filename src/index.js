import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ReactDOM from "react-dom/client";
import "./index.css";
import "./styles/rtl-support.css";
import reportWebVitals from "./reportWebVitals";
import { LanguageProvider } from "./LanguageContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";
import Login from "./Login";
import Home from "./Home";
import CourseLevel from "./CourseLevel";
import CourseLessons from "./CourseLessons";
import ExploreCourses from "./ExploreCourses";
import Contact from "./Contact";
import Home1 from "./Home1";
import Dashboard from "./pages/Dashboard";
import Signup from "./Signup";
import { LoadingScreen } from "./Loading";
import Profile from "./ProfileScreen";
import ProtectedRoute from "./components/ProtectedRoute";

const AppContent = () => {
  const { isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/course-levels" element={
          <ProtectedRoute>
            <CourseLevel />
          </ProtectedRoute>
        } />
        <Route path="/course-lessons" element={
          <ProtectedRoute>
            <CourseLessons />
          </ProtectedRoute>
        } />
        <Route path="/explore-courses" element={<ExploreCourses />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/home" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={
          <ProtectedRoute requiredRole="Admin">
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />

      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
};

const App = () => {
  return (
    <React.StrictMode>
      <LanguageProvider>
        <Router>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </Router>
      </LanguageProvider>
    </React.StrictMode>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

// Register service worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
        
        // Start background sync
        if ('sync' in window.ServiceWorkerRegistration.prototype) {
          navigator.serviceWorker.ready.then((registration) => {
            registration.sync.register('background-sync');
          });
        }
        
        // Set up periodic background sync (every 30 minutes)
        setInterval(() => {
          if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
              type: 'START_BACKGROUND_SYNC'
            });
          }
        }, 30 * 60 * 1000); // 30 minutes
        
        // Listen for service worker messages
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data && event.data.type === 'UPDATES_AVAILABLE') {
            // Show notification to user about available updates
            console.log('Updates available:', event.data.data);
            // You can trigger a toast notification or update indicator here
          }
        });
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

reportWebVitals();