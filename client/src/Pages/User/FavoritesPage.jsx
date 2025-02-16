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

            console.log("API Response:", response.data); // Log dữ liệu API

            // Kiểm tra nếu response.data.favorites là mảng thì set vào state
            if (response.data && Array.isArray(response.data.favorites)) {
                setFavorites(response.data.favorites);
            } else {
                setFavorites([]); // Nếu không phải mảng, đặt thành mảng rỗng
            }
        } catch (error) {
            console.error("Error fetching favorite doctors:", error.response?.data || error);
            setFavorites([]); // Đảm bảo không bị lỗi map()
        }
    };


    const handleViewDetail = (doctorId) => {
        navigate(`/doctors/${doctorId}`);
    };

    const handleRemove = (doctorId) => {
        Swal.fire({
            title: "Are you sure you want to remove?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes",
            cancelButtonText: "No",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.delete(`http://localhost:8080/user/favorites/delete/${doctorId}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });

                    setFavorites(favorites.filter((doctor) => doctor._id !== doctorId));
                    Swal.fire("Removed!", "Doctor has been removed from favorites.", "success");
                } catch (error) {
                    console.error("Error removing favorite doctor:", error.response?.data || error);
                    Swal.fire("Error", "Failed to remove doctor.", "error");
                }
            }
        });
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
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Doctor Name</th>
                                        <th>Specialization</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {favorites.map((doctorId) => (
                                        <tr key={doctorId}>
                                            <td>{doctorId}</td>
                                            <td>{doctorId}</td>
                                            <td>
                                                <button className="btn btn-primary btn-sm me-2" onClick={() => handleViewDetail(doctorId)}>
                                                    View Detail
                                                </button>
                                                <button className="btn btn-danger btn-sm" onClick={() => handleRemove(doctorId)}>
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
