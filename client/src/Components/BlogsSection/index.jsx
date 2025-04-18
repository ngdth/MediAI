// Import necessary libraries and components
import { Link } from "react-router-dom";
import Slider from "react-slick";
import Button from "../Buttons";
import { FaAngleRight } from "react-icons/fa6";
import SectionHeading from "../SectionHeading";
import { useEffect, useState } from "react";
import axios from "axios";

const BlogSection = ({ data }) => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        // Kiểm tra token
        if (!token) {
          console.error("Không có token trong localStorage");
          setError("Bạn cần đăng nhập để xem danh sách blog");
          setLoading(false);
          return;
        }

        console.log("Gọi API với URL:", 'http://localhost:8080/blog');

        const response = await axios.get('http://localhost:8080/blog', {
          headers: {
            Authorization: `Bearer ${token}`
          },
          params: {
            limit: 6, // Giới hạn số lượng bài viết lấy về
            sortBy: 'createdAt',
            order: 'desc'
          }
        });

        console.log("API Response status:", response.status);
        console.log("API Response data type:", typeof response.data);

        // Xác định mảng blogs thực tế
        let blogsArray = [];

        // Kiểm tra xem response.data đã là một mảng chưa
        if (Array.isArray(response.data)) {
          console.log("response.data là một mảng với", response.data.length, "phần tử");
          blogsArray = response.data;
        }
        // Kiểm tra xem response.data có phải là một đối tượng với thuộc tính data là một mảng không
        else if (response.data && typeof response.data === 'object' && Array.isArray(response.data.data)) {
          console.log("response.data.data là một mảng với", response.data.data.length, "phần tử");
          blogsArray = response.data.data;
        }
        // Nếu không đáp ứng điều kiện nào, đặt một lỗi
        else {
          console.error('Mong đợi một mảng nhưng nhận được:', typeof response.data);
          console.error('Chi tiết response.data:', JSON.stringify(response.data, null, 2));
          setError("Định dạng dữ liệu không hợp lệ");
          setLoading(false);
          return;
        }

        // Nếu không có lỗi nhưng mảng rỗng
        if (blogsArray.length === 0) {
          console.log("Không có blog nào từ API");
          setBlogs([]);
          setLoading(false);
          return;
        }

        console.log("Bắt đầu định dạng", blogsArray.length, "bài viết");

        try {
          // Chuyển đổi dữ liệu từ backend sang format mà component cần
          const formattedBlogs = blogsArray.map(blog => {
            console.log("Đang xử lý blog:", blog._id, blog.title);

            return {
              id: blog._id,
              category: blog.specialization || 'General',
              date: new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }),
              author: blog.author?.username || 'Unknown',
              authorIcon: '/assets/img/icons/user.svg',
              commentIcon: '/assets/img/icons/comment.svg',
              title: blog.title,
              subtitle: blog.content.substring(0, 100) + '...',
              thumbnail: blog.media && blog.media.length > 0 ? blog.media[0].url : '/assets/img/post_1.jpeg',
              postLink: `/blog/${blog._id}`,
              btnText: 'Đọc thêm',
              commentsCount: blog.comments?.length || 0,
              createdAt: blog.createdAt,
              updatedAt: blog.updatedAt
            };
          });

          console.log("Đã định dạng xong", formattedBlogs.length, "bài viết");
          setBlogs(formattedBlogs);
          setError(null);
        } catch (mapError) {
          console.error("Lỗi khi map dữ liệu:", mapError);
          setError("Lỗi khi xử lý dữ liệu blog");
        }
      } catch (err) {
        console.error("Error fetching blogs:", err);
        console.error("Error details:", {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
          headers: err.response?.headers
        });

        if (err.response?.status === 401) {
          setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        } else if (err.response?.status === 403) {
          setError("Bạn không có quyền xem danh sách blog này.");
        } else if (err.message.includes("Network Error")) {
          setError("Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.");
        } else {
          setError("Không thể tải danh sách blog. Vui lòng thử lại sau.");
        }
      } finally {
        setLoading(false);
        console.log("fetchBlogs hoàn thành, loading set to false");
      }
    };

    fetchBlogs();

    // Cleanup function để tránh memory leak
    return () => {
      // Nếu có bất kỳ cleanup nào cần thực hiện
    };
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    speed: 1000,
    slidesToShow: 3,
    fade: false,
    swipeToSlide: true,
    appendDots: (dots) => (
      <div>
        <ul>{dots}</ul>
      </div>
    ),
    dotsClass: "cs_pagination cs_style_2",
    responsive: [
      {
        breakpoint: 1199,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 767,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  return (
    <>
      <div className="container">
        <SectionHeading
          SectionSubtitle={data.sectionTitle}
          SectionTitle={data.sectionSubtitle}
          variant={"text-center"}
        />

        <div className="cs_height_50 cs_height_lg_50" />

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
          </div>
        ) : error ? (
          <div className="alert alert-danger text-center" role="alert">
            {error}
            <button
              className="btn btn-outline-primary mt-3"
              onClick={() => window.location.reload()}
            >
              Thử lại
            </button>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-5">
            <p>Không có bài viết nào để hiển thị.</p>
          </div>
        ) : (
          <div className="cs_slider cs_style_1 cs_slider_gap_24">
            <div className="cs_slider_container">
              <div className="cs_slider_wrapper">
                <Slider {...settings}>
                  {blogs.map((post, index) => (
                    <div key={index} className="cs_slide">
                      <article className="cs_post cs_style_1">
                        <Link
                          to={post.postLink}
                          className="cs_post_thumbnail position-relative"
                        >
                          <img
                            src={post.thumbnail.startsWith('/src')
                              ? `http://localhost:8080${post.thumbnail.replace('/src', '')}`
                              : post.thumbnail}
                            alt="post Thumbnail"
                            onError={(e) => {
                              console.error("Lỗi tải ảnh:", post.thumbnail);
                              e.target.src = '/assets/img/post_1.jpeg';
                            }}
                          />
                          <div className="cs_post_category position-absolute">
                            {post.category}
                          </div>
                        </Link>
                        <div className="cs_post_content position-relative">
                          <div className="cs_post_meta_wrapper">
                            <div className="cs_posted_by cs_center position-absolute">
                              {post.date}
                            </div>
                            <div className="cs_post_meta_item">
                              <img src={post.authorIcon} alt="Icon" />
                              <span>{post.author}</span>
                            </div>
                            <div className="cs_post_meta_item">
                              <img src={post.commentIcon} alt="Icon" />
                              <span>{post.commentsCount} Bình luận</span>
                            </div>
                          </div>
                          <h3 className="cs_post_title">
                            <Link to={post.postLink}>{post.title}</Link>
                          </h3>
                          <p className="cs_post_subtitle">{post.subtitle}</p>

                          <Button
                            variant={"cs_post_btn"}
                            btnIcons={<FaAngleRight />}
                            btnUrl={post.postLink}
                            btnText={post.btnText}
                          />

                          <div className="cs_post_shape position-absolute" />
                        </div>
                      </article>
                    </div>
                  ))}
                </Slider>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default BlogSection;
