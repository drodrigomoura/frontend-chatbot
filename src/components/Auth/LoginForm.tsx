import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import './Auth.css';

export const LoginForm = () => {
  const [email, setEmail] = useState<string>('');
  const [otp, setOtp] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const { signInWithOTP, verifyOTP, closeAuthModal } = useAuth();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    const { error } = await signInWithOTP(email);

    if (error) {
      setError(error.message);
    } else {
      setMessage('¡Código enviado! Revisa tu email.');
      setStep('otp');
    }

    setLoading(false);
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await verifyOTP(email, otp);

    if (error) {
      setError(error.message);
    } else {
      closeAuthModal();
    }

    setLoading(false);
  };

  const resetForm = () => {
    setStep('email');
    setOtp('');
    setError('');
    setMessage('');
  };

  return (
    <div className="auth-form">
      <h2>Iniciar Sesión con OTP</h2>
      {error && <div className="error-message">{error}</div>}
      {message && <div className="success-message">{message}</div>}

      {step === 'email' ? (
        <form onSubmit={handleEmailSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              disabled={loading}
            />
          </div>

          <button type="submit" disabled={loading} className="auth-button">
            {loading ? 'Enviando código...' : 'Enviar código OTP'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleOTPSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              disabled
              className="disabled-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="otp">Código OTP</label>
            <input
              id="otp"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="123456"
              required
              disabled={loading}
              maxLength={6}
            />
            <small>
              Ingresa el código de 6 dígitos que recibiste por email
            </small>
          </div>

          <div className="otp-actions">
            <button
              type="submit"
              disabled={loading || !otp}
              className="auth-button"
            >
              {loading ? 'Verificando...' : 'Verificar código'}
            </button>

            <button
              type="button"
              onClick={resetForm}
              className="link-button"
              disabled={loading}
            >
              ← Volver a ingresar email
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
