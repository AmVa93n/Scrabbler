import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProviderWrapper } from "./context/auth.context.tsx";
import { NotificationsProvider } from '@toolpad/core/useNotifications';
import { SocketProvider } from './context/socket.context.tsx';
import DragDropContext from './context/dragdrop.context.tsx';
import { GoogleOAuthProvider } from '@react-oauth/google';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <AuthProviderWrapper>
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
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
  </StrictMode>,
)
