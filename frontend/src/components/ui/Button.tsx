import React from 'react'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost'
}

export const Button: React.FC<Props> = ({ variant = 'primary', style, children, ...rest }) => {
  const base: React.CSSProperties = {
    padding: '8px 14px',
    borderRadius: 6,
    border: '1px solid transparent',
    cursor: 'pointer',
    fontWeight: 600,
  }
  const variants: Record<string, React.CSSProperties> = {
    primary: { background: '#2563eb', color: '#fff' },
    secondary: { background: '#e5e7eb', color: '#111827' },
    ghost: { background: 'transparent', borderColor: '#e5e7eb', color: '#111827' }
  }
  return (
    <button {...rest} style={{ ...base, ...(variants[variant] || {}), ...(style || {}) }}>
      {children}
    </button>
  )
}
