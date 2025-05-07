import React, { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";

const ChangePassForm = ({ userId, onBackToProfile }) => {
    const [formData, setFormData] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(""); // Reset lỗi trước đó

        if (formData.newPassword !== formData.confirmPassword) {
            setError("Mật khẩu mới và xác nhận mật khẩu không khớp");
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                console.error("No token found. Please login first.");
                return;
            }

            const response = await axios.post(
                `${import.meta.env.VITE_BE_URL}/user/changePassword/${userId}`,
                {
                    oldPassword: formData.oldPassword,
                    newPassword: formData.newPassword,
                    confPassword: formData.confirmPassword,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status === 200) {
                toast.success("Đổi mật khẩu thành công!");
                onBackToProfile(); // Gọi hàm để quay lại ProfileForm
            }
        } catch (error) {
            setError(error.response?.data?.message || "Đã xảy ra lỗi. Vui lòng thử lại.");
        }
        setLoading(false);
    };

    return (
        <div className="card-body" style={{ backgroundColor: "#F7FAFC" }}>
            <Form onSubmit={handleSubmit}>
                {error && <Alert variant="danger">{error}</Alert>}

                <Form.Group className="mb-3">
                    <Form.Label>Mật khẩu cũ</Form.Label>
                    <Form.Control
                        type="password"
                        placeholder="Nhập mật khẩu cũ"
                        name="oldPassword"
                        value={formData.oldPassword}
                        onChange={handleChange}
                        required
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Mật khẩu mới</Form.Label>
                    <Form.Control
                        type="password"
                        placeholder="Nhập mật khẩu mới"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        required
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Xác nhận mật khẩu mới</Form.Label>
                    <Form.Control
                        type="password"
                        placeholder="Xác nhận mật khẩu mới"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                    />
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100" disabled={loading}>
                    {loading ? "Đang đổi mật khẩu..." : "Đổi mật khẩu"}
                </Button>
            </Form>
        </div>
    );
};

export default ChangePassForm;
