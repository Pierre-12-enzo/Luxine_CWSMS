import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNotification } from '../components/Notification'

const Cars = () => {
  const [cars, setCars] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    plateNumber: '',
    carType: '',
    carSize: '',
    driverName: '',
    phoneNumber: ''
  })
  const [isEditing, setIsEditing] = useState(false)
  const [plateError, setPlateError] = useState('')
  const { success, error } = useNotification()

  // Fetch all cars
  const fetchCars = async () => {
    try {
      const { data } = await axios.get('/cars')
      setCars(data)
    } catch (err) {
      console.error('Error fetching cars:', err)
      error('Failed to fetch cars')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCars()
  }, [])

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })

    // Real-time validation for plate number
    if (name === 'plateNumber' && !isEditing) {
      if (value && checkDuplicatePlate(value)) {
        setPlateError('Car with this plate number already exists')
      } else {
        setPlateError('')
      }
    }
  }

  // Check for duplicate plate number
  const checkDuplicatePlate = (plateNumber) => {
    return cars.some(car => car.PlateNumber.toLowerCase() === plateNumber.toLowerCase())
  }

  // Validate form data
  const validateForm = () => {
    // Check if all fields are filled
    if (!formData.plateNumber || !formData.carType || !formData.carSize || !formData.driverName || !formData.phoneNumber) {
      error('All fields are required')
      return false
    }

    // Validate plate number format (letters and numbers only, 6-8 characters)
    const plateRegex = /^[A-Za-z0-9]{6,8}$/
    if (!plateRegex.test(formData.plateNumber)) {
      error('Plate number must be 6-8 characters long and contain only letters and numbers')
      return false
    }

    // Validate driver name (letters and spaces only)
    const nameRegex = /^[a-zA-Z\s]+$/
    if (!nameRegex.test(formData.driverName.trim())) {
      error('Driver name must contain only letters and spaces')
      return false
    }

    if (formData.driverName.trim().length < 2) {
      error('Driver name must be at least 2 characters long')
      return false
    }

    // Validate phone number (digits only, 10-15 characters)
    const phoneRegex = /^[0-9]{10,15}$/
    if (!phoneRegex.test(formData.phoneNumber)) {
      error('Phone number must be 10-15 digits long and contain only numbers')
      return false
    }

    // Validate car type (letters and spaces only)
    if (!nameRegex.test(formData.carType.trim())) {
      error('Car type must contain only letters and spaces')
      return false
    }

    // Validate car size
    const validSizes = ['Small', 'Medium', 'Large']
    if (!validSizes.includes(formData.carSize)) {
      error('Please select a valid car size')
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
        await axios.put(`/cars/${formData.plateNumber}`, formData)
        success('Car updated successfully')
      } else {
        // Check for duplicate plate number before submitting
        if (checkDuplicatePlate(formData.plateNumber)) {
          error('Car with this plate number already exists')
          return
        }

        await axios.post('/cars', formData)
        success('Car added successfully')
      }

      // Reset form and fetch updated cars
      resetForm()
      fetchCars()
    } catch (err) {
      console.error('Error saving car:', err)
      error(err.response?.data?.message || 'Failed to save car')
    }
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      plateNumber: '',
      carType: '',
      carSize: '',
      driverName: '',
      phoneNumber: ''
    })
    setIsEditing(false)
    setPlateError('')
    setShowForm(false)
  }

  // Edit car
  const handleEdit = (car) => {
    setFormData({
      plateNumber: car.PlateNumber,
      carType: car.CarType,
      carSize: car.CarSize,
      driverName: car.DriverName,
      phoneNumber: car.PhoneNumber
    })
    setIsEditing(true)
    setPlateError('')
    setShowForm(true)
  }

  // Delete car
  const handleDelete = async (plateNumber) => {
    if (!confirm('Are you sure you want to delete this car?')) {
      return
    }

    try {
      await axios.delete(`/cars/${plateNumber}`)
      success('Car deleted successfully')
      fetchCars()
    } catch (err) {
      console.error('Error deleting car:', err)
      error(err.response?.data?.message || 'Failed to delete car')
    }
  }

  // Filter cars based on search term
  const filteredCars = cars.filter(car =>
    car.PlateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    car.DriverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    car.CarType.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800">Cars</h1>
        <button
          onClick={() => {
            resetForm()
            setShowForm(!showForm)
          }}
          className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-lg transition-all duration-200 font-medium"
        >
          {showForm ? 'Cancel' : 'Add New Car'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-lg mb-6 border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-6">{isEditing ? 'Edit Car' : 'Add New Car'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plate Number
                </label>
                <input
                  type="text"
                  name="plateNumber"
                  value={formData.plateNumber}
                  onChange={handleChange}
                  disabled={isEditing}
                  required
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                    plateError
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                      : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  placeholder="e.g., RAA123A"
                />
                {plateError && (
                  <p className="mt-1 text-sm text-red-600">{plateError}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Car Type
                </label>
                <input
                  type="text"
                  name="carType"
                  value={formData.carType}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., Sedan, SUV"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Car Size
                </label>
                <select
                  name="carSize"
                  value={formData.carSize}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select Size</option>
                  <option value="Small">Small</option>
                  <option value="Medium">Medium</option>
                  <option value="Large">Large</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Driver Name
                </label>
                <input
                  type="text"
                  name="driverName"
                  value={formData.driverName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Driver's full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., 078XXXXXXX"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={plateError}
                className={`px-6 py-3 text-white rounded-lg shadow-lg transition-all duration-200 font-medium ${
                  plateError
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
                }`}
              >
                {isEditing ? 'Update Car' : 'Add Car'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
        <div className="p-4 border-b">
          <div className="flex items-center">
            <input
              type="text"
              placeholder="Search cars by plate number, driver name or car type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-4 text-center text-gray-500">Loading cars...</div>
        ) : filteredCars.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {searchTerm ? 'No cars match your search' : 'No cars registered yet'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-purple-600">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">
                    Plate Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">
                    Car Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">
                    Driver
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">
                    Phone
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-700 divide-y divide-purple-600">
                {filteredCars.map((car) => (
                  <tr key={car.PlateNumber} className="hover:bg-gray-600">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-white">{car.PlateNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-white">{car.CarType}</div>
                      <div className="text-purple-300 text-sm">{car.CarSize}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-white">{car.DriverName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-white">{car.PhoneNumber}</div>
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

export default Cars
