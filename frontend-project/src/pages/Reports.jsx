import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNotification } from '../components/Notification'

const Reports = () => {
  const [payments, setPayments] = useState([])
  const [dailyReport, setDailyReport] = useState({ records: [], count: 0, totalAmount: 0 })
  const [loading, setLoading] = useState(true)
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0])
  const [searchTerm, setSearchTerm] = useState('')
  const { success, error } = useNotification()

  // Fetch all payments for the report
  const fetchPayments = async () => {
    try {
      const { data } = await axios.get('/reports/payments')
      setPayments(data)
    } catch (err) {
      console.error('Error fetching payments:', err)
      error('Failed to fetch payment data')
    } finally {
      setLoading(false)
    }
  }

  // Fetch daily report
  const fetchDailyReport = async (date) => {
    setLoading(true)
    try {
      const { data } = await axios.get(`/reports/daily/${date}`)
      setDailyReport(data)
    } catch (err) {
      console.error('Error fetching daily report:', err)
      error('Failed to fetch daily report')
      setDailyReport({ date, records: [], count: 0, totalAmount: 0 })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPayments()
    fetchDailyReport(reportDate)
  }, [])

  // Handle date change
  const handleDateChange = (e) => {
    const date = e.target.value
    setReportDate(date)
    fetchDailyReport(date)
  }

  // Print report
  const handlePrintReport = () => {
    const printWindow = window.open('', '_blank')

    printWindow.document.write(`
      <html>
        <head>
          <title>SmartPark - Daily Report</title>
          <style>
            @media print {
              body { margin: 0; }
              .no-print { display: none !important; }
            }
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              background: white;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
            }
            .report-info {
              margin-bottom: 30px;
              background: #f9f9f9;
              padding: 15px;
              border-radius: 5px;
            }
            .report-info div { margin-bottom: 8px; font-size: 14px; }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            th, td {
              padding: 12px 8px;
              text-align: left;
              border: 1px solid #ddd;
            }
            th {
              background-color: #f5f5f5;
              font-weight: bold;
            }
            .total {
              font-weight: bold;
              margin: 30px 0;
              text-align: right;
              font-size: 16px;
              border-top: 2px solid #333;
              padding-top: 15px;
            }
            .signature-section {
              margin-top: 60px;
              display: flex;
              justify-content: space-between;
              page-break-inside: avoid;
            }
            .signature-box {
              width: 200px;
              text-align: center;
            }
            .signature-line {
              border-top: 1px solid #333;
              margin-top: 50px;
              padding-top: 5px;
              font-size: 12px;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              font-size: 12px;
              color: #666;
              border-top: 1px solid #ddd;
              padding-top: 15px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>SmartPark</h2>
            <p>Car Washing Sales Management System</p>
            <h3>Daily Report - ${new Date(reportDate).toLocaleDateString()}</h3>
          </div>

          <div class="report-info">
            <div><strong>Report Date:</strong> ${new Date(reportDate).toLocaleDateString()}</div>
            <div><strong>Total Services:</strong> ${dailyReport?.count || 0}</div>
            <div><strong>Total Revenue:</strong> ${dailyReport?.totalAmount?.toLocaleString() || 0} RWF</div>
            <div><strong>Generated On:</strong> ${new Date().toLocaleString()}</div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Plate Number</th>
                <th>Package</th>
                <th>Description</th>
                <th>Amount Paid (RWF)</th>
              </tr>
            </thead>
            <tbody>
              ${dailyReport?.records?.map(record => `
                <tr>
                  <td>${record.PlateNumber}</td>
                  <td>${record.PackageName}</td>
                  <td>${record.PackageDescription}</td>
                  <td>${record.AmountPaid?.toLocaleString()} RWF</td>
                </tr>
              `).join('') || '<tr><td colspan="4" style="text-align: center; padding: 20px;">No records found</td></tr>'}
            </tbody>
          </table>

          <div class="total">
            <p>Total Amount: ${dailyReport?.totalAmount?.toLocaleString() || 0} RWF</p>
          </div>

          <div class="signature-section">
            <div class="signature-box">
              <div class="signature-line">Manager Signature</div>
            </div>
            <div class="signature-box">
              <div class="signature-line">Date</div>
            </div>
          </div>

          <div class="footer">
            <p>SmartPark - Rubavu District, Western Province, Rwanda</p>
            <p>This is a computer-generated report</p>
          </div>
        </body>
      </html>
    `)

    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
  }

  // Filter payments based on search term
  const filteredPayments = payments.filter(payment =>
    payment.PlateNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.PackageName?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Reports</h1>

      {/* Daily Report Section */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="p-4 bg-amber-50 border-b border-amber-100">
          <h2 className="text-lg font-semibold text-gray-800">
            Daily Report
          </h2>
        </div>

        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center mb-6 gap-4">
            <div className="w-full md:w-1/3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Date
              </label>
              <input
                type="date"
                value={reportDate}
                onChange={handleDateChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <div className="text-sm text-blue-600 mb-1">Total Services</div>
                  <div className="text-2xl font-bold text-blue-800">{dailyReport?.count || 0}</div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <div className="text-sm text-green-600 mb-1">Total Revenue</div>
                  <div className="text-2xl font-bold text-green-800">
                    {dailyReport?.totalAmount?.toLocaleString() || 0} RWF
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <button
                    onClick={handlePrintReport}
                    className="flex items-center px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg hover:from-amber-700 hover:to-amber-800 shadow-lg transition-all duration-200 font-medium"
                  >
                    Print Report
                  </button>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading report data...</div>
          ) : !dailyReport?.records || dailyReport.records.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No payment records found for this date
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plate Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Package
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount Paid
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dailyReport.records.map((record, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-900">{record.PlateNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-900">{record.PackageName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-900">{record.PackageDescription}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-gray-900">{record.AmountPaid?.toLocaleString()} RWF</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50">
                    <td colSpan="3" className="px-6 py-4 text-right font-medium">
                      Total
                    </td>
                    <td className="px-6 py-4 text-right font-bold">
                      {dailyReport.totalAmount?.toLocaleString() || 0} RWF
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* All Payments Report Section */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 bg-amber-50 border-b border-amber-100">
          <h2 className="text-lg font-semibold text-gray-800">
            All Payments Report
          </h2>
        </div>

        <div className="p-4 border-b">
          <div className="flex items-center">
            <input
              type="text"
              placeholder="Search by plate number or package..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-4 text-center text-gray-500">Loading payment data...</div>
        ) : filteredPayments.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {searchTerm ? 'No payments match your search' : 'No payment records found'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plate Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Package
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount Paid
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments.map((payment, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900">{payment.PlateNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900">{payment.PackageName}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900">{payment.PackageDescription}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900">
                        {new Date(payment.PaymentDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-gray-900">{payment.AmountPaid?.toLocaleString()} RWF</div>
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

export default Reports
