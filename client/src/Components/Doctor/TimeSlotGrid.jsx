import { formatTime, formatDate, getDayName } from "../../utils/dateUtils"

function TimeSlotGrid({ dates, selectedSlots, onToggleTimeSlot }) {
  // Generate time slots from 8 AM to 6 PM
  const timeSlots = Array.from({ length: 9 }, (_, i) => {
    return { hour: i + 8, minute: 0 }
  })

  // console.log("Received props:", { dates, selectedSlots })

  return (
    <div className="time-slot-container">
      <div className="time-slot-grid">
        {/* Header row with dates */}
        <div className="grid-header">
          <div className="time-label-header fw-bold">Thơi gian</div>
          {dates.map((date, index) => (
            <div key={index} className="date-header">
              <div className="day-name">{getDayName(date)}</div>
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
                const isSelected = selectedSlots[dateTimeKey]

                return (
                  <div
                    key={timeIndex}
                    onClick={() => onToggleTimeSlot(dateTimeKey)}
                    className={`time-slot ${isSelected ? "selected" : ""}`}
                    aria-label={`${isSelected ? "Available" : "Unavailable"} at ${formatTime(slot.hour, slot.minute)} on ${formatDate(date)}`}
                    role="button"
                    tabIndex={0}
                  >
                    {isSelected && <span className="available-text">Available</span>}
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
