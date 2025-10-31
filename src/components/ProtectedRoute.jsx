import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('accessToken');

  if (!token) {
    // Si no hay token, redirigir al login
    return <Navigate to="/login" />;
  }

  // Si hay token, mostrar el contenido (en nuestro caso, el MainLayout)
  return children;
}

export default ProtectedRoute;