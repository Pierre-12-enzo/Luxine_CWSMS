import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

const Dashboard = () => {
  const [summary, setSummary] = useState({
    carCount: 0,
    serviceCount: 0,
    totalRevenue: 0,
    packageCount: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const { data } = await axios.get('/reports/summary')
        setSummary(data)
      } catch (error) {
        console.error('Error fetching summary:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSummary()
  }, [])

  const cards = [
    {
      title: 'Total Cars',
      value: summary.carCount,
      link: '/cars',
      icon: '🚗',
      color: 'from-blue-500/20 to-blue-600/20',
      borderColor: 'border-blue-500/30',
      textColor: 'text-blue-400'
    },
    {
      title: 'Service Packages',
      value: summary.packageCount,
      link: '/packages',
      icon: '📦',
      color: 'from-emerald-500/20 to-emerald-600/20',
      borderColor: 'border-emerald-500/30',
      textColor: 'text-emerald-400'
    },
    {
      title: 'Service Records',
      value: summary.serviceCount,
      link: '/services',
      icon: '🔧',
      color: 'from-amber-500/20 to-amber-600/20',
      borderColor: 'border-amber-500/30',
      textColor: 'text-amber-400'
    },
    {
      title: 'Total Revenue',
      value: `${summary.totalRevenue?.toLocaleString() || 0} RWF`,
      link: '/payments',
      icon: '💰',
      color: 'from-primary-500/20 to-primary-600/20',
      borderColor: 'border-primary-500/30',
      textColor: 'text-primary-400'
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg font-medium text-gray-500">Loading dashboard data...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-purple-300 text-lg">Welcome to SmartPark Car Washing Sales Management System</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, index) => (
          <Link
            key={index}
            to={card.link}
            className="group p-6 bg-gray-800 rounded-lg border border-purple-600 hover:bg-gray-700 transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl">{card.icon}</span>
              <div className={`w-2 h-2 ${card.textColor.replace('text-', 'bg-')} rounded-full`}></div>
            </div>
            <h3 className="text-purple-200 text-sm font-medium mb-2">{card.title}</h3>
            <p className={`text-3xl font-bold ${card.textColor}`}>{card.value}</p>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-purple-400 text-center">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            to="/cars"
            className="p-6 bg-gray-800 rounded-lg border border-purple-600 hover:bg-gray-700 transition-all duration-200"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🚗</span>
              </div>
              <div>
                <h3 className="font-semibold text-white text-lg">Register New Car</h3>
                <p className="text-purple-300 text-sm">Add a new vehicle to the system</p>
              </div>
            </div>
          </Link>

          <Link
            to="/services"
            className="p-6 bg-gray-800 rounded-lg border border-purple-600 hover:bg-gray-700 transition-all duration-200"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-amber-600 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🔧</span>
              </div>
              <div>
                <h3 className="font-semibold text-white text-lg">Create Service Record</h3>
                <p className="text-purple-300 text-sm">Log a new service session</p>
              </div>
            </div>
          </Link>

          <Link
            to="/payments"
            className="p-6 bg-gray-800 rounded-lg border border-purple-600 hover:bg-gray-700 transition-all duration-200"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💳</span>
              </div>
              <div>
                <h3 className="font-semibold text-white text-lg">Record Payment</h3>
                <p className="text-purple-300 text-sm">Process customer payment</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
