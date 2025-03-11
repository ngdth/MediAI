import { formatTime, formatDate, getDayName } from "../../utils/dateUtils";
import { useState } from "react";

function BookingSlotGrid({ dates, availableSlots, onToggleTimeSlot }) {
  // Generate time slots từ 8 AM đến 6 PM
  const timeSlots = Array.from({ length: 9 }, (_, i) => ({
    hour: i + 8,
    minute: 0
  }));

  // State lưu trạng thái slot được chọn
  const [selectedSlots, setSelectedSlots] = useState({});

  // Hàm xử lý khi nhấn vào slot
  const handleSlotClick = (dateTimeKey) => {
    if (availableSlots[dateTimeKey]) {
      setSelectedSlots((prevSlots) => ({
        ...prevSlots,
        [dateTimeKey]: !prevSlots[dateTimeKey], // Toggle trạng thái
      }));
      onToggleTimeSlot(dateTimeKey);
    }
  };

  return (
    <div className="time-slot-container">
      <div className="time-slot-grid">
        {/* Header row với các ngày */}
        <div className="grid-header">
          <div className="time-label-header">Time</div>
          {dates.map((date, index) => (
            <div key={index} className="date-header">
              <div className="day-name">{getDayName(date)}</div>
              <div className="date-value">{formatDate(date)}</div>
            </div>
          ))}
        </div>

        {/* Time slots grid */}
        <div className="grid-body">
          {/* Cột hiển thị giờ */}
          <div className="time-labels">
            {timeSlots.map((slot, index) => (
              <div key={index} className="time-label">
                {formatTime(slot.hour, slot.minute)}
              </div>
            ))}
          </div>

          {/* Hiển thị lịch */}
          {dates.map((date, dateIndex) => (
            <div key={dateIndex} className="day-column">
              {timeSlots.map((slot, timeIndex) => {
                const dateKey = date.toISOString().split("T")[0]; // Lấy YYYY-MM-DD
                const formattedTime = `${slot.hour.toString().padStart(2, "0")}-${slot.minute.toString().padStart(2, "0")}`;
                const dateTimeKey = `${dateKey}-${formattedTime}`;
                const isAvailable = availableSlots[dateTimeKey]; // Kiểm tra với API
                const isSelected = selectedSlots[dateTimeKey];

                return (
                  <div
                    key={timeIndex}
                    onClick={() => handleSlotClick(dateTimeKey)}
                    className={`time-slot ${isSelected ? "selected" : ""} ${isAvailable ? "" : "disabled"}`}
                    aria-label={`Slot ${isSelected ? "Selected" : "Available"} at ${formatTime(slot.hour, slot.minute)} on ${formatDate(date)}`}
                    role="button"
                    tabIndex={0}
                  >
                    <span className="status-text">
                      {isAvailable ? (isSelected ? "Selected" : "Available") : ""}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default BookingSlotGrid;
