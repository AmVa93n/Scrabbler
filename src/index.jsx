import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProviderWrapper } from "./context/auth.context";
import { NotificationsProvider } from '@toolpad/core/useNotifications';
import { SocketProvider } from './context/socket.context';
import DragDropContext from './context/dragdrop.context';
import { GoogleOAuthProvider } from '@react-oauth/google';

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <Router>
    <AuthProviderWrapper>
      <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
        <SocketProvider>
          <NotificationsProvider>
            <DragDropContext>
              <App />
            </DragDropContext>
          </NotificationsProvider>
        </SocketProvider>
      </GoogleOAuthProvider>
    </AuthProviderWrapper>
  </Router>
);
