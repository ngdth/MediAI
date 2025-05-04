'use client'
import { useEffect, useState } from "react"
import TimeSlotGrid from "./TimeSlotGrid"
import { generateDateRange, formatDate } from "../../utils/dateUtils"
import axios from "axios"
import { toast } from "react-toastify"

const AvailabilitySchedule = () => {
  const token = localStorage.getItem("token")
  const [selectedSlots, setSelectedSlots] = useState({})

  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date()
    // Set to the beginning of the current week (Sunday)
    const dayOfWeek = today.getDay()
    const diff = today.getDate() - dayOfWeek
    return new Date(today.setDate(diff))
  })

  // Generate the dates for the current week view
  const dates = generateDateRange(currentWeekStart, 7)

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/schedule/token`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        console.log("API Response:", response.data)

        const { data } = response
        const fetchedSlots = {}

        data.forEach(schedule => {
          schedule.availableSlots.forEach(slot => {
            // Chuyển date từ ISO về định dạng YYYY-MM-DD
            const dateKey = slot.date.split("T")[0]; // Giữ đúng YYYY-MM-DD
            const [hour, minute] = slot.time.split(":");
            const dateTimeKey = `${dateKey}-${parseInt(hour)}-${parseInt(minute)}`;
            fetchedSlots[dateTimeKey] = {
              isAvailable: !slot.isBooked,
              isBooked: slot.isBooked
            };
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
    setSelectedSlots((prev) => {
      const slot = prev[dateTimeKey];
      if (slot?.isBooked) return prev;
      return {
        ...prev,
        [dateTimeKey]: {
          ...slot,
          isAvailable: !slot?.isAvailable
        }
      };
    });
  };

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
      toast.success("Chỉnh sửa lịch thành công!")
    } catch (error) {
      console.error("Failed to save availability:", error)
      toast.error("Gặp lỗi khi chỉnh sửa lịch!")
    }
  }

  return (
    <div className="calendar-card">
      <div className="calendar-header">
        <button className="nav-button" onClick={handlePreviousWeek}>
          ← Trước
        </button>

        <h2 className="date-range">
          {formatDate(dates[0])} - {formatDate(dates[dates.length - 1])}
        </h2>

        <button className="nav-button" onClick={handleNextWeek}>
          Sau →
        </button>
      </div>

      <TimeSlotGrid dates={dates} selectedSlots={selectedSlots} onToggleTimeSlot={toggleTimeSlot} />

      <div className="save-container">
        <button onClick={handleSave} className="save-button">
          Lưu lịch
        </button>
      </div>
    </div>
  );
};

export default AvailabilitySchedule;
