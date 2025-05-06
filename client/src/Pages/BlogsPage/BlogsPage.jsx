import React, { useEffect, useState } from 'react';
import PageHeading from '../../Components/PageHeading';
import BlogsSection1 from '../../Components/BlogsSection/BlogsSection1';
import Section from '../../Components/Section';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

const headingData = {
  title: 'Trang Blog',
};

const BlogsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [blogs, setBlogs] = useState([]);
  const [error, setError] = useState(null);

  const handleSpecializationFilter = (spec) => {
    navigate(`/blogs?specialization=${encodeURIComponent(spec)}`);
  };
  // Thêm useEffect để gọi fetchBlogs khi component mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const specialization = params.get('specialization');
    fetchBlogs(specialization);
    fetchSpecializations();
  }, [location.search]);

  const fetchSpecializations = async () => {
    try {
      const specResponse = await axios.get(`${import.meta.env.VITE_BE_URL}/blog/specializations`);
      setSpecializations(specResponse.data);
    } catch (err) {
      console.error("Error fetching specializations:", err);
    }
  };
  // BlogsPage.jsx - Chỉnh sửa fetchBlogs
  const fetchBlogs = async (specialization = '') => {
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

      console.log("Gọi API với URL:", `${import.meta.env.VITE_BE_URL}/blog`);
      const response = await axios.get(`${import.meta.env.VITE_BE_URL}/blog`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          sortBy: 'createdAt',
          order: 'desc',
          specialization
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

      try {
        // Chuyển đổi dữ liệu từ backend sang format mà component cần
        const formattedBlogs = blogsArray.map(blog => ({
          id: blog._id,
          category: blog.specialization || 'General',
          date: new Date(blog.createdAt).toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric' }),
          author: blog.author?.username || 'Unknown',
          comments: blog.comments?.length > 0 ? `${blog.comments.length} Comments` : 'No Comments',
          title: blog.title,
          subtitle: blog.content.substring(0, 100) + '...',
          image: blog.media && blog.media.length > 0
            ? `${import.meta.env.VITE_BE_URL}${blog.media[0].url.replace('/src', '')}`
            : '/assets/img/post_1.jpeg',
          link: `/blog/${blog._id}`,
          linkText: 'Đọc thêm',
          createdAt: blog.createdAt,
          updatedAt: blog.updatedAt,
          likesCount: blog.likes?.length || 0,
          commentsCount: blog.comments?.length || 0
        }));

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
        status: err.response?.status
      });

      if (err.response?.status === 401) {
        setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      } else if (err.response?.status === 403) {
        setError("Bạn không có quyền xem danh sách blog này.");
      } else if (err.message.includes("Network Error")) {
        setError("Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.");
      } else {
        setError(err.response?.data?.message || "Không tìm nạp được blog. Vui lòng thử lại sau.");
      }
    } finally {
      setLoading(false);
      console.log("fetchBlogs hoàn thành, loading set to false");
    }
  };

  const blogsSectionData = {
    sectionSubtitle: 'BLOG CỦA CHÚNG TÔI',
    sectionTitle: 'Bài viết mới nhất',
    blogsData: blogs,
    refreshBlogs: fetchBlogs, // Passing the fetch function to allow refresh from child components
    specializations: specializations.map(spec => ({
      name: spec,
      link: `/blogs?specialization=${encodeURIComponent(spec)}`
    })),
    onSpecializationClick: handleSpecializationFilter // Thêm prop này
  };
  return (
    <>
      <Section
        topSpaceMd="100"
      >
      </Section>

      <Section
        className={'cs_page_heading cs_bg_filed cs_center'}
        backgroundImage="/assets/img/banner-doctors.png"
      >
        <PageHeading data={headingData} />
      </Section>

      {/* Start Blog Section */}
      <Section>
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
              onClick={fetchBlogs}
            >
              THử lại
            </button>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-5">
            <p>Không có blog có sẵn vào lúc này.</p>
          </div>
        ) : (
          <BlogsSection1
            data={blogsSectionData}
            onSpecializationClick={handleSpecializationFilter} />
        )}
      </Section>
      {/* End Blog Section */}
    </>
  );
};

export default BlogsPage;

