import React, { useEffect, useState } from 'react';
import Section from '../../Components/Section';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import BlogsSection2 from '../../Components/BlogsSection/BlogsSection2';

const DoctorBlogsPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [specializations, setSpecializations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [blogs, setBlogs] = useState([]);
    const [error, setError] = useState(null);
    const role = localStorage.getItem('role');

    const handleSpecializationFilter = (spec) => {
        navigate(`/doctor/blogs?specialization=${encodeURIComponent(spec)}`);
    };

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

    const fetchBlogs = async (specialization = '') => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

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

            let blogsArray = [];

            if (Array.isArray(response.data)) {
                console.log("response.data là một mảng với", response.data.length, "phần tử");
                blogsArray = response.data;
            } else if (response.data && typeof response.data === 'object' && Array.isArray(response.data.data)) {
                console.log("response.data.data là một mảng với", response.data.data.length, "phần tử");
                blogsArray = response.data.data;
            } else {
                console.error('Mong đợi một mảng nhưng nhận được:', typeof response.data);
                console.error('Chi tiết response.data:', JSON.stringify(response.data, null, 2));
                setError("Định dạng dữ liệu không hợp lệ");
                setLoading(false);
                return;
            }

            try {
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
                    link: `/doctor/blog/${blog._id}`, // Giữ link phù hợp với doctor
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
        sectionTitle: 'Bài viết mới nhất ',
        blogsData: blogs,
        refreshBlogs: fetchBlogs,
        specializations: specializations.map(spec => ({
            name: spec,
            link: `/doctor/blogs?specialization=${encodeURIComponent(spec)}`
        })),
        onSpecializationClick: handleSpecializationFilter
    };

    return (
        <>
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
                            Thử lại
                        </button>
                    </div>
                ) : blogs.length === 0 ? (
                    <div className="text-center py-5">
                        <p>Không có blog có sẵn vào lúc này.</p>
                    </div>
                ) : (
                    <BlogsSection2
                        data={blogsSectionData}
                        onSpecializationClick={handleSpecializationFilter}
                    />
                )}
            </Section>
        </>
    );
};

export default DoctorBlogsPage;