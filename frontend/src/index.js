import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Amplify } from 'aws-amplify';
import { AMPLIFY_CONFIG } from './aws-exports';
import { BrowserRouter } from 'react-router-dom';
import { fetchAuthSession } from 'aws-amplify/auth';

const authToken = (await fetchAuthSession()).tokens?.idToken?.toString();

Amplify.configure({
  Auth: {
    Cognito: { ...AMPLIFY_CONFIG.Auth.Cognito },
  },
  API: {
    REST: {
      headers: async () => {
        return {
          Authorization: authToken,
          'Access-Control-Allow-Credentials': true,
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
          'Access-Control-Allow-Origin': '*',
        };
      },
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
