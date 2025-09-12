import React from 'react'

export const SkeletonBox: React.FC<{ width?: number | string; height?: number | string; style?: React.CSSProperties }>
  = ({ width = '100%', height = 16, style }) => (
    <div style={{
      width, height,
      background: 'linear-gradient(90deg, #e5e7eb, #f3f4f6, #e5e7eb)',
      backgroundSize: '200% 100%',
      animation: 'sk 1.2s ease-in-out infinite',
      borderRadius: 6,
      ...style
    }} />
)

export const ListSkeleton: React.FC<{ rows?: number }>= ({ rows = 6 }) => (
  <div style={{ display:'grid', gap: 8 }}>
    {Array.from({ length: rows }).map((_, i) => (
      <SkeletonBox key={i} height={58} />
    ))}
  </div>
)

// inject keyframes once
const styleId = 'skeleton-keyframes'
if (typeof document !== 'undefined' && !document.getElementById(styleId)) {
  const el = document.createElement('style')
  el.id = styleId
  el.innerHTML = `@keyframes sk { 0%{background-position:0% 50%} 100%{background-position:200% 50%} }`
  document.head.appendChild(el)
}
