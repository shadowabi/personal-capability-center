import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'outline';
  className?: string;
}

const variantStyles = {
  default: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  outline: 'border border-gray-300 bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className = '',
}) => {
  const baseStyles = 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium';
  const styles = `${baseStyles} ${variantStyles[variant]} ${className}`;

  return (
    <span className={styles}>
      {children}
    </span>
  );
};
