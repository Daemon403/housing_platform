import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'

type Toast = { id: number; message: string; type?: 'success' | 'error' | 'info' }

type Ctx = {
  toasts: Toast[]
  show: (message: string, type?: Toast['type']) => void
  remove: (id: number) => void
}

const ToastContext = createContext<Ctx>({} as any)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const show = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000)
  }, [])

  const remove = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), [])

  const value = useMemo(() => ({ toasts, show, remove }), [toasts, show, remove])
  return (
    <ToastContext.Provider value={value}>
      {children}
      <div style={{ position: 'fixed', right: 16, bottom: 16, display: 'grid', gap: 8, zIndex: 50 }}>
        {toasts.map((t) => (
          <div key={t.id} style={{
            padding: '10px 12px',
            borderRadius: 8,
            color: '#111',
            background: t.type === 'success' ? '#bbf7d0' : t.type === 'error' ? '#fecaca' : '#e5e7eb',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
