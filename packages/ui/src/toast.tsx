'use client'

import * as React from 'react'
import { cn } from '../../../apps/web/lib/utils'

interface Toast {
  id: string
  title?: string
  description?: string
  action?: React.ReactNode
  duration?: number
  variant?: 'default' | 'destructive' | 'success'
}

interface ToastContextType {
  toasts: Toast[]
  toast: (toast: Omit<Toast, 'id'>) => void
  dismiss: (id: string) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const toast = React.useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(7)
    const newToast = { ...toast, id }
    
    setToasts((prev) => [...prev, newToast])
    
    const duration = toast.duration || 5000
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, duration)
    }
  }, [])

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

// Export toast function for convenience
export const toast = (options: Omit<Toast, 'id'>) => {
  // This will be called from components that have access to the useToast hook
  // The actual implementation should use the useToast hook
  console.warn('toast() should be called from within a component that uses useToast()')
}

function ToastContainer({ toasts, dismiss }: { toasts: Toast[], dismiss: (id: string) => void }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 flex items-start gap-3 animate-slide-in-right',
            {
              'border-red-500 border-l-4': toast.variant === 'destructive',
              'border-green-500 border-l-4': toast.variant === 'success',
              'border-blue-500 border-l-4': toast.variant === 'default' || !toast.variant,
            }
          )}
        >
          <div className="flex-1">
            {toast.title && (
              <div className="font-semibold text-gray-900 dark:text-gray-100">
                {toast.title}
              </div>
            )}
            {toast.description && (
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {toast.description}
              </div>
            )}
            {toast.action && <div className="mt-2">{toast.action}</div>}
          </div>
          <button
            onClick={() => dismiss(toast.id)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      ))}
    </div>
  )
}