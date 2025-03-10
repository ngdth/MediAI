import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import PageHeading from "../../Components/PageHeading";
import SectionHeading from "../../Components/SectionHeading";
import Section from "../../Components/Section";

const FavoritesPage = () => {
    const headingData = {
        title: "Favorite Doctors",
    };

    const [favorites, setFavorites] = useState([]);
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    useEffect(() => {
        fetchFavorites();
    }, []);

    const fetchFavorites = async () => {
        try {
            const response = await axios.get("http://localhost:8080/user/favorites", {
                headers: { Authorization: `Bearer ${token}` },
            });

            console.log(response.data);
            if (response.data && Array.isArray(response.data.favorites)) {
                // Gọi API lấy thông tin chi tiết của từng bác sĩ
                const doctorDetails = await Promise.all(
                    response.data.favorites.map(async (doctorId) => {
                        try {
                            const doctorResponse = await axios.get(`http://localhost:8080/user/doctors/${doctorId}`);
                            return doctorResponse.data; // Trả về dữ liệu bác sĩ
                        } catch (error) {
                            console.error(`Error fetching doctor ${doctorId}:`, error);
                            return null;
                        }
                    })
                );

                setFavorites(doctorDetails.filter((doctor) => doctor !== null)); // Lọc bỏ null
            } else {
                setFavorites([]);
            }
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
            await axios.delete(`http://localhost:8080/user/favorites/delete/${doctorId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
    
            setFavorites(favorites.filter((doctor) => doctor._id !== doctorId));
            alert("Doctor has been removed from favorites.");
        } catch (error) {
            console.error("Error removing favorite doctor:", error.response?.data || error);
            alert("Failed to remove doctor.");
        }
    };    

    if (favorites.length === 0) {
        return (
            <Section
                className="cs_page_heading cs_bg_filed cs_center"
                backgroundImage="/assets/img/page_heading_bg.jpg"
            >
                <PageHeading data={headingData} />
                <SectionHeading
                    SectionSubtitle="FAVORITES"
                    SectionTitle="No Favorite Doctors Found"
                    variant="text-center"
                />
            </Section>
        );
    }

    return (
        <>
            <Section
                className="cs_page_heading cs_bg_filed cs_center"
                backgroundImage="/assets/img/page_heading_bg.jpg"
            >
                <PageHeading data={headingData} />
            </Section>

            <Section topSpaceLg="70" topSpaceMd="110" bottomSpaceLg="80" bottomSpaceMd="120" className="cs_appointment">
                <div className="container">
                    <div className="cs_appointment_form_wrapper">
                        <SectionHeading SectionSubtitle="FAVORITES" SectionTitle="Your Favorite Doctors" variant="text-center" />
                        <div className="cs_height_40 cs_height_lg_35" />
                        <div className="favorites-table">
                            <table className="table table-bordered text-center">
                                <thead>
                                    <tr>
                                        <th>Doctor</th>
                                        <th>Specialization</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {favorites.map((doctor) => (
                                        <tr key={doctor._id}>
                                            <td>{doctor.username}</td>
                                            <td>{doctor.specialization}</td>
                                            <td>
                                                <button className="btn btn-primary btn-sm me-2" onClick={() => handleViewDetail(doctor._id)}>
                                                    View Detail
                                                </button>
                                                <button className="btn btn-danger btn-sm" onClick={() => handleRemove(doctor._id)}>
                                                    Remove
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
