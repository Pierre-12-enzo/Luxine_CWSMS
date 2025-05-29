// Simple visible div message system - no toasts, just clean div messages
import { useState, createContext, useContext } from 'react'

const NotificationContext = createContext()

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }
  return context
}

export const NotificationProvider = ({ children }) => {
  const [message, setMessage] = useState(null)

  const showMessage = (text, type = 'info') => {
    setMessage({ text, type })
    // Auto-hide after 4 seconds
    setTimeout(() => {
      setMessage(null)
    }, 4000)
  }

  const success = (text) => showMessage(text, 'success')
  const error = (text) => showMessage(text, 'error')
  const warning = (text) => showMessage(text, 'warning')
  const info = (text) => showMessage(text, 'info')

  return (
    <NotificationContext.Provider value={{ success, error, warning, info }}>
      {children}
      {message && <SimpleMessage message={message} onClose={() => setMessage(null)} />}
    </NotificationContext.Provider>
  )
}

const SimpleMessage = ({ message, onClose }) => {
  const getMessageStyle = () => {
    switch (message.type) {
      case 'success':
        return 'bg-emerald-500 border-l-4 border-emerald-600 text-white shadow-lg'
      case 'error':
        return 'bg-red-500 border-l-4 border-red-600 text-white shadow-lg'
      case 'warning':
        return 'bg-amber-500 border-l-4 border-amber-600 text-white shadow-lg'
      default:
        return 'bg-blue-500 border-l-4 border-blue-600 text-white shadow-lg'
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className={`p-4 rounded-lg ${getMessageStyle()} transform transition-all duration-300 ease-in-out`}>
        <div className="flex justify-between items-center">
          <p className="text-sm font-medium">{message.text}</p>
          <button
            onClick={onClose}
            className="ml-4 text-lg font-bold hover:opacity-70 text-white transition-opacity"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  )
}

export default NotificationProvider
