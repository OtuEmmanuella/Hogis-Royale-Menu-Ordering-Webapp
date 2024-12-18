
import React, { useState, useEffect, useMemo } from 'react'
import { db } from '../Firebase/FirebaseConfig'
import {  Link } from 'react-router-dom';
import { collection, query, orderBy, getDocs } from 'firebase/firestore'
import { formatDistanceToNow, format } from 'date-fns'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js'
import {  Bar } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title)

export default function CustomerInquiriesPage() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [filterBranch, setFilterBranch] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const inquiriesRef = collection(db, 'customerInquiries')
        const feedbacksRef = collection(db, 'feedbacks')
        const inquiriesQuery = query(inquiriesRef, orderBy('createdAt', 'desc'))
        const feedbacksQuery = query(feedbacksRef, orderBy('createdAt', 'desc'))

        const [inquiriesSnapshot, feedbacksSnapshot] = await Promise.all([
          getDocs(inquiriesQuery),
          getDocs(feedbacksQuery)
        ])

        const inquiriesData = inquiriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'inquiry' }))
        const feedbacksData = feedbacksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'feedback' }))

        setData([...inquiriesData, ...feedbacksData].sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate()))
        setLoading(false)
      } catch (error) {
        console.error("Error fetching data:", error)
        setError("An error occurred while fetching data. Please try again later.")
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const renderStatus = (status) => {
    const statusClasses = {
      resolved: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      default: 'bg-red-100 text-red-800'
    }
    return `px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses[status] || statusClasses.default}`
  }

  const renderRating = (rating) => {
    const emojis = ['☹️', '😐', '🙂', '😊', '😄']
    return emojis[rating - 1] || '❓'
  }

  const formatDate = (date) => {
    const now = new Date()
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))

    let relativeTime
    if (diffInDays === 0) {
      relativeTime = 'Today'
    } else if (diffInDays === 1) {
      relativeTime = 'Yesterday'
    } else {
      relativeTime = formatDistanceToNow(date, { addSuffix: true })
    }

    const timeString = date.toLocaleString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    })

    const fullDate = format(date, 'MMMM d, yyyy')

    return `${relativeTime} (${fullDate}) at ${timeString}`
  }

  const filteredData = useMemo(() => {
    return data.filter(item => 
      (filterBranch === '' || item.branch === filterBranch) &&
      (searchTerm === '' || 
        item.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.comment?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
  }, [data, filterBranch, searchTerm])

  const paginatedData = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    return filteredData.slice(indexOfFirstItem, indexOfLastItem)
  }, [filteredData, currentPage, itemsPerPage])

  const pageNumbers = useMemo(() => {
    const totalPages = Math.ceil(filteredData.length / itemsPerPage)
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }, [filteredData.length, itemsPerPage])

  const dataInsights = useMemo(() => {
    const totalFeedbacks = filteredData.filter(item => item.type === 'feedback').length
    const feedbacksByBranch = filteredData.reduce((acc, item) => {
      if (item.type === 'feedback' && item.branch) {
        acc[item.branch] = (acc[item.branch] || 0) + 1
      }
      return acc
    }, {})

    return {
      totalFeedbacks,
      feedbacksByBranch,
    }
  }, [filteredData])

  const pieChartData = useMemo(() => ({
    labels: Object.keys(dataInsights.feedbacksByBranch),
    datasets: [
      {
        data: Object.values(dataInsights.feedbacksByBranch),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
      },
    ],
  }), [dataInsights])

  const barChartData = useMemo(() => ({
    labels: Object.keys(dataInsights.feedbacksByBranch),
    datasets: [
      {
        label: 'Feedbacks per Branch',
        data: Object.values(dataInsights.feedbacksByBranch),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  }), [dataInsights])

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Customer Feedback Insights',
      },
    },
  }

  if (error) {
    return (
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Customer Feedback and Inquiries</h1>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Customer Feedback and Inquiries Dashboard</h1>
        </div>
        {loading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-300 mx-auto"></div>
            <p className="mt-2">Loading data...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="p-4 rounded-lg shadow bg-gray-800">
                <h2 className="text-lg font-semibold mb-2">Total Feedbacks</h2>
                <p className="text-3xl font-bold text-blue-400">{dataInsights.totalFeedbacks}</p>
              </div>
              <div className="p-4 rounded-lg shadow bg-gray-800">
                <h2 className="text-lg font-semibold mb-2">Feedbacks per Branch</h2>
                <div className="w-full h-64">
                  <Bar data={barChartData} options={barChartOptions} />
                </div>
              </div>
            </div>
            <div className="mb-4 flex flex-wrap gap-4">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="p-2 border rounded bg-gray-700 text-white"
              />
              <select
                value={filterBranch}
                onChange={(e) => setFilterBranch(e.target.value)}
                className="p-2 border rounded bg-gray-700 text-white"
              >
                <option value="">All Branches</option>
                {Object.keys(dataInsights.feedbacksByBranch).map((branch) => (
                  <option key={branch} value={branch}>{branch}</option>
                ))}
              </select>
            </div>
            <div className="shadow overflow-hidden sm:rounded-lg bg-gray-800">
              <ul className="divide-y divide-gray-700">
                {paginatedData.map((item) => (
                  <li key={item.id} className="hover:bg-gray-700 hover:bg-opacity-10 transition-colors duration-150 ease-in-out">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <p className="text-sm font-medium truncate text-blue-400">
                            {item.subject || 'Feedback'}
                          </p>
                          {item.branch && (
                            <p className="text-xs mt-1">
                              Branch: {item.branch}
                            </p>
                          )}
                        </div>
                        <div className="ml-2 flex-shrink-0 flex">
                          {item.status ? (
                            <p className={renderStatus(item.status)}>{item.status}</p>
                          ) : (
                            <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              Feedback
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex flex-col">
                          <p className="flex items-center text-sm">
                            {item.customerName || item.name}
                          </p>
                          <p className="mt-2 flex items-center text-sm">
                            {item.email}
                          </p>
                          <p className="mt-2 flex items-center text-sm">
                            {formatDate(item.createdAt.toDate())}
                          </p>
                        </div>
                        {item.rating && (
                          <p className="mt-2 flex items-center text-sm sm:mt-0">
                            Rating: {renderRating(item.rating)} ({item.rating}/5)
                          </p>
                        )}
                      </div>
                      <p className="mt-2 text-sm">{item.message || item.comment}</p>
                      {item.suggestions && (
                        <p className="mt-1 text-sm">
                          Suggestions: {item.suggestions.join(', ')}
                        </p>
                      )}
                      {item.photoURLs && item.photoURLs.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {item.photoURLs.map((url, index) => (
                            <img
                              key={index}
                              src={url}
                              alt={`Feedback ${index + 1}`}
                              className="max-w-full h-auto rounded-lg shadow-md"
                              style={{ maxHeight: '200px', maxWidth: '200px' }}
                              onError={(e) => {
                                console.error("Image failed to load:", e.target.src)
                                e.target.src = "https://via.placeholder.com/200x150?text=Image+Not+Found"
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-4 flex justify-center">
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                {pageNumbers.map((number) => (
                  <button
                    key={number}
                    onClick={() => setCurrentPage(number)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      currentPage === number
                        ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                        : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {number}
                  </button>
                ))}
              </nav>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

