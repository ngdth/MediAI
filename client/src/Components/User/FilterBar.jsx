"use client"

export default function FilterBar({ activeFilter, onFilterChange }) {
  return (
    <div className="filter-bar">
      <div className="filter-options">
        <button
          className={`filter-button ${activeFilter === "all" ? "active" : ""}`}
          onClick={() => onFilterChange("all")}
        >
          All Bills
        </button>
        <button
          className={`filter-button ${activeFilter === "unpaid" ? "active" : ""}`}
          onClick={() => onFilterChange("unpaid")}
        >
          Unpaid
        </button>
        <button
          className={`filter-button ${activeFilter === "paid" ? "active" : ""}`}
          onClick={() => onFilterChange("paid")}
        >
          Paid
        </button>
      </div>
    </div>
  )
}

