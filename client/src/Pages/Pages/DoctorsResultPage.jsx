import { useEffect, useState } from "react";
import axios from "axios";
import PageHeading from "../../Components/PageHeading";
import AppointmentSection from "../../Components/AppointmentSection";
import Section from "../../Components/Section";
import { useLocation } from "react-router-dom";



const DoctorsResultPage = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const keyword = queryParams.get("keyword") || "";
    const title = keyword ? `Search Results for "${keyword}"` : "Doctor not found";

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const response = await axios.post(`http://localhost:8080/user/search?keyword=${keyword}`);
                // Kiểm tra nếu response là object => Chuyển thành mảng
                const doctorsArray = Array.isArray(response.data) ? response.data : [response.data];
                console.log("Doctors API Response:", response.data);
                setDoctors(doctorsArray);
            } catch (error) {
                console.error("Error fetching doctors:", error.response?.data || error);
                setDoctors([]); // Tránh lỗi map()
            } finally {
                setLoading(false);
            }
        };

        fetchDoctors();
    }, [keyword]);

    const headingData = {
        title: title,
    };

    const appointmentSectionData = {
        subtitle: "OUR TEAM MEMBER",
        title: "Meet Our Specialist This Doctor Meeting",
        doctorsData: doctors.map((doctor) => ({
            name: doctor.username,
            specialty: doctor.specialization || "Unknown",
            imageUrl: doctor.image || "/assets/img/default-doctor.jpg",
            profileLink: `/doctors/${doctor._id}`,
            iconUrl: "https://www.facebook.com/",
            iconUrl2: "https://www.pinterest.com/",
            iconUrl3: "https://www.twitter.com/",
        })),
    };

    return (
        <>
            <Section className="cs_page_heading cs_bg_filed cs_center" backgroundImage="/assets/img/page_heading_bg.jpg">
                <PageHeading data={headingData} />
            </Section>

            {/* Nếu đang loading thì hiển thị loading */}
            {loading ? (
                <p>Loading...</p>
            ) : (
                <Section topSpaceLg="70" topSpaceMd="110" bottomSpaceLg="80" bottomSpaceMd="120">
                    <AppointmentSection data={appointmentSectionData} />
                </Section>
            )}
        </>
    );
};

export default DoctorsResultPage;
