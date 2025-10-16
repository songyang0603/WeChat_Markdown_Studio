import React from 'react';

export interface BadgeProps {
  variant?: 'default' | 'warning' | 'success';
  children: React.ReactNode;
}

const baseStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  borderRadius: '999px',
  padding: '2px 8px',
  fontSize: '12px',
  fontWeight: 500
};

const variantStyles: Record<NonNullable<BadgeProps['variant']>, React.CSSProperties> = {
  default: { backgroundColor: '#E2E8F0', color: '#1E293B' },
  warning: { backgroundColor: '#FEF3C7', color: '#92400E' },
  success: { backgroundColor: '#D1FAE5', color: '#047857' }
};

export const Badge: React.FC<BadgeProps> = ({ variant = 'default', children }) => {
  return <span style={{ ...baseStyle, ...variantStyles[variant] }}>{children}</span>;
};
