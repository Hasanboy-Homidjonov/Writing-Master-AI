import React from 'react';

interface AnimatedStickerProps {
  type: 'feather' | 'trophy' | 'coin' | 'brain' | 'shield' | 'fire' | 'target' | 'star';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const AnimatedSticker: React.FC<AnimatedStickerProps> = ({
  type,
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xl',
    md: 'w-12 h-12 text-3xl',
    lg: 'w-16 h-16 text-4xl',
    xl: 'w-20 h-20 text-5xl',
  };

  const getEmoji = () => {
    switch (type) {
      case 'feather': return '✍️';
      case 'trophy': return '🏆';
      case 'coin': return '🪙';
      case 'brain': return '🧠';
      case 'shield': return '🛡️';
      case 'fire': return '🔥';
      case 'target': return '🎯';
      case 'star': return '⭐';
      default: return '✨';
    }
  };

  return (
    <div
      className={`inline-flex items-center justify-center select-none cursor-pointer transform transition-all duration-300 hover:scale-125 hover:rotate-12 active:scale-95 animate-float ${sizeClasses[size]} ${className}`}
    >
      <span className="drop-shadow-md filter">{getEmoji()}</span>
    </div>
  );
};
