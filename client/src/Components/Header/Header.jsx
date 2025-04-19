import { useEffect, useState } from "react";
import {
  FaEnvelope,
  FaFacebookF,
  FaInstagram,
  FaPinterestP,
  FaTwitter,
} from "react-icons/fa";
import { FaAnglesRight, FaLocationDot } from "react-icons/fa6";
import { HiMiniMagnifyingGlass } from "react-icons/hi2";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";



const Header = ({ isTopBar, variant }) => {
  const [isShowMobileMenu, setIsShowMobileMenu] = useState(false);
  const [openMobileSubmenuIndex, setOpenMobileSubmenuIndex] = useState([]);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [isSticky, setIsSticky] = useState();
  const [searchTerm, setSearchTerm] = useState("");
  const [username, setUsername] = useState(localStorage.getItem("username"));
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;
      if (currentScrollPos > prevScrollPos) {
        setIsSticky("cs_gescout_sticky"); // Scrolling down
      } else if (currentScrollPos !== 0) {
        setIsSticky("cs_gescout_sticky cs_gescout_show"); // Scrolling up
      } else {
        setIsSticky();
      }
      setPrevScrollPos(currentScrollPos); // Update previous scroll position
    };

    window.addEventListener("scroll", handleScroll);

    const handleLogin = () => {
      setUsername(localStorage.getItem("username"));
    };

    window.addEventListener("loginSuccess", handleLogin);

    return () => {
      window.removeEventListener("scroll", handleScroll); // Cleanup the event listener
      window.removeEventListener("loginSuccess", handleLogin);
    };
  }, [prevScrollPos]);

  const handleLogout = () => {
    localStorage.removeItem("token"); // Xóa token
    localStorage.removeItem("username"); // Xóa username
    setUsername(null); // Cập nhật state username về null
    navigate("/"); // Chuyển hướng về trang đăng nhập
  };

  const menu = {
    navItems: [
      {
        label: "Trang chủ",
        href: "/",
      },
      { label: "Về chúng tôi", href: "/about" },
      {
        label: "Bác sĩ",
        href: "/doctors",
        subItems: [
          { label: "Bác sĩ", href: "/doctors" },
          { label: "Danh sách yêu thích", href: "/favorites" },
        ],
      },
      {
        label: "Blog",
        href: "/blog",
        subItems: [
          { label: "Blog List", href: "/blog" },
          { label: "Blog Details", href: "/blog/blog-details" },
        ],
      },
      {
        label: "Lịch hẹn",
        href: "/",
        subItems: [
          { label: "Lịch sử khám bệnh", href: "/appointmentshistory" },
        ],
      },
      { label: "Liên hệ", href: "/contact" },
    ],
    btnUrl: "/contact",
    btnText: "Liên hệ ngay ",
  };

  const accountMenu = username
    ? [
        { label: "Hồ sơ ", href: "/profile" },
        // { label: "Danh sách yêu thích ", href: "/favorites" },
        { label: "Thanh toán ", href: "/payment" },
        { label: "Đăng xuất", action: handleLogout },
      ]
    : [
        { label: "Đăng nhập", href: "/login" },
        { label: "Đăng ký", href: "/register" },
      ];

  const handleOpenMobileSubmenu = (index) => {
    if (openMobileSubmenuIndex.includes(index)) {
      setOpenMobileSubmenuIndex((prev) => prev.filter((f) => f !== index));
    } else {
      setOpenMobileSubmenuIndex((prev) => [...prev, index]);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault(); // Ngăn trang reload

    if (searchTerm.trim()) {
      navigate(`/search?keyword=${encodeURIComponent(searchTerm)}`); // Chuyển hướng đến trang DoctorsResultPage
    }
  };

  return (
    <>
      <header
        className={`cs_site_header cs_style_1 ${variant ? variant : ""}
          cs_primary_color cs_sticky_header ${isSticky ? isSticky : ""}`}
      >
        {isTopBar && (
          <div className="cs_top_header cs_blue_bg cs_white_color">
            <div className="container">
              {/* <div className="cs_top_header_in">
                <div className="cs_top_header_left">
                  <ul className="cs_header_contact_list cs_mp_0">
                    <li>
                      <i>
                        <FaEnvelope />
                      </i>
                      <Link to={`mailto:${menu.email}`}>{menu.email}</Link>
                    </li>
                    <li>
                      <i>
                        <FaLocationDot />
                      </i>
                      {menu.location}
                    </li>
                  </ul>
                </div>
                <div className="cs_top_header_right">
                  <div className="cs_social_btns cs_style_1">
                    <Link to="/" className="cs_center">
                      <i>
                        <FaFacebookF />
                      </i>
                    </Link>
                    <Link to="/" className="cs_center">
                      <i>
                        <FaPinterestP />
                      </i>
                    </Link>
                    <Link to="/" className="cs_center">
                      <i>
                        <FaTwitter />
                      </i>
                    </Link>
                    <Link to="/" className="cs_center">
                      <i>
                        <FaInstagram />
                      </i>
                    </Link>
                  </div>
                </div>
              </div> */}
            </div>
          </div>
        )}
        <div className="cs_main_header">
          <div className="container">
            <div className="cs_main_header_in">
              <div className="cs_main_header_left ps-5 pt-2">
                <Link className="cs_site_branding" to={menu.logoLink}>
                  <img
                    src="/assets/img/logo.png"
                    alt="Logo"
                    style={{ height: "120px", objectFit: "contain" }}
                  />
                </Link>
              </div>
              <div className="cs_main_header_right">
                <div className="cs_nav cs_primary_color">
                  <ul
                    className={`cs_nav_list ${isShowMobileMenu && "cs_active"}`}
                  >
                    {menu.navItems.map((item, index) => (
                      <li
                        className={
                          item.subItems ? "menu-item-has-children" : ""
                        }
                        key={index}
                      >
                        <Link
                          to={item.href}
                          onClick={() => setIsShowMobileMenu(!isShowMobileMenu)}
                        >
                          {item.label}
                        </Link>
                        {item.subItems && (
                          <ul
                            style={{
                              display: openMobileSubmenuIndex.includes(index)
                                ? "block"
                                : "none",
                            }}
                          >
                            {item.subItems.map((subItem, subIndex) => (
                              <li key={subIndex}>
                                <Link
                                  to={subItem.href}
                                  onClick={() =>
                                    setIsShowMobileMenu(!isShowMobileMenu)
                                  }
                                >
                                  {subItem.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                        {item.subItems?.length && (
                          <span
                            className={`cs_menu_dropdown_toggle ${
                              openMobileSubmenuIndex.includes(index)
                                ? "active"
                                : ""
                            }`}
                            onClick={() => handleOpenMobileSubmenu(index)}
                          >
                            <span></span>
                          </span>
                        )}
                      </li>
                    ))}
                    {/* Hiển thị username nếu đã đăng nhập */}
                    <li className="menu-item-has-children">
                      <Link to="/">{username || "Tài khoản"}</Link>
                      <ul>
                        {accountMenu.map((subItem, subIndex) => (
                          <li key={subIndex}>
                            {subItem.href ? (
                              <Link to={subItem.href}>{subItem.label}</Link>
                            ) : (
                              <Link
                                to="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  subItem.action();
                                }}
                              >
                                {subItem.label}
                              </Link>
                            )}
                          </li>
                        ))}
                      </ul>
                    </li>
                  </ul>
                  <span
                    className={`cs_menu_toggle ${
                      isShowMobileMenu && "cs_toggle_active"
                    }`}
                    onClick={() => setIsShowMobileMenu(!isShowMobileMenu)}
                  >
                    <span></span>
                  </span>
                </div>
                <div className="cs_search_wrap">
                  <div
                    className="cs_search_toggle cs_center"
                    onClick={() => setIsSearchActive(!isSearchActive)}
                  >
                    <i>
                      <HiMiniMagnifyingGlass />
                    </i>
                  </div>
                  <form
                    action="#"
                    className={`cs_header_search_form ${
                      isSearchActive ? "active" : ""
                    }`}
                    onSubmit={handleSearch}
                  >
                    <div className="cs_header_search_form_in">
                      <input
                        type="text"
                        placeholder="Search"
                        className="cs_header_search_field"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <button className="cs_header_submit_btn">
                        <i>
                          <HiMiniMagnifyingGlass />
                        </i>
                      </button>
                    </div>
                  </form>
                </div>
                <Link to={menu.btnUrl} className="cs_btn cs_style_1 cs_color_1">
                  <span>{menu.btnText}</span>
                  <i>
                    <FaAnglesRight />
                  </i>
                </Link>
              </div>
            </div>
          </div>
        </div>
        {variant == "cs_type_1" && (
          <div className="cs_main_header_shape">
            <svg
              width={1679}
              height={112}
              viewBox="0 0 1679 112"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0 0L1679 0.014C1679 0.014 1639 23.128 1639 48.261V111.014H40V47.351C40 22.567 0 0 0 0Z"
                fill="#2EA6F7"
              />
              <path
                d="M10 0L1669 0.014C1669 0.014 1629 23.128 1629 48.261V111.014H50V47.351C50 22.567 10 0 10 0Z"
                fill="white"
              />
            </svg>
          </div>
        )}
      </header>
      {isTopBar && <div className="cs_site_header_spacing_150" />}
    </>
  );
};

export default Header;
