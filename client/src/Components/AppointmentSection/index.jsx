import { useState } from "react";
import { Button } from "react-bootstrap";
import {
  FaFacebookF,
  FaInstagram,
  FaPinterestP,
  FaTwitter,
} from "react-icons/fa6";
import { Link } from "react-router-dom";
import Slider from "react-slick";

const AppointmentSection = ({ data }) => {
  const ITEMS_PER_PAGE = 3;
  const [currentPage, setCurrentPage] = useState(0);

  const groupedEntries = Object.entries(data?.groupedDoctors || {});
  const totalPages = Math.ceil(groupedEntries.length / ITEMS_PER_PAGE);

  const paginatedEntries = groupedEntries.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );

  return (
    <>
      <div className="container">
        <div className="cs_height_50 cs_height_lg_50" />
        {paginatedEntries.map(([specialization, doctors], groupIndex) => {
          const slidesToShow = Math.min(4, doctors.length);
          const settings = {
            infinite: false,
            speed: 500,
            slidesToShow,
            slidesToScroll: 1,
            swipeToSlide: true,
            responsive: [
              {
                breakpoint: 1200,
                settings: { slidesToShow: 3 }
              },
              {
                breakpoint: 768,
                settings: { slidesToShow: 2 }
              },
              {
                breakpoint: 500,
                settings: { slidesToShow: 1 }
              }
            ]
          };
          return (
            <div key={groupIndex} className="mb-5">
              <h2 className="text-2xl font-bold mb-4">{specialization}</h2>
              <Slider {...settings}>
                {doctors.map((doctor, index) => (
                  <div key={index} className="px-2">
                    <div className="cs_team cs_style_1 cs_blue_bg">
                      <div className="cs_team_shape cs_accent_bg" />
                      <Link to={doctor.profileLink} className="cs_team_thumbnail">
                        <img
                          src={doctor.imageUrl || "https://i.pinimg.com/736x/16/b2/e2/16b2e2579118bf6fba3b56523583117f.jpg"}
                          alt={`${doctor.name} Thumbnail`}
                        />
                      </Link>
                      <div className="cs_team_bio">
                        <h3 className="cs_team_title cs_extra_bold mb-0">
                          <Link to={doctor.profileLink}>{doctor.name}</Link>
                        </h3>
                        <p className="cs_team_subtitle">{doctor.phone}</p>
                        <p className="cs_team_subtitle">{doctor.email}</p>
                        <p className="cs_team_subtitle">{doctor.specialization}</p>
                        <div className="cs_social_btns cs_style_1 mt-4">
                          <Link to={doctor.iconUrl} className="cs_center" target="_blank" rel="noopener noreferrer"><i><FaFacebookF /></i></Link>
                          <Link to={doctor.iconUrl2} className="cs_center" target="_blank" rel="noopener noreferrer"><i><FaPinterestP /></i></Link>
                          <Link to={doctor.iconUrl3} className="cs_center" target="_blank" rel="noopener noreferrer"><i><FaTwitter /></i></Link>
                          <a href={doctor.iconUrl} className="cs_center" target="_blank" rel="noopener noreferrer"><i><FaInstagram /></i></a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </Slider>
            </div>
          )
        })}
        {totalPages > 1 && (
          <div className="pagination-wrapper">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i)}
                className={`pagination-button ${i === currentPage ? "active" : ""}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default AppointmentSection;
