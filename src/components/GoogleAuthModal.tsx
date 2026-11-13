import React from 'react';
import { GoogleSignInCard } from './GoogleSignInCard';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  canClose?: boolean;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  canClose = true
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <GoogleSignInCard
        isModal={true}
        canCancel={canClose}
        onCancel={onClose}
        onSuccess={onClose}
      />
    </div>
  );
};
