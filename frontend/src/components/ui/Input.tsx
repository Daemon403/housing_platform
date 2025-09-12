import React from 'react'

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
}

export const Input: React.FC<Props> = ({ label, error, style, ...rest }) => {
  return (
    <label style={{ display: 'grid', gap: 4 }}>
      {label && <span style={{ fontSize: 13, opacity: 0.8 }}>{label}</span>}
      <input {...rest} style={{
        padding: '8px 10px',
        borderRadius: 6,
        border: `1px solid ${error ? '#ef4444' : '#e5e7eb'}`,
        outline: 'none',
        ...(style || {})
      }} />
      {error && <span style={{ color: '#ef4444', fontSize: 12 }}>{error}</span>}
    </label>
  )
}
