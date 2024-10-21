import { useContext, useEffect, useState } from 'react'; 
import { Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext'; 

const ProtectedRoute = ({ element, requiredRole }) => {
  const { user, signIn } = useContext(AuthContext);
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    if (!user) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        signIn(JSON.parse(storedUser));
      }
    }
    setLoading(false);
  }, [user, signIn]);

  if (loading) {
    return null; 
  }


  if (!user) {
    return <Navigate to="/login" />;
  }


  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/home" />;
  }

  return element;
};

export default ProtectedRoute;
