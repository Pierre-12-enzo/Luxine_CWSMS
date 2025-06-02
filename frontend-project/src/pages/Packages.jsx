import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNotification } from '../components/Notification'

const Packages = () => {
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    packageName: '',
    packageDescription: '',
    packagePrice: ''
  })
  const { success, error } = useNotification()

  // Fetch all packages
  const fetchPackages = async () => {
    try {
      const { data } = await axios.get('/packages')
      setPackages(data)
    } catch (err) {
      console.error('Error fetching packages:', err)
      error('Failed to fetch packages')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPackages()
  }, [])

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  // Validate form data
  const validateForm = () => {
    // Check if all fields are filled
    if (!formData.packageName || !formData.packageDescription || !formData.packagePrice) {
      error('All fields are required')
      return false
    }

    // Validate package name (letters, numbers, and spaces only)
    const nameRegex = /^[a-zA-Z0-9\s]+$/
    if (!nameRegex.test(formData.packageName.trim())) {
      error('Package name must contain only letters, numbers, and spaces')
      return false
    }

    if (formData.packageName.trim().length < 2) {
      error('Package name must be at least 2 characters long')
      return false
    }

    // Validate description length
    if (formData.packageDescription.trim().length < 10) {
      error('Package description must be at least 10 characters long')
      return false
    }

    if (formData.packageDescription.trim().length > 500) {
      error('Package description must be less than 500 characters long')
      return false
    }

    // Validate price (positive number only)
    const price = parseFloat(formData.packagePrice)
    if (isNaN(price) || price <= 0) {
      error('Package price must be a positive number')
      return false
    }

    if (price > 1000000) {
      error('Package price must be less than 1,000,000 RWF')
      return false
    }

    return true
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate form
    if (!validateForm()) {
      return
    }

    try {
      await axios.post('/packages', formData)
      success('Package added successfully')

      // Reset form and fetch updated packages
      resetForm()
      fetchPackages()
    } catch (err) {
      console.error('Error saving package:', err)
      error(err.response?.data?.message || 'Failed to save package')
    }
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      packageName: '',
      packageDescription: '',
      packagePrice: ''
    })
    setShowForm(false)
  }

  // Filter packages based on search term
  const filteredPackages = packages.filter(pkg =>
    pkg.PackageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.PackageDescription.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800">Service Packages</h1>
        <button
          onClick={() => {
            resetForm()
            setShowForm(!showForm)
          }}
          className="flex items-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-800 shadow-lg transition-all duration-200 font-medium"
        >
          {showForm ? 'Cancel' : 'Add New Package'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-lg mb-6 border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Add New Package</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Package Name
                </label>
                <input
                  type="text"
                  name="packageName"
                  value={formData.packageName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., Basic Wash"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (RWF)
                </label>
                <input
                  type="number"
                  name="packagePrice"
                  value={formData.packagePrice}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., 5000"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="packageDescription"
                  value={formData.packageDescription}
                  onChange={handleChange}
                  required
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Describe the package..."
                ></textarea>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 mr-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 text-white bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-lg hover:from-emerald-700 hover:to-emerald-800 shadow-lg transition-all duration-200 font-medium"
              >
                Add Package
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b">
          <div className="flex items-center">
            <input
              type="text"
              placeholder="Search packages by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-4 text-center text-gray-500">Loading packages...</div>
        ) : filteredPackages.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {searchTerm ? 'No packages match your search' : 'No packages available yet'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-purple-600">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">
                    Package ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">
                    Price (RWF)
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-purple-200 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-700 divide-y divide-purple-600">
                {filteredPackages.map((pkg) => (
                  <tr key={pkg.PackageNumber} className="hover:bg-gray-600">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-white">{pkg.PackageNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-white">{pkg.PackageName}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white">{pkg.PackageDescription}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-white">{pkg.PackagePrice.toLocaleString()} RWF</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <span className="text-purple-300 text-sm">View Only</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Packages
