import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProviderWrapper } from "./context/auth.context";
import { NotificationsProvider } from '@toolpad/core/useNotifications';
import { SocketProvider } from './context/socket.context';
import DragDropContext from './context/dragdrop.context';

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <Router>
    <AuthProviderWrapper>
      <SocketProvider>
        <NotificationsProvider>
          <DragDropContext>
            <App />
          </DragDropContext>
        </NotificationsProvider>
      </SocketProvider>
    </AuthProviderWrapper>
  </Router>
);
