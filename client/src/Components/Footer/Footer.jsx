import { BsTwitter } from 'react-icons/bs';
import { FaPhoneAlt } from 'react-icons/fa';
import {
  FaFacebookF,
  FaInstagram,
  FaLocationDot,
  FaPinterestP,
  FaRegClock,
} from 'react-icons/fa6';
import { Link } from 'react-router-dom';

const data = {
  logo: '/assets/img/logo.png',
  contactText:
    'Giờ làm việc: <br /> Thứ hai - Thứ sáu: 8.00 sáng - 6.00 tối.',
  contactText2: 'Khu đô thị FPT City, Ngũ Hành Sơn, Đà Nẵng.',
  contactText3: '0967 392 294',
  facebookHref: '/',
  pinterestHref: '/',
  twitterHref: '/',
  instagramHref: '/',
  widgets: [
    {
      title: 'Liên kết nhanh',
      links: [
        { href: '/', text: 'Trang chủ' },
        { href: '/about', text: 'Về chúng tôi' },
        { href: '/doctors', text: 'Bác sĩ' },
        { href: '/portfolio', text: 'Blog' },
        { href: '/contact', text: 'Liên hệ' },
      ],
    },
  ],
  recentPosts: [
    {
      href: '/BookingAppointments',
      title: 'Đặt lịch ngay',
    },
  ],

  footerMenu: [
    { href: '/about', text: 'About Us' },
    { href: '/', text: 'Events' },
    { href: '/blog', text: 'News' },
    { href: '/service', text: 'Service' },
  ],
};

const Footer = () => {
  return (
    <footer
      className="cs_footer cs_blue_bg cs_bg_filed cs_white_color"
      style={{ backgroundImage: `url(${data.backgroundImage})` }}
    >
      <div className="container">
        <div className="cs_footer_row">
          <div className="cs_footer_col">
            <div className="cs_footer_highlight_col cs_accent_bg">
              <div className="cs_footer_logo">
                <img src={data.logo} alt="Logo" />
              </div>
              <ul className="cs_footer_contact cs_mp_0">
                <li>
                  <i
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                    }}
                  >
                    <FaRegClock />
                  </i>
                  <span
                    dangerouslySetInnerHTML={{ __html: data.contactText }}
                  />
                </li>
                <li>
                  <i
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                    }}
                  >
                    <FaLocationDot />
                  </i>
                  <span
                    dangerouslySetInnerHTML={{ __html: data.contactText2 }}
                  />
                </li>
                <li>
                  <i
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                    }}
                  >
                    <FaPhoneAlt />
                  </i>
                  <span
                    dangerouslySetInnerHTML={{ __html: data.contactText3 }}
                  />
                </li>
              </ul>
              <div className="cs_social_btns cs_style_1">
                <Link to={data.facebookHref} className="cs_center">
                  <i>
                    <FaFacebookF />
                  </i>
                </Link>
                <Link to={data.pinterestHref} className="cs_center">
                  <i>
                    <FaPinterestP />
                  </i>
                </Link>
                <Link to={data.twitterHref} className="cs_center">
                  <i>
                    <BsTwitter />
                  </i>
                </Link>
                <Link to={data.instagramHref} className="cs_center">
                  <i>
                    <FaInstagram />
                  </i>
                </Link>
              </div>
            </div>
          </div>

          {data.widgets.map((widget, index) => (
            <div className="cs_footer_col" key={index}>
              <div className="cs_footer_widget">
                <h2 className="cs_footer_widget_title">{widget.title}</h2>
                <ul className="cs_footer_widget_nav_list cs_mp_0">
                  {widget.links.map((link, index) => (
                    <li key={index}>
                      <Link to={link.href}>{link.text}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}

          <div className="cs_footer_col">
            <div className="cs_footer_widget">
              <h2 className="cs_footer_widget_title">Dành cho bệnh nhân</h2>
              <ul className="cs_footer_widget_nav_list cs_mp_0">
                {data.recentPosts.map((post, index) => (
                  <li key={index}>
                    <Link to={post.href}>{post.title}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* <div className="cs_footer_bottom cs_primary_bg">
        <div className="container">
          <div className="cs_footer_bottom_in">
            <p className="cs_footer_copyright mb-0">
              {data.copyrightText}
            </p>
            <ul className="cs_footer_menu cs_mp_0">
              {data.footerMenu.map((item, index) => (
                <li key={index}>
                  <Link to={item.href}>{item.text}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div> */}
    </footer>
  );
};

export default Footer;
