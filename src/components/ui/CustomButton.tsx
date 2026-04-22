import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'outlined' | 'filled';
  textColor?: string;
  borderColor?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'outlined',
  textColor,
  borderColor,
  className,
  ...props
}) => {
  const baseClasses = 'text-button uppercase tracking-[0.02em] px-10 py-3.5 transition-all duration-200 cursor-pointer';

  const variantClasses =
    variant === 'filled'
      ? 'bg-electric-blue text-white hover:bg-electric-dark active:scale-[0.98]'
      : 'bg-transparent border hover:scale-[1.02] active:scale-[0.98]';

  const style: React.CSSProperties = {};
  if (variant === 'outlined') {
    style.borderColor = borderColor || 'currentColor';
    style.color = textColor || 'currentColor';
  }

  return (
    <button
      className={cn(baseClasses, variantClasses, className)}
      style={style}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
