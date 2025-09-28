import React from 'react';

const Button = ({
  children,
  variant = 'default',
  size = 'default',
  className = '',
  onClick,
  disabled = false,
  ...props
}) => {
  const baseClasses = `
    inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium
    transition-all duration-200 disabled:pointer-events-none disabled:opacity-50
    outline-none focus:ring-2 focus:ring-offset-2
  `;

  const variantClasses = {
    default: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    link: 'text-blue-600 underline-offset-4 hover:underline focus:ring-blue-500'
  };

  const sizeClasses = {
    default: 'h-9 px-4 py-2',
    sm: 'h-8 px-3 py-1 text-xs',
    lg: 'h-10 px-6 py-2 text-base',
    icon: 'h-9 w-9 p-0'
  };

  const combinedClasses = `
    ${baseClasses}
    ${variantClasses[variant] || variantClasses.default}
    ${sizeClasses[size] || sizeClasses.default}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return (
    <button
      className={combinedClasses}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export { Button };