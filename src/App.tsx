import { useState } from 'react';
import './App.css';
import { AuthModal } from '@/components/Auth/AuthModal';
import { UserProfile } from '@/components/Auth/UserProfile';
import { ChatWidget } from '@/components/ChatWidget';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

const AppContent = () => {
  const {
    user,
    loading,
    showAuthModal,
    showUserProfile,
    openAuthModal,
    closeAuthModal,
    openUserProfile,
    closeUserProfile,
  } = useAuth();
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [rasaUrl, setRasaUrl] = useState<string>('http://localhost:5005');
  const [showConfig, setShowConfig] = useState<boolean>(false);

  const chatWidgetConfig = {
    socketUrl: rasaUrl,
    title: 'Mi Chatbot',
    subtitle: '¿En qué puedo ayudarte?',
    inputHint: 'Escribe tu mensaje...',
  };

  const onConnect = () => {
    console.log('Conectado a Rasa');
    setIsConnected(true);
  };
  const onDisconnect = () => {
    console.log('Desconectado de Rasa');
    setIsConnected(false);
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <h1>🤖 Mi Chatbot</h1>
          <div className="connection-status">
            <span
              className={`status-indicator ${
                isConnected ? 'connected' : 'disconnected'
              }`}
            >
              {isConnected ? '🟢 Conectado' : '🔴 Desconectado'}
            </span>

            <div className="header-actions">
              {!loading &&
                (user ? (
                  <button
                    type="button"
                    className="user-button"
                    onClick={openUserProfile}
                    title="Perfil de usuario"
                  >
                    <span className="user-avatar">
                      {user.user_metadata?.first_name?.[0] ||
                        user.email?.[0]?.toUpperCase() ||
                        ''}
                    </span>
                    <span className="user-name">
                      {user.user_metadata?.first_name ||
                        user.email?.split('@')[0] ||
                        'Usuario'}
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    className="login-button"
                    onClick={openAuthModal}
                  >
                    👤 Iniciar Sesión
                  </button>
                ))}

              <button
                type="button"
                className="config-button"
                onClick={() => setShowConfig(!showConfig)}
              >
                ⚙️ Configuración
              </button>
            </div>
          </div>
        </div>
      </header>

      {showConfig && (
        <div className="config-panel">
          <h3>Configuración del Chatbot</h3>
          <div className="config-item">
            <label htmlFor="rasa-url">URL de Rasa:</label>
            <input
              id="rasa-url"
              type="text"
              value={rasaUrl}
              onChange={(e) => setRasaUrl(e.target.value)}
              placeholder="http://localhost:5005"
            />
          </div>
          <div className="config-info">
            <p>
              <strong>Estado:</strong>{' '}
              {isConnected ? 'Conectado' : 'No conectado'}
            </p>
            <p>
              <strong>Endpoint:</strong> {rasaUrl}/webhooks/rest/webhook
            </p>
          </div>
        </div>
      )}

      <main className="main-content"></main>

      <ChatWidget
        {...chatWidgetConfig}
        onConnect={onConnect}
        onDisconnect={onDisconnect}
      />

      <AuthModal isOpen={showAuthModal} onClose={closeAuthModal} />

      <UserProfile isOpen={showUserProfile} onClose={closeUserProfile} />
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
