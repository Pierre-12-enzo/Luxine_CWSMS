import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNotification } from '../components/Notification'

const ServiceRecords = () => {
  const [services, setServices] = useState([])
  const [cars, setCars] = useState([])
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    serviceDate: new Date().toISOString().split('T')[0],
    plateNumber: '',
    packageNumber: ''
  })
  const [isEditing, setIsEditing] = useState(false)
  const [editId, setEditId] = useState(null)
  const { success, error } = useNotification()

  // Fetch all service records, cars, and packages
  const fetchData = async () => {
    try {
      const [servicesRes, carsRes, packagesRes] = await Promise.all([
        axios.get('/services'),
        axios.get('/cars'),
        axios.get('/packages')
      ])

      setServices(servicesRes.data)
      setCars(carsRes.data)
      setPackages(packagesRes.data)
    } catch (err) {
      console.error('Error fetching data:', err)
      error('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  // Validate form data
  const validateForm = () => {
    // Check if all fields are filled
    if (!formData.serviceDate || !formData.plateNumber || !formData.packageNumber) {
      error('All fields are required')
      return false
    }

    // Validate service date (not in the future)
    const selectedDate = new Date(formData.serviceDate)
    const today = new Date()
    today.setHours(23, 59, 59, 999) // Set to end of today

    if (selectedDate > today) {
      error('Service date cannot be in the future')
      return false
    }

    // Validate that the date is not too old (e.g., more than 1 year ago)
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

    if (selectedDate < oneYearAgo) {
      error('Service date cannot be more than 1 year ago')
      return false
    }

    // Validate that plate number exists in cars
    if (!cars.some(car => car.PlateNumber === formData.plateNumber)) {
      error('Selected car does not exist')
      return false
    }

    // Validate that package exists
    if (!packages.some(pkg => pkg.PackageNumber.toString() === formData.packageNumber)) {
      error('Selected package does not exist')
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
      if (isEditing) {
        await axios.put(`/services/${editId}`, formData)
        success('Service record updated successfully')
      } else {
        await axios.post('/services', formData)
        success('Service record added successfully')
      }

      // Reset form and fetch updated data
      resetForm()
      fetchData()
    } catch (err) {
      console.error('Error saving service record:', err)
      error(err.response?.data?.message || 'Failed to save service record')
    }
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      serviceDate: new Date().toISOString().split('T')[0],
      plateNumber: '',
      packageNumber: ''
    })
    setIsEditing(false)
    setEditId(null)
    setShowForm(false)
  }

  // Edit service record
  const handleEdit = (service) => {
    setFormData({
      serviceDate: service.ServiceDate.split('T')[0],
      plateNumber: service.PlateNumber,
      packageNumber: service.PackageNumber
    })
    setIsEditing(true)
    setEditId(service.RecordNumber)
    setShowForm(true)
  }

  // Delete service record
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this service record?')) {
      return
    }

    try {
      await axios.delete(`/services/${id}`)
      success('Service record deleted successfully')
      fetchData()
    } catch (err) {
      console.error('Error deleting service record:', err)
      error(err.response?.data?.message || 'Failed to delete service record')
    }
  }

  // Filter services based on search term
  const filteredServices = services.filter(service =>
    service.PlateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.DriverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.PackageName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800">Service Records</h1>
        <button
          onClick={() => {
            resetForm()
            setShowForm(!showForm)
          }}
          className="flex items-center px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg hover:from-amber-700 hover:to-amber-800 shadow-lg transition-all duration-200 font-medium"
        >
          {showForm ? 'Cancel' : 'Add New Service Record'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-lg font-semibold mb-4">
            {isEditing ? 'Edit Service Record' : 'Add New Service Record'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Date
                </label>
                <input
                  type="date"
                  name="serviceDate"
                  value={formData.serviceDate}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Car
                </label>
                <select
                  name="plateNumber"
                  value={formData.plateNumber}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value="">Select Car</option>
                  {cars.map(car => (
                    <option key={car.PlateNumber} value={car.PlateNumber}>
                      {car.PlateNumber} - {car.DriverName} ({car.CarType})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Package
                </label>
                <select
                  name="packageNumber"
                  value={formData.packageNumber}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value="">Select Package</option>
                  {packages.map(pkg => (
                    <option key={pkg.PackageNumber} value={pkg.PackageNumber}>
                      {pkg.PackageName} - {pkg.PackagePrice} RWF
                    </option>
                  ))}
                </select>
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
                className="px-4 py-2 text-white bg-amber-600 rounded-md hover:bg-amber-700"
              >
                {isEditing ? 'Update Record' : 'Add Record'}
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
              placeholder="Search by plate number, driver name or package..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-4 text-center text-gray-500">Loading service records...</div>
        ) : filteredServices.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {searchTerm ? 'No records match your search' : 'No service records available yet'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-purple-600">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">
                    Record #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">
                    Car
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">
                    Driver
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">
                    Package
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-purple-200 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-700 divide-y divide-purple-600">
                {filteredServices.map((service) => (
                  <tr key={service.RecordNumber} className="hover:bg-gray-600">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-white">{service.RecordNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-white">
                        {new Date(service.ServiceDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-white">{service.PlateNumber}</div>
                      <div className="text-purple-300 text-sm">{service.CarType}, {service.CarSize}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-white">{service.DriverName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-white">{service.PackageName}</div>
                      <div className="text-purple-300 text-sm">{service.PackageDescription}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-white">{service.PackagePrice.toLocaleString()} RWF</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(service)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm mr-2 font-medium transition-all duration-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(service.RecordNumber)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                      >
                        Delete
                      </button>
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

export default ServiceRecords
