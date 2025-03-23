import { useState, useEffect } from "react";

export default function BookingSchedule({ doctorId, selectedDay, setSelectedDay, selectedSlot, setSelectedSlot }) {

  const [availabilityData, setAvailabilityData] = useState({});
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await fetch(`http://localhost:8080/schedule/schedules/${doctorId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Failed to fetch schedule");

        const data = await response.json();
        console.log("API Response:", data);

        const schedule = data.length > 0 ? data[0] : null;

        if (!schedule || !schedule.availableSlots) {
          console.error("Lịch trống hoặc không có dữ liệu!");
          return;
        }

        const formattedData = {};
        schedule.availableSlots.forEach(({ date, time, isBooked }) => {
          if (!date || !time) return;

          const formattedDate = new Date(date).toISOString().split("T")[0];

          if (!isBooked) {
            if (!formattedData[formattedDate]) formattedData[formattedDate] = {};
            formattedData[formattedDate][time] = true;
          }
        });

        console.log("Processed Availability Data:", formattedData);
        setAvailabilityData(formattedData);
      } catch (error) {
        console.error("Lỗi lấy lịch:", error);
      }
    };

    fetchSchedule();
  }, [doctorId]);

  const getDaysOfWeek = () => {
    const days = [];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = new Date(); // Lấy ngày hiện tại

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i); // Lấy ngày tiếp theo

      const dateString = date.toLocaleDateString("en-CA");
      days.push({
        name: dayNames[date.getDay()], // Lấy tên thứ trong tuần
        date: date,
        dateString: dateString,
        isSelected: dateString === selectedDay,
        hasAvailability: availabilityData[dateString] && Object.keys(availabilityData[dateString]).length > 0,
      });
    }

    return days;
  };

  const handleDaySelect = (dateString) => {
    setSelectedDay(dateString);
    setSelectedSlot(null);
  };

  const handleTimeSlotClick = (timeSlot) => {
    setSelectedSlot(timeSlot);
  };

  const daysOfWeek = getDaysOfWeek();
  const selectedDayObj = daysOfWeek.find((day) => day.dateString === selectedDay);

  return (
    <div className="scheduler-container">
      <div className="days-selector">
        {daysOfWeek.map((day) => (
          <div
            key={day.dateString}
            className={`day-card ${day.isSelected ? "selected" : ""} ${day.hasAvailability ? "has-availability" : ""}`}
            onClick={() => handleDaySelect(day.dateString)}
          >
            <div className="day-name">{day.name}</div>
            <div className="day-date">{day.date.getDate()}</div>
          </div>
        ))}
      </div>

      <div className="day-schedule">
        <h2 className="schedule-title">
          {selectedDayObj?.date.toLocaleDateString("en-CN", { weekday: "long", month: "long", day: "numeric" })}
        </h2>

        <div className="time-slots-container">
          {Object.keys(availabilityData[selectedDay] || {}).map((timeSlot) => (
            <div
              key={timeSlot}
              className={`time-slot-card ${selectedSlot === timeSlot ? "selected-slot" : ""}`}
              onClick={() => handleTimeSlotClick(timeSlot)}
            >
              <div className="time-slot-time">{timeSlot} {selectedSlot === timeSlot && "(Selected)"}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
