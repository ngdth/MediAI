import { useEffect, useState } from "react";
import axios from "axios";
import PageHeading from "../../Components/PageHeading";
import AppointmentSection2 from "../../Components/AppointmentSection2";
import Section from "../../Components/Section";
import { useLocation } from "react-router-dom";

const DoctorsResultPage = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const keyword = queryParams.get("keyword") || "";
    const title = keyword ? `Kết quả tìm kiếm cho  "${keyword}"` : "Doctor not found";

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
        title: doctors.length === 0 ? 'Không tìm thấy bác sĩ "' + keyword + '"' : title,
    };

    const appointmentSectionData = {
        subtitle: "KẾT QUẢ TÌM KIẾM",
        // title: "Meet Our Specialist This<br> Doctor Meeting",
        doctorsData: doctors.map((doctor) => ({
            username: doctor.username,
            specialization: doctor.specialization,
            imageUrl: doctor.imageUrl,
            profileLink: `/doctors/${doctor._id}`,
            iconUrl: "https://www.facebook.com/",
            iconUrl2: "https://www.pinterest.com/",
            iconUrl3: "https://www.twitter.com/",
        })),
    };

    return (
        <>
            <Section
                className={'cs_page_heading cs_bg_filed cs_center'}
                backgroundImage="/assets/img/background.jpg"
            >
                <PageHeading data={headingData} />
            </Section>
            {/* Appointment Section */}
            <Section
                topSpaceLg="70"
                topSpaceMd="110"
                bottomSpaceLg="80"
                bottomSpaceMd="120"
            >
                <AppointmentSection2 data={appointmentSectionData} />
            </Section>
        </>
    );
};

export default DoctorsResultPage;
