import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx';
import { ComplaintProvider } from './context/ComplaintContext.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';
import { SocketProvider } from './context/SocketContext.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <SocketProvider>
          <ComplaintProvider>
            <NotificationProvider>
              <App />
            </NotificationProvider>
          </ComplaintProvider>
        </SocketProvider>
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
)
