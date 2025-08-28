import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/config/supabase';
import { useAuth } from '@/contexts/AuthContext';
import './ChatWidget.css';

interface ChatWidgetProps {
  socketUrl?: string;
  title?: string;
  subtitle?: string;
  inputHint?: string;
  onBotResponse?: (message: Message) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

interface Button {
  title: string;
  payload: string;
}

interface Message {
  id: number;
  type: 'user' | 'bot';
  text: string;
  timestamp: string;
  buttons?: Button[];
}

interface RasaResponse {
  recipient_id: string;
  text: string;
  buttons?: Button[];
}

export const ChatWidget = ({
  socketUrl = 'http://localhost:5005',
  title = 'Mi Chatbot',
  subtitle = '¿En qué puedo ayudarte?',
  inputHint = 'Escribe tu mensaje...',
  onBotResponse,
  onConnect,
  onDisconnect,
}: ChatWidgetProps) => {
  const { user, openAuthModal } = useAuth();
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [authTriggeredByBot, setAuthTriggeredByBot] = useState<boolean>(false);
  const [originalMessage, setOriginalMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const decodeUnicode = useCallback((text: string): string => {
    try {
      return text.replace(/\\u[\dA-F]{4}/gi, (match) => {
        return String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16));
      });
    } catch (error) {
      console.warn('Error decodificando Unicode:', error);
      return text;
    }
  }, []);

  const sendMessageViaRest = useCallback(
    async (text: string): Promise<void> => {
      try {
        // Preparar headers con token si está disponible
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };

        // Agregar token de autorización si el usuario está autenticado
        if (user) {
          // Obtener el token de la sesión actual
          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (session?.access_token) {
            headers['Authorization'] = `Bearer ${session.access_token}`;
            console.log(
              '🔐 Token enviado a Rasa:',
              session.access_token.substring(0, 20) + '...',
            );
          }
        }

        const response = await fetch(`${socketUrl}/webhooks/rest/webhook`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            sender: user?.id || 'anonymous',
            message: text.trim(),
            metadata: user
              ? {
                  user_id: user.id,
                  email: user.email || '',
                  user_metadata: user.user_metadata,
                  // Incluir el token de autorización en metadata para que Rasa pueda accederlo
                  Authorization: headers['Authorization'] || '',
                }
              : undefined,
          }),
        });

        if (response.ok) {
          const data: RasaResponse[] = await response.json();
          
          // Debug: Log de la respuesta de Rasa
          console.log('🔍 Respuesta de Rasa:', data);

          if (data && data.length > 0) {
            const combinedText = data
              .map((item: RasaResponse) => decodeUnicode(item.text))
              .join('\n');

            // Combinar todos los botones de todas las respuestas
            const allButtons = data
              .filter((item: RasaResponse) => item.buttons)
              .flatMap((item: RasaResponse) => item.buttons!);

            const botMessage: Message = {
              id: Date.now(),
              type: 'bot',
              text: combinedText,
              timestamp: new Date().toISOString(),
              buttons: allButtons.length > 0 ? allButtons : undefined,
            };

            setMessages((prev) => [...prev, botMessage]);
            setIsTyping(false);
            setError(null);

            if (onBotResponse) onBotResponse(botMessage);
          } else {
            setIsTyping(false);
          }
        } else {
          console.error('❌ Error en REST API:', response.status);
          setError(`Error ${response.status}: ${response.statusText}`);
          setIsTyping(false);
        }
      } catch (error) {
        console.error('❌ Error enviando mensaje REST:', error);
        setError('Error de conexión con el servidor');
        setIsTyping(false);
      }
    },
    [socketUrl, decodeUnicode, onBotResponse, user],
  );

  const sendMessage = useCallback(
    (text: string): void => {
      if (!text.trim()) return;

      const userMessage: Message = {
        id: Date.now(),
        type: 'user',
        text: decodeUnicode(text.trim()),
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInputValue('');
      setIsTyping(true);
      setError(null);

      // Guardar mensaje original para posible reenvío después de autenticación
      setOriginalMessage(text.trim());
      sendMessageViaRest(text);
    },
    [decodeUnicode, sendMessageViaRest],
  );

  const handleButtonClick = useCallback(
    (buttonTitle: string, payload: string): void => {
      // Manejar botón especial de autenticación
      if (payload === '/autenticar_usuario') {
        // Si ya está logueado, no hacer nada
        if (user) {
          return;
        }
        setAuthTriggeredByBot(true); // Guardar que el bot pidió autenticación
        openAuthModal();
        return;
      }

      // Crear mensaje de usuario y enviarlo
      const userMessage: Message = {
        id: Date.now(),
        type: 'user',
        text: buttonTitle,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsTyping(true);
      setError(null);
      sendMessageViaRest(payload);
    },
    [sendMessageViaRest, openAuthModal],
  );

  // Efecto para ejecutar acción pendiente después del login
  useEffect(() => {
    if (user && authTriggeredByBot && originalMessage) {
      console.log('🔄 Reenviando mensaje original después del login:', originalMessage);
      sendMessageViaRest(originalMessage);
      setAuthTriggeredByBot(false);
      setOriginalMessage(null);
    }
  }, [user, authTriggeredByBot, originalMessage, sendMessageViaRest]);

  useEffect(() => {
    const checkConnection = async (): Promise<void> => {
      try {
        // Preparar headers para test de conexión
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };

        // Agregar token si está disponible
        if (user) {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (session?.access_token) {
            headers['Authorization'] = `Bearer ${session.access_token}`;
          }
        }

        const response = await fetch(`${socketUrl}/webhooks/rest/webhook`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            sender: user?.id || 'test-connection',
            message: 'test',
            metadata: user && headers['Authorization']
              ? {
                  user_id: user.id,
                  Authorization: headers['Authorization'],
                }
              : undefined,
          }),
        });

        if (response.ok) {
          setIsConnected(true);
          setError(null);
          if (onConnect) onConnect();
        } else {
          setError(`Error de conexión: ${response.status}`);
        }
      } catch (error) {
        console.error('❌ Error verificando conexión:', error);
        setError('No se puede conectar al servidor Rasa');
      }
    };

    checkConnection();
  }, [socketUrl, user]); // Depende de socketUrl y user

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (inputRef.current && document.activeElement !== inputRef.current) {
      inputRef.current.focus();
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!inputValue.trim() || isTyping) return;
    sendMessage(inputValue);
  };

  const handleKeyPress = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!inputValue.trim() || isTyping) return;
      sendMessage(inputValue);
    }
  };

  const formatTime = (timestamp: string): string => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="chat-widget">
      {!isOpen && (
        <button
          className="chat-widget-toggle"
          onClick={() => setIsOpen(true)}
          title={title}
        >
          <span className="chat-icon">💬</span>
          {!isConnected && <span className="connection-indicator">🔴</span>}
        </button>
      )}

      {isOpen && (
        <div className="chat-widget-container">
          <div className="chat-header">
            <div className="chat-header-info">
              <h3>{title}</h3>
              <p>{subtitle}</p>
            </div>
            <button
              className="chat-close-button"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </div>

          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="empty-state">
                <span>🤖</span>
                <p>
                  ¡Hola{user ? ` ${user.user_metadata?.first_name || ''}` : ''}!
                  Soy tu asistente virtual. ¿En qué puedo ayudarte?
                </p>
                {error && (
                  <div className="error-message">
                    <small>⚠️ {error}</small>
                  </div>
                )}
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className={`message ${message.type}`}>
                  <div className="message-content">
                    <p>{message.text}</p>
                    {message.buttons && message.buttons.length > 0 && (
                      <div className="message-buttons">
                        {message.buttons.map((button, index) => (
                          <button
                            key={index}
                            className="message-button"
                            onClick={() => handleButtonClick(button.title, button.payload)}
                          >
                            {button.title}
                          </button>
                        ))}
                      </div>
                    )}
                    <span className="message-time">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                </div>
              ))
            )}

            {isTyping && (
              <div className="message bot typing">
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="message bot error">
                <div className="message-content">
                  <p>⚠️ Error: {error}</p>
                  <small>Verifica que el servidor Rasa esté ejecutándose</small>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form className="chat-input-container" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={inputHint}
              disabled={isTyping}
              className="chat-input"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="chat-send-button"
            >
              ➤
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
