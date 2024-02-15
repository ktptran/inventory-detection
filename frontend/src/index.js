import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Amplify } from 'aws-amplify';
import { AMPLIFY_CONFIG } from './aws-exports';
import { BrowserRouter } from 'react-router-dom';

Amplify.configure({
  Auth: {
    Cognito: { ...AMPLIFY_CONFIG.Auth.Cognito },
  },
  API: {
    REST: {
      HttpApi: {
        ...AMPLIFY_CONFIG.API.REST.HttpApi,
      },
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
