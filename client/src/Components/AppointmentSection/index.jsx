import {
  FaFacebookF,
  FaInstagram,
  FaPinterestP,
  FaTwitter,
} from "react-icons/fa6";
import { Link } from "react-router-dom";

const AppointmentSection = ({ data }) => {
  return (
    <>
      <div className="container">
        <div className="cs_height_50 cs_height_lg_50" />
        {/* <div className="cs_doctors_grid cs_style_1"> */}
        {data?.groupedDoctors && Object.entries(data.groupedDoctors).map(([specialization, doctors], groupIndex) => (
          <div key={groupIndex} className="mb-5">
            <h2 className="text-2xl font-bold mb-4">{specialization}</h2>
            <div className="cs_doctors_grid cs_style_1">
              {doctors.map((doctor, index) => (
                <div className="cs_team cs_style_1 cs_blue_bg" key={index}>
                  <div className="cs_team_shape cs_accent_bg" />
                  <Link to={doctor.profileLink} className="cs_team_thumbnail">
                    <img src={doctor.imageUrl || "https://i.pinimg.com/736x/16/b2/e2/16b2e2579118bf6fba3b56523583117f.jpg"} alt={`${doctor.name} Thumbnail`} />
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
              ))}
            </div>
          </div>
        ))}
        {/* </div> */}
      </div>
    </>
  );
};

export default AppointmentSection;
