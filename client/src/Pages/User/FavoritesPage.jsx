import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PageHeading from "../../Components/PageHeading";
import SectionHeading from "../../Components/SectionHeading";
import Section from "../../Components/Section";
import { toast } from "react-toastify";

const FavoritesPage = () => {
    const headingData = {
        title: "Bác sĩ yêu thích",
    };

    const [favorites, setFavorites] = useState([]);
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    useEffect(() => {
        fetchFavorites();
    }, []);

    const fetchFavorites = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BE_URL}/user/favorites`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setFavorites(response.data.favorites);
        } catch (error) {
            console.error("Error fetching favorite doctors:", error.response?.data || error);
            setFavorites([]);
        }
    };

    const handleViewDetail = (doctorId) => {
        navigate(`/doctors/${doctorId}`);
    };

    const handleRemove = async (doctorId) => {
        try {
            await axios.delete(`${import.meta.env.VITE_BE_URL}/user/favorites/delete/${doctorId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setFavorites(favorites.filter((doctor) => doctor._id !== doctorId));
            toast.success("Doctor has been removed from favorites.");
        } catch (error) {
            console.error("Error removing favorite doctor:", error.response?.data || error);
            toast.error("Failed to remove doctor.");
        }
    };

    if (favorites.length === 0) {
        return (
            <Section
                className="cs_page_heading cs_bg_filed cs_center"
                backgroundImage="/assets/img/banner-doctors.png"
            >
                <PageHeading data={headingData} />
                <SectionHeading
                    SectionTitle="Không tìm thấy bác sĩ yêu thích"
                    variant="text-center"
                />
            </Section>
        );
    }

    return (
        <>
            <Section
                topSpaceMd="100"
            >
            </Section>

            <Section
                className="cs_page_heading cs_bg_filed cs_center"
                backgroundImage="/assets/img/background.jpg"
            >
                <PageHeading data={headingData} />
            </Section>

            <Section topSpaceLg="70" topSpaceMd="110" bottomSpaceLg="80" bottomSpaceMd="120" className="cs_appointment">
                <div className="container">
                    <div className="cs_appointment_form_wrapper">
                        <SectionHeading SectionTitle="Danh sách bác sĩ yêu thích" variant="text-center" />
                        <div className="cs_height_40 cs_height_lg_35" />
                        <div className="favorites-table">
                            <table className="table table-bordered text-center">
                                <thead>
                                    <tr>
                                        <th>Bác sĩ </th>
                                        <th>Chuyên khoa </th>
                                        <th>Hoạt động </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {favorites.map((doctor) => (
                                        <tr key={doctor._id}>
                                            <td>{doctor.username}</td>
                                            <td>{doctor.specialization}</td>
                                            <td>
                                                <button className="btn btn-primary btn-sm me-2" onClick={() => handleViewDetail(doctor._id)}>
                                                    Xem chi tiết
                                                </button>
                                                <button className="btn btn-danger btn-se" onClick={() => handleRemove(doctor._id)}>
                                                    Xóa
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </Section>
        </>
    );
};

export default FavoritesPage;
