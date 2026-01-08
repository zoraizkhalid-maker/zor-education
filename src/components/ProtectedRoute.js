import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingScreen } from '../Loading';

const ProtectedRoute = ({ children, requiredRole = null }) => {
    const { user, userData, isLoading } = useAuth();

    // Show loading screen while authentication is being checked
    if (isLoading) {
        return <LoadingScreen />;
    }

    // Not logged in - redirect to login
    if (!user) {
        console.log('ProtectedRoute: No user found, redirecting to login');
        return <Navigate to="/login" replace />;
    }

    // User is logged in but userData not loaded yet - wait
    if (!userData) {
        console.log('ProtectedRoute: User found but userData not loaded, showing loading');
        return <LoadingScreen />;
    }

    // Check role requirement (for admin routes)
    if (requiredRole) {
        const userRole = userData.role;
        console.log(`ProtectedRoute: Checking role requirement. Required: ${requiredRole}, User has: ${userRole}`);
        
        if (userRole !== requiredRole) {
            // User is logged in but doesn't have required role
            // Redirect admin-required routes to home if user is regular user
            console.log(`ProtectedRoute: User role ${userRole} doesn't match required ${requiredRole}, redirecting to home`);
            return <Navigate to="/home" replace />;
        }
    }

    // All checks passed - render the protected component
    console.log('ProtectedRoute: All checks passed, rendering protected component');
    return children;
};

export default ProtectedRoute;