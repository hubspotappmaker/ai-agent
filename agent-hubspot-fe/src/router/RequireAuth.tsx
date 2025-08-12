import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

type Props = {
  children: React.ReactNode;
};

const RequireAuth: React.FC<Props> = ({ children }) => {
  const location = useLocation();
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth.token') : null;

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
};

export default RequireAuth;


