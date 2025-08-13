import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useHubspotParams } from '../context/HubspotParamsContext';
import { pingMe } from '../service/auth.service';

type Props = {
  children: React.ReactNode;
};

const RequireAuth: React.FC<Props> = ({ children }) => {
  const location = useLocation();
  const { appendParamsToPath } = useHubspotParams();
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  // If no token, go to login quickly
  if (!token) {
    return <Navigate to={appendParamsToPath('/login')} replace state={{ from: location.pathname }} />;
  }

  // Optionally we could ping here, but to avoid flashing and double renders,
  // App layout will ping and redirect on 401.

  return <>{children}</>;
};

export default RequireAuth;


