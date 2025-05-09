import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "react-bootstrap";

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const token = localStorage.getItem("token");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentUsers = users.slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(users.length / itemsPerPage);

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BE_URL}/admin/users`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const handleBanUnban = async (userId) => {
        try {
            await axios.put(`${import.meta.env.VITE_BE_URL}/admin/users/status/${userId}`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchUsers();
        } catch (error) {
            console.error("Error updating user status:", error);
        }
    };

    return (
        <div className="container mt-5" style={{ minHeight: "80vh", display: "flex", flexDirection: "column" }}>
            <h2 className="text-center mb-4">Quản Lý Người Dùng </h2>
            <div className="table-responsive">
                <table className="table table-bordered text-center">
                    <thead>
                        <tr>
                            <th>Họ và tên</th>
                            <th>Email</th>
                            <th>Trạng thái </th>
                            <th>Thao tác </th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentUsers.length > 0 ? (
                            currentUsers.map((user) => (
                                <tr key={user._id}>
                                    <td>{user.username}</td>
                                    <td>{user.email}</td>
                                    <td>{user.active ? "Active" : "Banned"}</td>
                                    <td>
                                        <Button
                                            variant={user.active ? "danger" : "success"}
                                            size="sm"
                                            onClick={() => handleBanUnban(user._id)}
                                        >
                                            {user.active ? "Cấm" : "Bỏ Cấm"}
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4">Không có người dùng nào.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "20px",
                }}
            >
                <div>
                    Đang hiển thị {indexOfFirstItem + 1} đến{" "}
                    {Math.min(indexOfLastItem, users.length)} của{" "}
                    {users.length} người dùng
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                    <button
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                        style={{
                            padding: "8px 16px",
                            borderRadius: "4px",
                            border: "1px solid #ccc",
                            background: currentPage === 1 ? "#f0f0f0" : "#fff",
                            cursor: currentPage === 1 ? "not-allowed" : "pointer",
                        }}
                    >
                        Trang trước
                    </button>
                    <button
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        style={{
                            padding: "8px 16px",
                            borderRadius: "4px",
                            border: "1px solid #ccc",
                            background: currentPage === totalPages ? "#f0f0f0" : "#fff",
                            cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                        }}
                    >
                        Trang tiếp
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;
