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
      color: 'bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-500'
    },
    {
      title: 'Service Packages',
      value: summary.packageCount,
      link: '/packages',
      color: 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-l-4 border-emerald-500'
    },
    {
      title: 'Service Records',
      value: summary.serviceCount,
      link: '/services',
      color: 'bg-gradient-to-br from-amber-50 to-amber-100 border-l-4 border-amber-500'
    },
    {
      title: 'Total Revenue',
      value: `${summary.totalRevenue?.toLocaleString() || 0} RWF`,
      link: '/payments',
      color: 'bg-gradient-to-br from-purple-50 to-purple-100 border-l-4 border-purple-500'
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
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-800">Dashboard</h1>
        <p className="mt-2 text-slate-600 text-lg">Welcome to SmartPark Car Washing Sales Management System</p>
      </div>

      <div className="grid grid-cols-1 gap-6 mt-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, index) => (
          <Link
            key={index}
            to={card.link}
            className={`p-6 rounded-xl shadow-lg border border-slate-200 ${card.color} hover:shadow-xl hover:scale-105 transition-all duration-200`}
          >
            <div>
              <h2 className="text-lg font-semibold text-slate-700">{card.title}</h2>
              <p className="mt-3 text-3xl font-bold text-slate-800">{card.value}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            to="/cars"
            className="flex items-center p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 border border-blue-200"
          >
            <span className="font-semibold text-blue-700 text-lg">Register New Car</span>
          </Link>

          <Link
            to="/services"
            className="flex items-center p-6 bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 border border-amber-200"
          >
            <span className="font-semibold text-amber-700 text-lg">Create Service Record</span>
          </Link>

          <Link
            to="/payments"
            className="flex items-center p-6 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 border border-purple-200"
          >
            <span className="font-semibold text-purple-700 text-lg">Record Payment</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
