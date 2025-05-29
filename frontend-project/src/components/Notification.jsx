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
        return 'bg-emerald-600 text-white border-2 border-emerald-700'
      case 'error':
        return 'bg-red-600 text-white border-2 border-red-700'
      case 'warning':
        return 'bg-amber-600 text-white border-2 border-amber-700'
      default:
        return 'bg-blue-600 text-white border-2 border-blue-700'
    }
  }

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-4/5 max-w-2xl">
      <div className={`p-4 rounded-lg ${getMessageStyle()} shadow-lg text-center`}>
        <p className="text-base font-medium">{message.text}</p>
      </div>
    </div>
  )
}

export default NotificationProvider
