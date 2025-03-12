'use client'
import { useEffect, useState } from "react"
import TimeSlotGrid from "./TimeSlotGrid"
import { generateDateRange, formatDate } from "../../utils/dateUtils"
import axios from "axios"

function AvailabilityCalendar() {
  const token = localStorage.getItem("token")

  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date()
    // Set to the beginning of the current week (Sunday)
    const dayOfWeek = today.getDay()
    const diff = today.getDate() - dayOfWeek
    return new Date(today.setDate(diff))
  })

  const [selectedSlots, setSelectedSlots] = useState({})
  const [showToast, setShowToast] = useState(false)

  // Generate the dates for the current week view
  const dates = generateDateRange(currentWeekStart, 7)

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/schedule/schedules/doctor`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        console.log("API Response:", response.data)

        const { data } = response
        const fetchedSlots = {}

        data.forEach(schedule => {
          schedule.availableSlots.forEach(slot => {
            // Chuyển date từ ISO về định dạng YYYY-MM-DD
            const dateKey = new Date(slot.date).toISOString().split("T")[0]
            const dateTimeKey = `${dateKey}-${slot.time.replace(":", "-")}`
            fetchedSlots[dateTimeKey] = !slot.isBooked // Chỉ hiển thị nếu chưa bị đặt
          })
        })

        setSelectedSlots(fetchedSlots) // Cập nhật state với dữ liệu từ API
      } catch (error) {
        console.error("Failed to fetch schedule:", error)
      }
    }

    fetchSchedule()
  }, [token])

  const handlePreviousWeek = () => {
    const newDate = new Date(currentWeekStart)
    newDate.setDate(newDate.getDate() - 7)
    setCurrentWeekStart(newDate)
  }

  const handleNextWeek = () => {
    const newDate = new Date(currentWeekStart)
    newDate.setDate(newDate.getDate() + 7)
    setCurrentWeekStart(newDate)
  }

  const toggleTimeSlot = (dateTimeKey) => {
    setSelectedSlots((prev) => ({
      ...prev,
      [dateTimeKey]: !prev[dateTimeKey],
    }))
  }

  const availableSlots = Object.keys(selectedSlots)
    .filter((key) => selectedSlots[key])
    .map((dateTimeKey) => {
      const dateParts = dateTimeKey.split("-")
      const date = dateParts.slice(0, 3).join("-")
      const hour = dateParts[3].padStart(2, "0")
      const minute = dateParts[4].padStart(2, "0")

      return { date, time: `${hour}:${minute}` }
    })

  const handleSave = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8080/schedule/upsert",
        { availableSlots },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      console.log("Availability saved:", response.data)
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    } catch (error) {
      console.error("Failed to save availability:", error)
    }
  }

  return (
    <div className="calendar-card">
      <div className="calendar-header">
        <button className="nav-button" onClick={handlePreviousWeek}>
          ← Previous
        </button>

        <h2 className="date-range">
          {formatDate(dates[0])} - {formatDate(dates[dates.length - 1])}
        </h2>

        <button className="nav-button" onClick={handleNextWeek}>
          Next →
        </button>
      </div>

      <TimeSlotGrid dates={dates} selectedSlots={selectedSlots} onToggleTimeSlot={toggleTimeSlot} />

      <div className="save-container">
        <button onClick={handleSave} className="save-button">
          Save Availability
        </button>
      </div>

      {showToast && (
        <div className="toast">
          <p>Availability saved successfully!</p>
        </div>
      )}
    </div>
  )
}

export default AvailabilityCalendar;
