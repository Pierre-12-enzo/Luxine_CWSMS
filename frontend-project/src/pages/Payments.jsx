import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNotification } from '../components/Notification'

const Payments = () => {
  const [payments, setPayments] = useState([])
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    amountPaid: '',
    paymentDate: new Date().toISOString().split('T')[0],
    recordNumber: ''
  })
  const [selectedBill, setSelectedBill] = useState(null)
  const [showBill, setShowBill] = useState(false)
  const { success, error } = useNotification()

  // Fetch all payments and service records
  const fetchData = async () => {
    try {
      const [paymentsRes, servicesRes] = await Promise.all([
        axios.get('/payments'),
        axios.get('/services')
      ])

      setPayments(paymentsRes.data)
      setServices(servicesRes.data)
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

  // Add keyboard shortcut for printing when bill modal is open
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (showBill && (e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault()
        handlePrintBill()
      }
    }

    if (showBill) {
      document.addEventListener('keydown', handleKeyPress)
      return () => document.removeEventListener('keydown', handleKeyPress)
    }
  }, [showBill, selectedBill])

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })

    // Auto-fill amount if service record is selected
    if (name === 'recordNumber') {
      const selectedService = services.find(s => s.RecordNumber === parseInt(value))
      if (selectedService) {
        setFormData(prev => ({
          ...prev,
          amountPaid: selectedService.PackagePrice
        }))
      }
    }
  }

  // Validate form data
  const validateForm = () => {
    // Check if all fields are filled
    if (!formData.amountPaid || !formData.paymentDate || !formData.recordNumber) {
      error('All fields are required')
      return false
    }

    // Validate amount paid (positive number only)
    const amount = parseFloat(formData.amountPaid)
    if (isNaN(amount) || amount <= 0) {
      error('Amount paid must be a positive number')
      return false
    }

    if (amount > 1000000) {
      error('Amount paid must be less than 1,000,000 RWF')
      return false
    }

    // Validate payment date (not in the future)
    const selectedDate = new Date(formData.paymentDate)
    const today = new Date()
    today.setHours(23, 59, 59, 999) // Set to end of today

    if (selectedDate > today) {
      error('Payment date cannot be in the future')
      return false
    }

    // Validate that the date is not too old (e.g., more than 1 year ago)
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

    if (selectedDate < oneYearAgo) {
      error('Payment date cannot be more than 1 year ago')
      return false
    }

    // Validate that record number exists in unpaid services
    if (!unpaidServices.some(service => service.RecordNumber.toString() === formData.recordNumber)) {
      error('Selected service record does not exist or is already paid')
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
      const response = await axios.post('/payments', formData)
      success('Payment recorded successfully')

      // Reset form and fetch updated data
      resetForm()
      fetchData()

      // Automatically show bill for the new payment
      if (response.data && response.data.paymentNumber) {
        setTimeout(() => {
          handleViewBill(formData.recordNumber)
        }, 1000)
      }
    } catch (err) {
      console.error('Error recording payment:', err)
      error(err.response?.data?.message || 'Failed to record payment')
    }
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      amountPaid: '',
      paymentDate: new Date().toISOString().split('T')[0],
      recordNumber: ''
    })
    setShowForm(false)
  }

  // View bill
  const handleViewBill = async (recordNumber) => {
    try {
      const { data } = await axios.get(`/payments/bill/${recordNumber}`)
      setSelectedBill(data)
      setShowBill(true)
    } catch (err) {
      console.error('Error fetching bill:', err)
      error('Failed to fetch bill')
    }
  }

  // Quick print function for immediate printing
  const handleQuickPrint = (recordNumber) => {
    handleViewBill(recordNumber)
    setTimeout(() => {
      handlePrintBill()
    }, 500)
  }

  // Print bill
  const handlePrintBill = () => {
    if (!selectedBill) {
      error('No bill data available for printing')
      return
    }

    const printWindow = window.open('', '_blank')

    printWindow.document.write(`
      <html>
        <head>
          <title>SmartPark - Payment Receipt</title>
          <style>
            @media print {
              body { margin: 0; }
              .no-print { display: none !important; }
            }
            body {
              font-family: 'Arial', sans-serif;
              margin: 0;
              padding: 20px;
              background: white;
              color: #333;
              line-height: 1.6;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 3px solid #2563eb;
              padding-bottom: 20px;
            }
            .header h1 {
              color: #2563eb;
              margin: 0;
              font-size: 28px;
              font-weight: bold;
            }
            .header p {
              margin: 5px 0;
              color: #64748b;
              font-size: 14px;
            }
            .header h2 {
              color: #1e293b;
              margin: 15px 0 0 0;
              font-size: 20px;
            }
            .receipt-info {
              display: flex;
              justify-content: space-between;
              margin-bottom: 30px;
              background: #f8fafc;
              padding: 15px;
              border-radius: 8px;
              border: 1px solid #e2e8f0;
            }
            .receipt-info div {
              font-size: 14px;
            }
            .receipt-info strong {
              color: #1e293b;
            }
            .section {
              margin-bottom: 25px;
              padding: 15px;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
            }
            .section h3 {
              margin: 0 0 10px 0;
              color: #1e293b;
              font-size: 16px;
              border-bottom: 1px solid #e2e8f0;
              padding-bottom: 5px;
            }
            .section-content {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 10px;
            }
            .section-content div {
              font-size: 14px;
            }
            .section-content strong {
              color: #475569;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              overflow: hidden;
            }
            th {
              background: #2563eb;
              color: white;
              padding: 12px;
              text-align: left;
              font-weight: bold;
              font-size: 14px;
            }
            td {
              padding: 12px;
              border-bottom: 1px solid #e2e8f0;
              font-size: 14px;
            }
            tr:last-child td {
              border-bottom: none;
            }
            .total-section {
              background: #10b981;
              color: white;
              padding: 20px;
              border-radius: 8px;
              text-align: center;
              margin: 30px 0;
            }
            .total-section h3 {
              margin: 0 0 10px 0;
              font-size: 18px;
            }
            .total-amount {
              font-size: 32px;
              font-weight: bold;
              margin: 0;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              font-size: 12px;
              color: #64748b;
              border-top: 1px solid #e2e8f0;
              padding-top: 20px;
            }
            .footer p {
              margin: 5px 0;
            }
            .thank-you {
              font-size: 16px;
              color: #2563eb;
              font-weight: bold;
              margin-bottom: 10px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>SmartPark</h1>
            <p>Car Washing Sales Management System</p>
            <h2>Payment Receipt</h2>
          </div>

          <div class="receipt-info">
            <div>
              <strong>Receipt #:</strong> ${selectedBill.PaymentNumber || 'N/A'}<br>
              <strong>Date:</strong> ${new Date(selectedBill.PaymentDate).toLocaleDateString() || new Date().toLocaleDateString()}
            </div>
            <div style="text-align: right;">
              <strong>Time:</strong> ${new Date().toLocaleTimeString()}<br>
              <strong>Status:</strong> <span style="color: #10b981;">PAID</span>
            </div>
          </div>

          <div class="section">
            <h3>Customer & Vehicle Information</h3>
            <div class="section-content">
              <div><strong>Car Plate:</strong> ${selectedBill.PlateNumber}</div>
              <div><strong>Driver Name:</strong> ${selectedBill.DriverName}</div>
              <div><strong>Phone Number:</strong> ${selectedBill.PhoneNumber}</div>
              <div><strong>Car Type:</strong> ${selectedBill.CarType || 'N/A'}</div>
            </div>
          </div>

          <div class="section">
            <h3>Service Details</h3>
            <table>
              <thead>
                <tr>
                  <th>Service Package</th>
                  <th>Description</th>
                  <th style="text-align: right;">Price (RWF)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>${selectedBill.PackageName}</strong></td>
                  <td>${selectedBill.PackageDescription}</td>
                  <td style="text-align: right;"><strong>${selectedBill.PackagePrice?.toLocaleString()} RWF</strong></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="total-section">
            <h3>Total Amount Paid</h3>
            <p class="total-amount">${selectedBill.AmountPaid?.toLocaleString()} RWF</p>
          </div>

          <div class="footer">
            <p class="thank-you">Thank you for choosing SmartPark!</p>
            <p><strong>SmartPark Car Washing Services</strong></p>
            <p>Rubavu District, Western Province, Rwanda</p>
            <p>Phone: +250 XXX XXX XXX | Email: info@smartpark.rw</p>
            <p style="margin-top: 15px; font-style: italic;">This is a computer-generated receipt. No signature required.</p>
          </div>
        </body>
      </html>
    `)

    printWindow.document.close()
    printWindow.focus()

    // Add a small delay to ensure content is loaded before printing
    setTimeout(() => {
      printWindow.print()
      // Close the print window after printing (optional)
      // printWindow.close()
    }, 250)
  }

  // Filter payments based on search term
  const filteredPayments = payments.filter(payment =>
    payment.PlateNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.DriverName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.PackageName?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Get unpaid services (services without payments)
  const unpaidServices = services.filter(service =>
    !payments.some(payment => payment.RecordNumber === service.RecordNumber)
  )

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800">Payments</h1>
        <button
          onClick={() => {
            resetForm()
            setShowForm(!showForm)
          }}
          className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 shadow-lg transition-all duration-200 font-medium"
        >
          {showForm ? 'Cancel' : 'Record New Payment'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-lg mb-6 border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Record New Payment</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Service Record
                </label>
                <select
                  name="recordNumber"
                  value={formData.recordNumber}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                >
                  <option value="">Select Service Record</option>
                  {unpaidServices.map(service => (
                    <option key={service.RecordNumber} value={service.RecordNumber}>
                      #{service.RecordNumber} - {service.PlateNumber} - {service.PackageName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Payment Date
                </label>
                <input
                  type="date"
                  name="paymentDate"
                  value={formData.paymentDate}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Amount Paid (RWF)
                </label>
                <input
                  type="number"
                  name="amountPaid"
                  value={formData.amountPaid}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  placeholder="e.g., 5000"
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
                className="px-6 py-3 text-white bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg hover:from-purple-700 hover:to-purple-800 shadow-lg transition-all duration-200 font-medium"
              >
                Record Payment
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bill Modal */}
      {showBill && selectedBill && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setShowBill(false)}>
              <div className="absolute inset-0 bg-slate-900 opacity-20"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full border border-slate-200">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200">
                      <h3 className="text-2xl font-bold text-slate-800">
                        Payment Receipt
                      </h3>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={handlePrintBill}
                          className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-lg transition-all duration-200 font-medium"
                        >
                          Print Bill
                        </button>
                        <span className="text-xs text-slate-500">Ctrl+P</span>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="bg-slate-50 p-4 rounded-lg">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-slate-600">Receipt #</p>
                            <p className="text-lg font-bold text-slate-800">{selectedBill.PaymentNumber || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-600">Date</p>
                            <p className="text-lg font-bold text-slate-800">{new Date(selectedBill.PaymentDate).toLocaleDateString() || 'N/A'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h4 className="text-lg font-bold text-blue-800 mb-3">Car Details</h4>
                        <div className="space-y-2">
                          <p className="text-sm"><span className="font-medium text-blue-700">Plate:</span> <span className="text-slate-800">{selectedBill.PlateNumber}</span></p>
                          <p className="text-sm"><span className="font-medium text-blue-700">Driver:</span> <span className="text-slate-800">{selectedBill.DriverName}</span></p>
                          <p className="text-sm"><span className="font-medium text-blue-700">Phone:</span> <span className="text-slate-800">{selectedBill.PhoneNumber}</span></p>
                        </div>
                      </div>

                      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                        <h4 className="text-lg font-bold text-purple-800 mb-3">Service Details</h4>
                        <div className="space-y-2">
                          <p className="text-sm"><span className="font-medium text-purple-700">Package:</span> <span className="text-slate-800">{selectedBill.PackageName}</span></p>
                          <p className="text-sm"><span className="font-medium text-purple-700">Description:</span> <span className="text-slate-800">{selectedBill.PackageDescription}</span></p>
                          <p className="text-sm"><span className="font-medium text-purple-700">Price:</span> <span className="text-slate-800">{selectedBill.PackagePrice?.toLocaleString()} RWF</span></p>
                        </div>
                      </div>

                      <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                        <h4 className="text-lg font-bold text-emerald-800 mb-3">Payment Summary</h4>
                        <div className="text-center">
                          <p className="text-sm font-medium text-emerald-700">Total Amount Paid</p>
                          <p className="text-3xl font-bold text-emerald-800">{selectedBill.AmountPaid?.toLocaleString()} RWF</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 px-6 py-4 sm:flex sm:flex-row-reverse sm:space-x-reverse sm:space-x-3">
                <button
                  type="button"
                  onClick={() => setShowBill(false)}
                  className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-lg px-6 py-3 bg-gradient-to-r from-slate-600 to-slate-700 text-base font-medium text-white hover:from-slate-700 hover:to-slate-800 focus:outline-none sm:ml-3 sm:w-auto transition-all duration-200"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handlePrintBill}
                  className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-lg px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-base font-medium text-white hover:from-blue-700 hover:to-blue-800 focus:outline-none sm:w-auto transition-all duration-200 mb-3 sm:mb-0"
                >
                  Print Bill
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
        <div className="p-4 border-b">
          <div className="flex items-center">
            <input
              type="text"
              placeholder="Search by plate number, driver name or package..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-4 text-center text-gray-500">Loading payments...</div>
        ) : filteredPayments.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {searchTerm ? 'No payments match your search' : 'No payments recorded yet'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-purple-600">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">
                    Payment #
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
                    Amount
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-purple-200 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-700 divide-y divide-purple-600">
                {filteredPayments.map((payment) => (
                  <tr key={payment.PaymentNumber} className="hover:bg-gray-600">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-white">{payment.PaymentNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-white">
                        {new Date(payment.PaymentDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-white">{payment.PlateNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-white">{payment.DriverName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-white">{payment.PackageName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-white">{payment.AmountPaid?.toLocaleString()} RWF</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">

                        <button
                          onClick={() => handleQuickPrint(payment.RecordNumber)}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                        >
                          Print Bill
                        </button>
                      </div>
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

export default Payments
