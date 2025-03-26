export function   generateDateRange(startDate, days) {
  return Array.from({ length: days }, (_, i) => {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    return date
  })
}

export function formatDate(date) {
  return date.toLocaleDateString("en-CN", {
    month: "short",
    day: "numeric",
  })
}

export function getDayName(date) {
  return date.toLocaleDateString("en-CN", { weekday: "short" })
}

export function formatTime(hour, minute) {
  const period = hour >= 12 ? "PM" : "AM"
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
  return `${displayHour}:${minute.toString().padStart(2, "0")} ${period}`
}
