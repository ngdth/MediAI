import { Button } from "react-bootstrap";
import { FaHeart } from "react-icons/fa6";

const DoctorDetailsSection = ({ data, onFavoriteToggle, favoriteStatus, onBookNow }) => {
  // Kiểm tra nếu data không có hoặc có giá trị rỗng
  const image = data?.imageUrl;
  const name = data?.username || '';
  const subtitle = data?.bio || 'No subtitle available';
  const description = data?.description || [];
  const info = data?.info || [];
  const progressBars = data?.progressBars || [];

  return (
    <div className="container">
      <div className="cs_doctor_details_wrapper">
        <div className="row cs_row_gap_30 cs_gap_y_30 align-items-center">
          <div className="col-lg-5">
            <div className="cs_doctor_details_thumbnail position-relative">
              <img src={image} alt="Doctor Image" />
              <div className="cs_doctor_thumbnail_shape1 position-absolute cs_blue_bg" />
              <div className="cs_doctor_thumbnail_shape2 position-absolute cs_accent_bg" />
            </div>
          </div>
          <div className="col-lg-7">
            <div className="cs_doctor_details">
              <div className="cs_doctor_info_header">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <h3 className="cs_doctor_title">{name}</h3>
                  <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                    <button
                      onClick={onFavoriteToggle}
                      style={{
                        padding: "8px 16px",
                        backgroundColor: favoriteStatus ? "red" : "#007bff",
                        color: "#fff",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                      }}
                    >
                      <FaHeart />
                      {favoriteStatus ? "" : ""}
                    </button>
                    <Button variant="primary" onClick={onBookNow}>
                      Đặt lịch ngay
                    </Button>
                  </div>
                </div>
                <p className="cs_doctor_subtitle mb-0 pt-3">{subtitle}</p>
              </div>
              {description.map((desc, index) => (
                <p className="mb-0" key={index}>
                  {desc}
                </p>
              ))}
              <div className="cs_height_20 cs_height_lg_20" />
              <div className="cs_doctor_info_wrapper">
                {info.map((info, index) => (
                  <div className="cs_doctor_info_row" key={index}>
                    <div className="cs_doctor_info_col">
                      <div className="cs_iconbox cs_style_10">
                        <div className="cs_iconbox_icon mt-1">
                          <i>{info.icon}</i>
                        </div>
                        <div className="cs_iconbox_text">
                          <p className="cs_iconbox_title">{info.title}</p>
                          <h3 className="cs_iconbox_subtitle mb-0">
                            {info.subtitle}
                          </h3>
                        </div>
                      </div>
                    </div>
                    <div className="cs_doctor_info_col">
                      <div className="cs_iconbox cs_style_10">
                        <div className="cs_iconbox_icon mt-1">
                          <i>{info.secIcon}</i>
                        </div>
                        <div className="cs_iconbox_text">
                          <p className="cs_iconbox_title">{info.secTitle}</p>
                          <h3 className="cs_iconbox_subtitle mb-0">
                            {info.secSubtitle}
                          </h3>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="cs_height_47 cs_height_lg_40" />
        <div className="cs_progress_bar_wrapper">
          {progressBars.map((progress, index) => (
            <div className="cs_progress_item" key={index}>
              <div className="cs_progress_head">
                <span>{progress.label}</span>
                <span>{progress.percentage}%</span>
              </div>
              <div className="cs_progress">
                <div
                  className="cs_progress_in"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="cs_height_100 cs_height_lg_60" />
      <hr />
    </div>
  );
};

export default DoctorDetailsSection;
