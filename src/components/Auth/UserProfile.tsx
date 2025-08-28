import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import './Auth.css';

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfile = ({ isOpen, onClose }: UserProfileProps) => {
  const { user, signOut, closeUserProfile } = useAuth();
  const [showConfirm, setShowConfirm] = useState<boolean>(false);

  if (!isOpen || !user) return null;

  const handleSignOut = async () => {
    await signOut();
    closeUserProfile();
  };

  const confirmSignOut = () => {
    setShowConfirm(true);
  };

  const cancelSignOut = () => {
    setShowConfirm(false);
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div
        className="auth-modal user-profile"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="auth-modal-close" onClick={onClose}>
          ✕
        </button>

        <div className="profile-content">
          <div className="profile-header">
            <div className="profile-avatar">
              {user.user_metadata?.first_name?.[0] ||
                user.email?.[0]?.toUpperCase() ||
                ''}
            </div>
            <div className="profile-info">
              <h3>
                {user.user_metadata?.first_name} {user.user_metadata?.last_name}
              </h3>
              <p>{user.email || ''}</p>
            </div>
          </div>

          <div className="profile-details">
            <div className="detail-item">
              <label>Email verificado:</label>
              <span
                className={user.email_confirmed_at ? 'verified' : 'unverified'}
              >
                {user.email_confirmed_at ? '✅ Verificado' : '❌ No verificado'}
              </span>
            </div>

            <div className="detail-item">
              <label>Última conexión:</label>
              <span>
                {user.last_sign_in_at
                  ? new Date(user.last_sign_in_at).toLocaleDateString()
                  : 'Nunca'}
              </span>
            </div>
          </div>

          {!showConfirm ? (
            <div className="profile-actions">
              <button
                type="button"
                className="sign-out-button"
                onClick={confirmSignOut}
              >
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <div className="confirm-signout">
              <p>¿Estás seguro que quieres cerrar sesión?</p>
              <div className="confirm-actions">
                <button
                  type="button"
                  className="confirm-button"
                  onClick={handleSignOut}
                >
                  Sí, cerrar sesión
                </button>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={cancelSignOut}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
