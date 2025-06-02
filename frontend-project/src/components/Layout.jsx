import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import { useNotification } from './Notification'

const Layout = ({ children, user, setUser }) => {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { success, error } = useNotification()

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
    {
      path: '/',
      label: 'Dashboard',
      icon: '🏠',
      shortLabel: 'Home'
    },
    {
      path: '/cars',
      label: 'Cars',
      icon: '🚗',
      shortLabel: 'Cars'
    },
    {
      path: '/packages',
      label: 'Packages',
      icon: '📦',
      shortLabel: 'Packages'
    },
    {
      path: '/services',
      label: 'Service Records',
      icon: '🔧',
      shortLabel: 'Services'
    },
    {
      path: '/payments',
      label: 'Payments',
      icon: '💳',
      shortLabel: 'Payments'
    },
    {
      path: '/reports',
      label: 'Reports',
      icon: '📊',
      shortLabel: 'Reports'
    },
  ]

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Top Header */}
      <header className="bg-black border-b border-purple-600 sticky top-0 z-40">
        <div className="px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SP</span>
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">SmartPark</h1>
              <p className="text-purple-300 text-xs">CWSMS</p>
            </div>
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-lg transition-all duration-200 border border-purple-600"
            >
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.fullName?.charAt(0) || 'U'}
                </span>
              </div>
              <span className="text-white text-sm font-medium hidden sm:block">
                {user?.fullName || 'User'}
              </span>
              <svg className={`w-4 h-4 text-purple-300 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* User Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl border border-purple-600 py-2 z-50">
                <div className="px-4 py-2 border-b border-purple-600">
                  <p className="text-white font-medium">{user?.fullName}</p>
                  <p className="text-purple-300 text-sm">@{user?.username}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-red-400 hover:bg-red-500/10 transition-colors flex items-center space-x-2"
                >
                  <span>🚪</span>
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20 px-4 py-6 min-h-[calc(100vh-140px)]">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-black border-t border-purple-600 z-50">
        <div className="flex items-center justify-around py-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-purple-600 text-white'
                    : 'text-purple-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                <span className="text-xl mb-1">{item.icon}</span>
                <span className="text-xs font-medium">{item.shortLabel}</span>
                {isActive && (
                  <div className="w-1 h-1 bg-white rounded-full mt-1"></div>
                )}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Click outside to close user menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </div>
  )
}

export default Layout
