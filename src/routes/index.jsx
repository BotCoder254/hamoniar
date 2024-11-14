import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Protected Route Wrapper
export const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

// Public Route Wrapper (accessible only when not logged in)
export const PublicRoute = ({ children }) => {
  const { currentUser } = useAuth();
  
  if (currentUser) {
    return <Navigate to="/discover" />;
  }
  
  return children;
}; 