import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProviderWrapper } from "./context/auth.context";
import { NotificationsProvider } from '@toolpad/core/useNotifications';

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <Router>
    <AuthProviderWrapper>
      <NotificationsProvider>
        <App />
      </NotificationsProvider>
    </AuthProviderWrapper>
  </Router>
);
