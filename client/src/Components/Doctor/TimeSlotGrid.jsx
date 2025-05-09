import { formatTime, formatDate, getDayName } from "../../utils/dateUtils"

function TimeSlotGrid({ dates, selectedSlots, onToggleTimeSlot }) {
  // Generate time slots from 8 AM to 6 PM
  const timeSlots = Array.from({ length: 9 }, (_, i) => {
    return { hour: i + 8, minute: 0 }
  })

  const isPastDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate <= today;
  };

  // console.log("Received props:", { dates, selectedSlots })

  return (
    <div className="time-slot-container">
      <div className="time-slot-grid">
        {/* Header row with dates */}
        <div className="grid-header">
          <div></div>
          {dates.map((date, index) => (
            <div key={index} className="date-header">
              <div className="date-name">{getDayName(date)}</div>
              <div className="date-value">{formatDate(date)}</div>
            </div>
          ))}
        </div>

        {/* Time slots grid */}
        <div className="grid-body">
          {/* Time labels column */}
          <div className="time-labels">
            {timeSlots.map((slot, index) => (
              <div key={index} className="time-label">
                {formatTime(slot.hour, slot.minute)}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          {dates.map((date, dateIndex) => (
            <div key={dateIndex} className="day-column">
              {timeSlots.map((slot, timeIndex) => {
                const dateTimeKey = `${date.toLocaleDateString("en-CA")}-${slot.hour}-${slot.minute}`
                const slotData = selectedSlots[dateTimeKey]
                const isSelected = slotData?.isAvailable
                const isBooked = slotData?.isBooked
                const isPast = isPastDate(date);

                return (
                  <div
                    key={timeIndex}
                    onClick={() => onToggleTimeSlot(dateTimeKey)}
                    className={`time-slot 
                      ${isBooked ? "booked" : ""}
                      ${isSelected ? "selected" : ""}
                      ${isPast ? "disabled" : ""}`}
                    aria-label={`${isBooked ? "Booked" : isSelected ? "Available" : "Unavailable"} at ${formatTime(slot.hour, slot.minute)} on ${formatDate(date)}`}
                    role="button"
                    tabIndex={isPast ? -1 : 0}
                  >
                    {isBooked ? (
                      <span className="booked-text">Đã đặt</span>
                    ) : isSelected ? (
                      <span className="available-text">Lịch trống</span>
                    ) : null}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TimeSlotGrid;
