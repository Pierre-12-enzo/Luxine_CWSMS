import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import axios from 'axios'

// Components
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Cars from './pages/Cars'
import Packages from './pages/Packages'
import ServiceRecords from './pages/ServiceRecords'
import Payments from './pages/Payments'
import Reports from './pages/Reports'
import NotFound from './pages/NotFound'

// Set axios defaults
axios.defaults.baseURL = 'http://localhost:5000/api'
axios.defaults.withCredentials = true

const App = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // Check if user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await axios.get('/auth/check')
        if (data.isLoggedIn) {
          setUser(data.user)
        }
      } catch (error) {
        console.error('Auth check error:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Protected route component
  const ProtectedRoute = ({ children }) => {
    if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>

    if (!user) {
      return <Navigate to="/login" />
    }

    return children
  }

  return (
    <Routes>
      <Route path="/login" element={
        user ? <Navigate to="/" /> : <Login setUser={setUser} />
      } />

      <Route path="/" element={
        <ProtectedRoute>
          <Layout user={user} setUser={setUser}>
            <Dashboard />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/cars" element={
        <ProtectedRoute>
          <Layout user={user} setUser={setUser}>
            <Cars />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/packages" element={
        <ProtectedRoute>
          <Layout user={user} setUser={setUser}>
            <Packages />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/services" element={
        <ProtectedRoute>
          <Layout user={user} setUser={setUser}>
            <ServiceRecords />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/payments" element={
        <ProtectedRoute>
          <Layout user={user} setUser={setUser}>
            <Payments />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/reports" element={
        <ProtectedRoute>
          <Layout user={user} setUser={setUser}>
            <Reports />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
