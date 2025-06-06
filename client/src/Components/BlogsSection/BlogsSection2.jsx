import SectionHeading from "../SectionHeading";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaAngleRight } from "react-icons/fa";
import { FaMagnifyingGlass, FaPlus } from "react-icons/fa6";
import { useEffect, useState } from "react";
import { Modal, Button } from 'react-bootstrap';
import axios from "axios";
import "../../sass/blog/blogsSection1.scss";

const BlogsSection2 = ({ data }) => {
    console.log("Component BlogsSection2 được render với data:", data);

    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const tagParam = queryParams.get('tag');
    const specializationParam = queryParams.get('specialization');

    const [searchTerm, setSearchTerm] = useState('');
    const [filteredBlogs, setFilteredBlogs] = useState([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [loading, setLoading] = useState(false);
    const [specializations, setSpecializations] = useState([]);
    const [selectedSpecialization, setSelectedSpecialization] = useState('');
    const [error, setError] = useState(null);
    const [allBlogs, setAllBlogs] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [blogToDelete, setBlogToDelete] = useState(null);

    const [currentUser, setCurrentUser] = useState(null);
    const [isDoctor, setIsDoctor] = useState(false);
    const [activeTag, setActiveTag] = useState('all');

    useEffect(() => {
        checkUserRole();
        if (tagParam === 'my') {
            setActiveTag('my');
            fetchMyBlogs();
        } else {
            setActiveTag('all');
            fetchBlogs('', specializationParam || '', isDoctor);
        }
    }, [tagParam, specializationParam]);

    const truncateHTML = (html, maxLength) => {
        if (!html || typeof html !== 'string') return '';
        if (html.length <= maxLength) return html;

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        if (!doc.body) return html.substring(0, maxLength) + '...';

        const walker = document.createNodeIterator(doc.body, NodeFilter.SHOW_TEXT);

        let length = 0;
        let nodesToRemove = [];
        let currentNode;

        while ((currentNode = walker.nextNode())) {
            const nodeLength = currentNode.textContent.length;
            if (length + nodeLength > maxLength) {
                currentNode.textContent = currentNode.textContent.slice(0, maxLength - length) + '...';
                nodesToRemove = [];
                break;
            }
            length += nodeLength;
            nodesToRemove.push(currentNode.parentNode);
        }

        nodesToRemove.reverse().forEach(node => {
            if (node?.parentNode) {
                node.parentNode.removeChild(node);
            }
        });

        return doc.body?.innerHTML || html.substring(0, maxLength) + '...';
    };

    const checkUserRole = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await axios.get(`${import.meta.env.VITE_BE_URL}/user/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            console.log("Role của người dùng:", response.data.role);

            setCurrentUser(response.data);
            setIsDoctor(response.data.role === 'doctor');
        } catch (err) {
            console.error("Error fetching user info:", err.response?.data || err.message);
        }
    };

    const extractSpecializations = (blogs) => {
        const specializationSet = new Set(blogs.map(blog => blog.category).filter(Boolean));
        const formattedSpecializations = Array.from(specializationSet).map(spec => ({
            name: spec,
            value: spec
        }));
        setSpecializations(formattedSpecializations);
    };

    const fetchMyBlogs = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError("Bạn cần đăng nhập để xem danh sách blog");
                setLoading(false);
                return;
            }

            const response = await axios.get(`${import.meta.env.VITE_BE_URL}/blog/my-blogs`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const blogsArray = Array.isArray(response.data) ? response.data : response.data.data;

            if (!blogsArray || blogsArray.length === 0) {
                setFilteredBlogs([]);
                setAllBlogs([]);
                setError("Bạn chưa có bài viết nào.");
                setLoading(false);
                return;
            }

            console.log("Dữ liệu từ /blog/my-blogs:", blogsArray);

            const formattedBlogs = blogsArray.map(blog => {
                let imageUrl = '/assets/img/post_1.jpeg'; // Ảnh mặc định
                if (blog.media && Array.isArray(blog.media) && blog.media[0]?.url) {
                    const mediaUrl = blog.media[0].url;
                    console.log(`Blog ${blog._id} raw media URL (my-blogs):`, mediaUrl);
                    if (mediaUrl && (mediaUrl.startsWith('http://') || mediaUrl.startsWith('https://'))) {
                        imageUrl = mediaUrl;
                    } else if (mediaUrl) {
                        imageUrl = `${import.meta.env.VITE_BE_URL}/${mediaUrl}`;
                    }
                } else {
                    console.log(`Blog ${blog._id} không có media hoặc media[0].url (my-blogs)`);
                }

                console.log(`Blog ${blog._id} final image URL (my-blogs):`, imageUrl);

                return {
                    id: blog._id,
                    category: blog.specialization || 'General',
                    date: new Date(blog.createdAt).toLocaleDateString('vi-VN', {
                        day: 'numeric', month: 'numeric',
                    }),
                    author: blog.author?.username || 'Unknown',
                    comments: `${blog.comments?.length || 0} Bình luận`,
                    title: blog.title,
                    subtitle: truncateHTML(blog.content, 50),
                    image: imageUrl,
                    link: `/doctor/blog/${blog._id}`,
                    linkText: 'Đọc thêm',
                };
            });

            setFilteredBlogs(formattedBlogs);
            setAllBlogs(formattedBlogs);
            setError(null);
        } catch (err) {
            console.error("Error fetching my blogs:", err);
            setError("Không thể tải bài viết của bạn. Vui lòng thử lại sau.");
        } finally {
            setLoading(false);
        }
    };

    const fetchBlogs = async (term = '', specialization = '') => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');

            const response = await axios.get(`${import.meta.env.VITE_BE_URL}/blog`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { search: term, specialization, sortBy: 'createdAt', order: 'desc' }
            });

            const blogsArray = Array.isArray(response.data) ? response.data : response.data.data;

            if (!blogsArray || blogsArray.length === 0) {
                setAllBlogs([]);
                setFilteredBlogs([]);
                setLoading(false);
                return;
            }

            console.log("Dữ liệu từ /blog:", blogsArray);

            const formattedBlogs = blogsArray.map(blog => {
                let imageUrl = '/assets/img/post_1.jpeg'; // Ảnh mặc định
                if (blog.media && Array.isArray(blog.media) && blog.media[0]?.url) {
                    const mediaUrl = blog.media[0].url;
                    console.log(`Blog ${blog._id} raw media URL (all-blogs):`, mediaUrl);
                    if (mediaUrl && (mediaUrl.startsWith('http://') || mediaUrl.startsWith('https://'))) {
                        imageUrl = mediaUrl;
                    } else if (mediaUrl) {
                        imageUrl = `${import.meta.env.VITE_BE_URL}/${mediaUrl}`;
                    }
                } else {
                    console.log(`Blog ${blog._id} không có media hoặc media[0].url (all-blogs)`);
                }

                console.log(`Blog ${blog._id} final image URL (all-blogs):`, imageUrl);

                return {
                    id: blog._id,
                    category: blog.specialization || 'General',
                    date: new Date(blog.createdAt).toLocaleDateString('vi-VN', {
                        day: 'numeric', month: 'numeric',
                    }),
                    author: blog.author?.username || 'Unknown',
                    comments: `${blog.comments?.length || 0} Bình luận`,
                    title: blog.title,
                    subtitle: truncateHTML(blog.content, 50),
                    image: imageUrl,
                    link: `/doctor/blog/${blog._id}`,
                    linkText: 'Đọc thêm',
                };
            });

            setAllBlogs(formattedBlogs);
            setFilteredBlogs(formattedBlogs);
            extractSpecializations(formattedBlogs);
            setError(null);
        } catch (err) {
            console.error("Error fetching blogs:", err);
            setError("Không tìm nạp được blog. Vui lòng thử lại sau.");
        } finally {
            setLoading(false);
        }
    };

    const filterBlogsLocally = (term, specialization) => {
        let filtered = [...allBlogs];

        if (term) {
            const searchTermLower = term.toLowerCase();
            filtered = filtered.filter(blog =>
                blog.title.toLowerCase().includes(searchTermLower) ||
                blog.subtitle.toLowerCase().includes(searchTermLower) ||
                blog.author.toLowerCase().includes(searchTermLower) ||
                blog.category.toLowerCase().includes(searchTermLower) ||
                blog.date.toLowerCase().includes(searchTermLower) ||
                blog.comments.toLowerCase().includes(searchTermLower)
            );
            console.log("Filtered blogs by term:", filtered);
        }

        if (specialization) {
            filtered = filtered.filter(blog => blog.category === specialization);
        }

        setFilteredBlogs(filtered);
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        if (value === '') {
            setFilteredBlogs(allBlogs);
            setHasSearched(false);
            setSelectedSpecialization('');
        } else {
            filterBlogsLocally(value, selectedSpecialization);
            setHasSearched(true);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setHasSearched(true);
        if (allBlogs.length > 0) {
            filterBlogsLocally(searchTerm, selectedSpecialization);
        } else {
            fetchBlogs(searchTerm, selectedSpecialization);
        }
    };

    const handleSpecializationChange = (e) => {
        const value = e.target.value;
        setSelectedSpecialization(value);
        if (allBlogs.length > 0) {
            filterBlogsLocally(searchTerm, value);
        } else {
            fetchBlogs(searchTerm, value);
        }
    };

    const handleCreatePost = () => {
        navigate('create');
    };

    const handleTagChange = (tag) => {
        setActiveTag(tag);
        if (tag === 'my') {
            navigate('/doctor/blog?tag=my');
            fetchMyBlogs();
        } else {
            navigate('/doctor/blog');
            fetchBlogs();
        }
    };

    const handleEditBlog = (blogId) => {
        navigate(`edit/${blogId}`);
    };

    const handleDeleteBlog = async (blogId) => {
        setBlogToDelete(blogId);
        setShowDeleteModal(true);
    };

    const confirmDeleteBlog = async () => {
        if (!blogToDelete) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${import.meta.env.VITE_BE_URL}/blog/${blogToDelete}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShowDeleteModal(false);
            setBlogToDelete(null);

            if (activeTag === 'my') {
                fetchMyBlogs();
            } else {
                fetchBlogs();
            }
        } catch (error) {
            setError('Không thể xóa bài viết. Vui lòng thử lại.');
            setShowDeleteModal(false);
            setBlogToDelete(null);
        }
    };

    return (
        <>
            <div className="container">
                <div className="text-center">
                    <SectionHeading
                        SectionSubtitle={activeTag === 'my' ? "QUẢN LÝ BÀI VIẾT" : data.sectionSubtitle}
                        SectionTitle={activeTag === 'my' ? "Bài viết của tôi" : data.sectionTitle}
                        variant="text-center"
                    />
                    <div style={{
                        maxWidth: '1000px',
                        margin: '0 auto',
                        padding: '15px 0'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '15px',
                            height: '45px'
                        }}>
                            <form
                                onSubmit={handleSearchSubmit}
                                style={{
                                    flex: '2',
                                    minWidth: '200px',
                                    height: '100%',
                                    display: 'flex'
                                }}
                            >
                                <div style={{
                                    display: 'flex',
                                    flex: '1',
                                    height: '100%',
                                    borderRadius: '0.3rem',
                                    overflow: 'hidden',
                                    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)'
                                }}>
                                    <input
                                        type="text"
                                        placeholder={data.searchPlaceholder || "Tìm kiếm bài viết..."}
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                        aria-label="Search"
                                        style={{
                                            flex: '1',
                                            height: '45px',
                                            padding: '0 15px',
                                            border: '1px solid #e0e0e0',
                                            borderRight: 'none',
                                            outline: 'none',
                                            fontSize: '16px',
                                            borderTopLeftRadius: '0.3rem',
                                            borderBottomLeftRadius: '0.3rem'
                                        }}
                                    />
                                    <button
                                        type="submit"
                                        style={{
                                            width: '45px',
                                            height: '45px',
                                            border: 'none',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            backgroundColor: '#007bff',
                                            color: 'white',
                                            borderTopRightRadius: '0.3rem',
                                            borderBottomRightRadius: '0.3rem'
                                        }}
                                    >
                                        <FaMagnifyingGlass />
                                    </button>
                                </div>
                            </form>

                            {isDoctor && (
                                <button
                                    onClick={handleCreatePost}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        height: '45px',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '0 20px',
                                        fontWeight: '500',
                                        backgroundColor: '#007bff',
                                        color: 'white',
                                        borderRadius: '0.3rem',
                                        whiteSpace: 'nowrap',
                                        minWidth: '140px',
                                        transition: 'all 0.3s ease',
                                        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)'
                                    }}
                                >
                                    <FaPlus style={{ marginRight: '0.5rem' }} />
                                    Tạo bài viết
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                {isDoctor && (
                    <div className="cs_blog_tags ">
                        <button
                            className="cs_tag_btn"
                            onClick={() => handleTagChange(activeTag === 'all' ? 'my' : 'all')}
                        >
                            {activeTag === 'all' ? 'Xem bài viết của tôi' : 'Xem tất cả bài viết'}
                        </button>
                    </div>
                )}
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
                        <button className="btn btn-outline-primary mt-3" onClick={() => fetchBlogs()}>
                            Thử lại
                        </button>
                    </div>
                ) : (
                    <>
                        {filteredBlogs && filteredBlogs.length > 0 ? (
                            <div className="cs_posts_grid cs_style_1 p-3">
                                {filteredBlogs.map((blog) => (
                                    <article key={blog.id} className="cs_post cs_style_12">
                                        <Link to={blog.link} className="cs_post_thumbnail position-relative">
                                            <img
                                                src={blog.image}
                                                alt={blog.title || "Post Thumbnail"}
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = '/assets/img/post_1.jpeg';
                                                }}
                                            />
                                            <div className="cs_post_category position-absolute">{blog.category}</div>
                                        </Link>
                                        <div className="cs_post_content position-relative">
                                            <div className="cs_post_meta_wrapper">
                                                <div className="cs_posted_by cs_center position-absolute">{blog.date}</div>
                                                <div className="cs_post_meta_item">
                                                    <img src="/assets/img/icons/post_user_icon.png" alt="Icon" />
                                                    <span>{blog.author}</span>
                                                </div>
                                                <div className="cs_post_meta_item">
                                                    <img src="/assets/img/icons/post_comment_icon.png" alt="Icon" />
                                                    <span>{blog.comments}</span>
                                                </div>
                                            </div>
                                            <h3 className="cs_post_title">
                                                <Link to={blog.link}>{blog.title}</Link>
                                            </h3>
                                            <Link to={blog.link} className="cs_post_btn">
                                                <span>{blog.linkText}</span>
                                                <span><FaAngleRight /></span>
                                            </Link>
                                            {isDoctor && activeTag === 'my' && (
                                                <div className="cs_blog_actions mt-3">
                                                    <button
                                                        className="cs_btn cs_btn_secondary me-2"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            handleEditBlog(blog.id);
                                                        }}
                                                    >
                                                        Chỉnh sửa
                                                    </button>
                                                    <button
                                                        className="cs_btn cs_btn_danger"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            handleDeleteBlog(blog.id);
                                                        }}
                                                    >
                                                        Xóa
                                                    </button>
                                                </div>
                                            )}
                                            <div className="cs_post_shape position-absolute" />
                                        </div>
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center">
                                <p>
                                    {hasSearched
                                        ? `Không tìm thấy bài viết nào phù hợp với từ khóa "${searchTerm}"${selectedSpecialization ? ` và chuyên khoa "${selectedSpecialization}"` : ""
                                        }`
                                        : "Không có bài viết nào để hiển thị."}
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Xác nhận xóa</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="alert alert-danger mb-0">
                        Bạn có muốn xóa bài viết này không?
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Hủy
                    </Button>
                    <Button variant="danger" onClick={confirmDeleteBlog}>
                        Xóa
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default BlogsSection2;