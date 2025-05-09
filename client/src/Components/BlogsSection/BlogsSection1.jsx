import SectionHeading from "../SectionHeading";
import { Link, useLocation } from "react-router-dom";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { useEffect, useState } from "react";
import axios from "axios";
import "../../sass/blog/blogsSection1.scss";
import { FaAngleRight } from "react-icons/fa";

const BlogsSection1 = ({ data }) => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const specializationParam = queryParams.get('specialization');

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBlogs, setFilteredBlogs] = useState(data.blogsData || []);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [specializations, setSpecializations] = useState([]);
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [error, setError] = useState(null);
  const [allBlogs, setAllBlogs] = useState([]);

  useEffect(() => {
    if (data && data.blogsData && data.blogsData.length > 0) {
      setFilteredBlogs(data.blogsData);
      setAllBlogs(data.blogsData);
      extractSpecializations(data.blogsData);
    } else {
      fetchBlogs('', specializationParam || '');
    }
  }, [data, specializationParam]);

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

  const extractSpecializations = (blogs) => {
    const specializationSet = new Set(blogs.map(blog => blog.category).filter(Boolean));
    const formattedSpecializations = Array.from(specializationSet).map(spec => ({
      name: spec,
      value: spec
    }));
    setSpecializations(formattedSpecializations);
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

      const formattedBlogs = blogsArray.map(blog => ({
        id: blog._id,
        category: blog.specialization || 'General',
        date: new Date(blog.createdAt).toLocaleDateString('vi-VN', {
          day: 'numeric', month: 'numeric',
        }),
        author: blog.author?.username || 'Unknown',
        comments: `${blog.comments?.length || 0} Bình luận`,
        title: blog.title,
        subtitle: truncateHTML(blog.content, 50),
        image: blog.media && blog.media.length > 0
          ? blog.media[0].url
          : '/assets/img/post_1.jpeg',
        link: `/blog/${blog._id}`,
        linkText: 'Đọc thêm',
      }));

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
      console.log("Filtered blogs by term:", filtered); // Debug kết quả lọc
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

  return (
    <>
      <div className="container">
        <div className="text-center">
          <SectionHeading
            SectionSubtitle={data.sectionSubtitle}
            SectionTitle={data.sectionTitle}
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

            </div>
          </div>
        </div>
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
                      <div className="cs_post_shape position-absolute" />
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="text-center">
                <p>
                  {hasSearched
                    ? `Không tìm thấy bài viết nào phù hợp với từ khóa "${searchTerm}"${selectedSpecialization ? ` và chuyên khoa "${selectedSpecialization}"` : ""}`
                    : "Không có bài viết nào để hiển thị."}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default BlogsSection1;