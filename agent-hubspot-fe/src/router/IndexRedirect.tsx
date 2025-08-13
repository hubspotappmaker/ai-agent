import React, { useEffect } from 'react';
import { useHubspotParams } from '../context/HubspotParamsContext';

const IndexRedirect: React.FC = () => {
  const { navigateWithParams } = useHubspotParams();
  useEffect(() => {
    navigateWithParams('/chat', { replace: true });
  }, [navigateWithParams]);
  return null;
};

export default IndexRedirect;


