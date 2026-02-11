
import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  disabled?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  className = '', 
  variant = 'primary',
  disabled = false,
  icon
}) => {
  const baseStyles = "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm";
  
  const variants = {
    primary: "bg-[#ccff00] hover:bg-[#a3cc00] text-black shadow-[0_0_15px_rgba(204,255,0,0.3)] hover:shadow-[0_0_25px_rgba(204,255,0,0.5)]",
    secondary: "bg-[#30363d] hover:bg-[#484f58] text-[#e6edf3]",
    outline: "border border-[#30363d] hover:bg-[#30363d] text-[#e6edf3]",
    ghost: "hover:bg-[#30363d] text-[#8b949e] hover:text-[#e6edf3]"
  };

  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {icon}
      {children}
    </button>
  );
};
