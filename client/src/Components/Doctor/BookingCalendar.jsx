import React, { useEffect, useState } from "react";
import axios from "axios";
import { generateDateRange, formatDate } from "../../utils/dateUtils";
import { toast } from "react-toastify";
import BookingSlotGrid from "./BookingSlotGrid";
import BookingForm from "./BookingForm"; // Import modal form

const BookingCalendar = ({ doctorId, token }) => {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek;
    return new Date(today.setDate(diff));
  });

  const [availableSlots, setAvailableSlots] = useState({});
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false); // Trạng thái modal
  const [formData, setFormData] = useState({ name: "", phone: "", reason: "" });

  const dates = generateDateRange(currentWeekStart, 7);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/schedule/schedules/${doctorId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!Array.isArray(response.data) || response.data.length === 0) {
          console.error("Invalid API response format");
          return;
        }

        const scheduleData = response.data[0];

        if (!scheduleData || !scheduleData.availableSlots) {
          console.error("No available slots found in response");
          return;
        }

        const fetchedSlots = {};
        scheduleData.availableSlots.forEach(slot => {
          const dateKey = slot.date.split("T")[0];
          const formattedTime = slot.time.replace(":", "-");
          const dateTimeKey = `${dateKey}-${formattedTime}`;
          fetchedSlots[dateTimeKey] = !slot.isBooked;
        });

        setAvailableSlots(fetchedSlots);
      } catch (error) {
        console.error("Failed to fetch schedule:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [doctorId, token]);

  const handleSlotSelect = (dateTimeKey) => {
    if (availableSlots[dateTimeKey]) {
      setSelectedSlot(dateTimeKey);
      setShowModal(true); // Hiển thị modal khi chọn slot
    }
  };

  const handleFormClose = () => {
    setShowModal(false);
    setSelectedSlot(null);
  };

  const handleFormSubmit = async () => {
    if (!selectedSlot) {
      toast.error("Please select a time slot!");
      return;
    }

    const [date, hour, minute] = selectedSlot.split("-");
    const formattedTime = `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;

    try {
      const response = await axios.post(
        "http://localhost:8080/schedule/appointments",
        { doctorId, date, time: formattedTime, ...formData },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Appointment booked successfully!");
      console.log("Booking confirmed:", response.data);
      handleFormClose(); // Đóng modal sau khi đặt lịch thành công
    } catch (error) {
      toast.error("Failed to book appointment!");
      console.error("Error booking appointment:", error);
    }
  };

  return (
    <div className="calendar-card">
      <div className="calendar-header">
        <button className="nav-button" onClick={() => setCurrentWeekStart(new Date(currentWeekStart.setDate(currentWeekStart.getDate() - 7)))}>
          ← Previous
        </button>

        <h2 className="date-range">
          {formatDate(dates[0])} - {formatDate(dates[dates.length - 1])}
        </h2>

        <button className="nav-button" onClick={() => setCurrentWeekStart(new Date(currentWeekStart.setDate(currentWeekStart.getDate() + 7)))}>
          Next →
        </button>
      </div>

      {loading ? (
        <p>Loading available slots...</p>
      ) : (
        <BookingSlotGrid
          dates={dates}
          availableSlots={availableSlots}
          onToggleTimeSlot={handleSlotSelect}
        />
      )}

      {/* Modal React Bootstrap */}
      <BookingForm
        show={showModal}
        slot={selectedSlot}
        formData={formData}
        setFormData={setFormData}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
};

export default BookingCalendar;
