"use client"

export default function FilterBar({ activeFilter, onFilterChange }) {
  return (
    <div className="filter-bar">
      <div className="filter-options">
        <button
          className={`filter-button ${activeFilter === "all" ? "active" : ""}`}
          onClick={() => onFilterChange("all")}
        >
         Tất cả hóa đơn
        </button>
        <button
          className={`filter-button ${activeFilter === "unpaid" ? "active" : ""}`}
          onClick={() => onFilterChange("unpaid")}
        >
          Đã thanh toán 
        </button>
        <button
          className={`filter-button ${activeFilter === "paid" ? "active" : ""}`}
          onClick={() => onFilterChange("paid")}
        >
         Chưa thanh toán 
        </button>
      </div>
    </div>
  )
}

