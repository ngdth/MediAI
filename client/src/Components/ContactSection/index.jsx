import { useState } from "react";
import SectionHeading from "../SectionHeading";
import axios from "axios";

const ContactSection = ({ data, reverseOrder }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    phone: "",
    message: "",
  });

  const [sending, setSending] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await axios.post(`${import.meta.env.VITE_BE_URL}/user/contact`, form);
      alert("Gửi yêu cầu thành công! Chúng tôi sẽ phản hồi sớm.");
      setForm({ name: "", email: "", subject: "", phone: "", message: "" });
    } catch (err) {
      alert("Đã xảy ra lỗi khi gửi yêu cầu.");
    }
    setSending(false);
  };

  return (
    <div className="container">
      <div className="row cs_gap_y_30">
        {reverseOrder ? (
          <>
            <div className="col-lg-6">
              <div className="cs_contact_thumbnail cs_pl-40">
                <div className="cs_teeth_shape">
                  <img
                    src={data.teethShapeImg}
                    alt="Teeth Shape"
                    className="cs_spinner_img"
                  />
                </div>
                <div className="cs_contact_img">
                  <img src={data.contactImg} alt="Contact" />
                </div>
                <div className="cs_contact_bg_shape">
                  <div className="cs_white_bg_shape" />
                  <div className={`cs_iconbox ${data.iconBox.style}`}>
                    <div className="cs_iconbox_icon cs_center">
                      <img src={data.iconBox.icon} alt="Icon" />
                    </div>
                    <div className="cs_iconbox_right">
                      <h3 className="cs_iconbox_title">{data.iconBox.title}</h3>
                      <p className="cs_iconbox_subtitle mb-0">{data.iconBox.subtitle}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <SectionHeading
                SectionSubtitle={data.sectionSubtitle}
                SectionTitle={data.SectionTitle}
              />

              <form className="cs_contact_form row cs_gap_y_20" onSubmit={handleSubmit}>
                <div className="col-md-6">
                  <label><strong>Họ và tên</strong></label>
                  <input
                    type="text"
                    name="name"
                    className="cs_form_field"
                    placeholder="Nhập họ tên"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label><strong>Email</strong></label>
                  <input
                    type="email"
                    name="email"
                    className="cs_form_field"
                    placeholder="Nhập email"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label><strong>Chủ đề</strong></label>
                  <input
                    type="text"
                    name="subject"
                    className="cs_form_field"
                    placeholder="Nhập chủ đề"
                    value={form.subject}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-6">
                  <label><strong>Số điện thoại</strong></label>
                  <input
                    type="text"
                    name="phone"
                    className="cs_form_field"
                    placeholder="Nhập số điện thoại"
                    value={form.phone}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-lg-12">
                  <label><strong>Nội dung</strong></label>
                  <textarea
                    name="message"
                    rows={5}
                    className="cs_form_field"
                    placeholder="Nhập nội dung bạn muốn gửi"
                    value={form.message}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-lg-12">
                  <button type="submit" className="cs_btn cs_style_1 cs_color_1" disabled={sending}>
                    {sending ? "Đang gửi..." : "Gửi yêu cầu"}
                  </button>
                </div>
              </form>
            </div>
          </>
        ) : (
          <>
            <div className="col-lg-6">
              <SectionHeading
                SectionSubtitle={data.sectionSubtitle}
                SectionTitle={data.SectionTitle}
              />

              <form className="cs_contact_form row cs_gap_y_20" onSubmit={handleSubmit}>
                <div className="col-md-6">
                  <label><strong>Họ và tên</strong></label>
                  <input
                    type="text"
                    name="name"
                    className="cs_form_field"
                    placeholder="Nhập họ tên"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label><strong>Email</strong></label>
                  <input
                    type="email"
                    name="email"
                    className="cs_form_field"
                    placeholder="Nhập email"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label><strong>Chủ đề</strong></label>
                  <input
                    type="text"
                    name="subject"
                    className="cs_form_field"
                    placeholder="Nhập chủ đề"
                    value={form.subject}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-6">
                  <label><strong>Số điện thoại</strong></label>
                  <input
                    type="text"
                    name="phone"
                    className="cs_form_field"
                    placeholder="Nhập số điện thoại"
                    value={form.phone}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-lg-12">
                  <label><strong>Nội dung</strong></label>
                  <textarea
                    name="message"
                    rows={5}
                    className="cs_form_field"
                    placeholder="Nhập nội dung bạn muốn gửi"
                    value={form.message}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-lg-12">
                  <button type="submit" className="cs_btn cs_style_1 cs_color_1" disabled={sending}>
                    {sending ? "Đang gửi..." : "Gửi yêu cầu"}
                  </button>
                </div>
              </form>
            </div>

            <div className="col-lg-6">
              <div className="cs_contact_thumbnail cs_pl-40">
                <div className="cs_teeth_shape">
                  <img
                    src={data.teethShapeImg}
                    alt="Teeth Shape"
                    className="cs_spinner_img"
                  />
                </div>
                <div className="cs_contact_img">
                  <img src={data.contactImg} alt="Contact" />
                </div>
                <div className="cs_contact_bg_shape">
                  <div className="cs_white_bg_shape" />
                  <div className={`cs_iconbox ${data.iconBox.style}`}>
                    <div className="cs_iconbox_icon cs_center">
                      <img src={data.iconBox.icon} alt="Icon" />
                    </div>
                    <div className="cs_iconbox_right">
                      <h3 className="cs_iconbox_title">{data.iconBox.title}</h3>
                      <p className="cs_iconbox_subtitle mb-0">{data.iconBox.subtitle}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ContactSection;
