import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import { useNotification } from './Notification'

const Layout = ({ children, user, setUser }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { success, error } = useNotification()

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleLogout = async () => {
    try {
      await axios.post('/auth/logout')
      setUser(null)
      success('Logged out successfully')
      navigate('/login')
    } catch (err) {
      console.error('Logout error:', err)
      error('Failed to logout')
    }
  }

  const menuItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/cars', label: 'Cars' },
    { path: '/packages', label: 'Packages' },
    { path: '/services', label: 'Service Records' },
    { path: '/payments', label: 'Payments' },
    { path: '/reports', label: 'Reports' },
  ]

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Sidebar for mobile */}
      <div className={`fixed inset-0 z-20 transition-opacity ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="absolute inset-0 bg-slate-900 opacity-50" onClick={toggleSidebar}></div>
      </div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 overflow-y-auto transition duration-300 transform bg-gradient-to-b from-slate-800 to-slate-900 lg:translate-x-0 lg:static lg:inset-0 shadow-2xl ${
        sidebarOpen ? 'translate-x-0 ease-out' : '-translate-x-full ease-in'
      }`}>
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 border-b border-slate-700">
          <div className="flex items-center">
            <span className="text-xl font-bold text-white">SmartPark CWSMS</span>
          </div>
          <button onClick={toggleSidebar} className="text-white lg:hidden hover:bg-blue-800 p-2 rounded-lg transition-colors">
            ✕
          </button>
        </div>

        <nav className="mt-6 px-3">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 mt-2 text-slate-200 transition-all duration-200 rounded-lg font-medium ${
                location.pathname === item.path
                  ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                  : 'hover:bg-slate-700 hover:text-white hover:transform hover:scale-105'
              }`}
            >
              <span>{item.label}</span>
            </Link>
          ))}

          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 mt-6 text-slate-200 transition-all duration-200 rounded-lg hover:bg-red-600 hover:text-white font-medium border-t border-slate-700 pt-6"
          >
            <span>Logout</span>
          </button>
        </nav>
      </div>

      {/* Content area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shadow-sm">
          <div className="flex items-center">
            <button onClick={toggleSidebar} className="text-slate-600 hover:text-blue-600 focus:outline-none lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors">
              ☰
            </button>
          </div>

          <div className="flex items-center">
            <div className="relative">
              <span className="text-slate-700">
                Welcome, <span className="font-semibold text-blue-600">{user?.fullName || 'User'}</span>
              </span>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gradient-to-br from-slate-50 to-blue-50 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout
