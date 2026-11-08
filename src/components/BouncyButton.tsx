import React from 'react';
import { sounds } from '../utils/audio';

interface BouncyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'success' | 'danger' | 'warning' | 'purple' | 'outline' | 'gold';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  pulseGlow?: boolean;
  wiggleHover?: boolean;
  icon?: React.ReactNode;
}

export const BouncyButton: React.FC<BouncyButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  pulseGlow = false,
  wiggleHover = true,
  icon,
  className = '',
  onClick,
  disabled,
  ...props
}) => {
  const baseStyles = 'relative inline-flex items-center justify-center font-bold tracking-wide rounded-2xl select-none transition-all duration-200 shadow-md active:translate-y-1 active:shadow-inner cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-7 py-3.5 text-base gap-2.5',
    xl: 'px-9 py-4 text-lg gap-3 shadow-xl',
  };

  const variantStyles = {
    primary: 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-blue-500/30 hover:shadow-blue-500/50',
    success: 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-emerald-500/30 hover:shadow-emerald-500/50',
    danger: 'bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white shadow-rose-500/30 hover:shadow-rose-500/50',
    warning: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-amber-500/30 hover:shadow-amber-500/50',
    purple: 'bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white shadow-purple-500/30 hover:shadow-purple-500/50',
    gold: 'bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-900 font-extrabold shadow-yellow-500/40 hover:shadow-yellow-500/60',
    outline: 'bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-200 hover:border-slate-300 shadow-sm',
  };

  const glowClass = pulseGlow ? 'animate-pulse-glow ring-4 ring-blue-400/40' : '';
  const wiggleClass = wiggleHover ? 'hover:scale-105 active:scale-95 transition-transform' : '';

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      sounds.playClick();
      if (onClick) onClick(e);
    }
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${glowClass} ${wiggleClass} ${className}`}
      onClick={handleClick}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="transform transition-transform group-hover:scale-110">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
