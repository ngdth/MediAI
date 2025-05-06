"use client"

export default function BillCard({ bill, onPayBill }) {
  const { doctorName, doctorSpecialization, date, time, totalAmount, paymentStatus, dueDate } = bill

  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const formattedDueDate = new Date(dueDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const isPastDue = new Date(dueDate) < new Date() && paymentStatus === "Unpaid"

  return (
    <div className={`bill-card ${paymentStatus} ${isPastDue ? "past-due" : ""}`}>
      <div className="bill-header">
        <h2>{doctorName}</h2>
        <span className={`status-badge ${paymentStatus}`}>{paymentStatus === "Paid" ? "Paid" : "Unpaid"}</span>
      </div>

      <div className="bill-details">
        <div className="detail-item">
          <span className="label">Specialty:</span>
          <span>{doctorSpecialization}</span>
        </div>
        <div className="detail-item">
          <span className="label">Appointment:</span>
          <span>
            {formattedDate} at {time}
          </span>
        </div>
        <div className="detail-item">
          <span className="label">Amount:</span>
          <span className="totalAmount">${totalAmount.toFixed(2)}</span>
        </div>
        <div className="detail-item">
          <span className="label">Due Date:</span>
          <span className={isPastDue ? "past-due-text" : ""}>
            {formattedDueDate}
            {isPastDue && " (Past Due)"}
          </span>
        </div>
      </div>

      {paymentStatus === "Unpaid" && (
        <div className="bill-actions">
          <button className="pay-button" onClick={() => onPayBill(bill)}>
            Pay Now
          </button>
          <button className="details-button">View Details</button>
        </div>
      )}

      {paymentStatus === "Paid" && (
        <div className="bill-actions">
          <button className="details-button">View Receipt</button>
        </div>
      )}
    </div>
  )
}

