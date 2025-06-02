import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    // Clear error when user starts typing
    if (error) setError('')
  }

  const validateForm = () => {
    // Check if all fields are filled
    if (!formData.username || !formData.password || !formData.confirmPassword || !formData.fullName) {
      setError('All fields are required')
      return false
    }

    // Validate full name (letters and spaces only)
    const nameRegex = /^[a-zA-Z\s]+$/
    if (!nameRegex.test(formData.fullName.trim())) {
      setError('Full name must contain only letters and spaces')
      return false
    }

    if (formData.fullName.trim().length < 2) {
      setError('Full name must be at least 2 characters long')
      return false
    }

    // Validate username (letters only, 3-20 characters)
    const usernameRegex = /^[a-zA-Z]+$/
    if (!usernameRegex.test(formData.username)) {
      setError('Username must contain only letters')
      return false
    }

    if (formData.username.length < 3 || formData.username.length > 20) {
      setError('Username must be between 3 and 20 characters long')
      return false
    }

    // Validate password strength
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return false
    }

    if (formData.password.length > 50) {
      setError('Password must be less than 50 characters long')
      return false
    }

    // Check if password contains at least one letter and one number
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)/
    if (!passwordRegex.test(formData.password)) {
      setError('Password must contain at least one letter and one number')
      return false
    }

    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validate form
    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const { data } = await axios.post('/auth/register', {
        username: formData.username,
        password: formData.password,
        fullName: formData.fullName
      })
      
      setSuccess('Registration successful! Redirecting to login...')
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (error) {
      console.error('Registration error:', error)
      setError(error.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 p-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-800 p-8 rounded-lg shadow-xl border border-purple-600">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">SP</span>
            </div>
            <h1 className="text-3xl font-extrabold text-purple-400">SmartPark</h1>
            <p className="mt-2 text-purple-300 font-medium">Car Washing Sales Management System</p>
            <h2 className="mt-4 text-xl font-bold text-white">Create Account</h2>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-purple-200 mb-2">
                  Full Name
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="block w-full px-4 py-3 bg-gray-700 border border-purple-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-purple-200 mb-2">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="block w-full px-4 py-3 bg-gray-700 border border-purple-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                  placeholder="Choose a username"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-purple-200 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="block w-full px-4 py-3 bg-gray-700 border border-purple-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                  placeholder="Enter your password (min 6 characters)"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-purple-200 mb-2">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="block w-full px-4 py-3 bg-gray-700 border border-purple-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                  placeholder="Confirm your password"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 text-sm text-red-400 bg-red-900 border border-red-600 rounded-lg">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 text-sm text-green-400 bg-green-900 border border-green-600 rounded-lg">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creating Account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>

            <div className="text-center pt-4">
              <p className="text-sm text-purple-300">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-medium text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Register
