import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "react-bootstrap";

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const token = localStorage.getItem("token");

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
                        {users.map((user) => (
                            <tr key={user._id}>
                                <td>{user.username}</td>
                                <td>{user.email}</td>
                                <td>{user.active ? "Active" : "Banned"}</td>
                                <td>
                                    <Button
                                        variant={user.active ? "danger" : "success"}
                                        size="sm"
                                        onClick={() => handleBanUnban(user._id, user.active)}
                                    >
                                        {user.active ? "Cấm " : "Bỏ Cấm "}
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserManagement;
