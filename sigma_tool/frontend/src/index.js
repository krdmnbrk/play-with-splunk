import React from 'react';
import ReactDOM from 'react-dom/client';
import { SplunkThemeProvider } from '@splunk/themes';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <SplunkThemeProvider family="enterprise" colorScheme="light" density="comfortable">
        <App />
    </SplunkThemeProvider>

);
