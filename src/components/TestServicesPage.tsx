// Simple test component for debugging services page
import React from 'react';
import { Provider } from 'react-redux';
import { store } from '../store';
import { ServicesPage } from '../pages/services/NewServicesPage';

const TestServicesPage = () => {
  return (
    <Provider store={store}>
      <div style={{ padding: '20px' }}>
        <h1>Test Services Page</h1>
        <ServicesPage />
      </div>
    </Provider>
  );
};

export default TestServicesPage;
