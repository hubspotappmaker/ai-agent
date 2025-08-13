import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from '../App';
import Chat from '../components/Chat';
import Email from '../components/Email';
import Activity from '../components/History';
import Settings from '../components/Settings';
import Account from '../components/Account';
import UserGuide from '../components/UserGuide';
import Auth from '../components/Auth';
import RequireAuth from './RequireAuth';
import { HubspotParamsProvider } from '../context/HubspotParamsContext';
import IndexRedirect from './IndexRedirect';
import HubspotInstall from '../components/HubspotInstall';

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <HubspotParamsProvider>
        <RequireAuth>
          <App />
        </RequireAuth>
      </HubspotParamsProvider>
    ),
    children: [
      { index: true, element: <IndexRedirect /> },
      { path: 'chat', element: <Chat /> },
      { path: 'email', element: <Email /> },
      { path: 'activity', element: <Activity /> },
      { path: 'account', element: <Account /> },
      { path: 'settings', element: <Settings /> },
      { path: 'guide', element: <UserGuide /> },
      { path: 'hubspot/install', element: <HubspotInstall /> },
    ],
  },
  { path: '/login', element: (
    <HubspotParamsProvider>
      <Auth />
    </HubspotParamsProvider>
  ) },
]);

const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;


