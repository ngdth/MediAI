import SectionHeading from "../SectionHeading";
import { Link } from "react-router-dom";
import { FaAngleRight } from "react-icons/fa";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { useEffect, useState } from "react";

const BlogsSection1 = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState('');
  // State để lưu danh sách blog đã được lọc
  const [filteredBlogs, setFilteredBlogs] = useState(data.blogsData);
  // State để theo dõi xem người dùng đã nhấn nút tìm kiếm chưa
  const [hasSearched, setHasSearched] = useState(false);

  // Hàm xử lý khi người dùng nhập vào ô tìm kiếm
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    // Nếu xóa hết dữ liệu trong ô tìm kiếm, tự động reset
    if (value === '') {
      setFilteredBlogs(data.blogsData);
      setHasSearched(false);
    }
    // Nếu người dùng chưa nhấn nút tìm kiếm, thực hiện lọc theo ký tự
    if (!hasSearched) {
      filterBlogs(value);
    }
  };

  // Hàm xử lý khi người dùng nhấn nút tìm kiếm
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setHasSearched(true);
    filterBlogs(searchTerm);
  };
  // Hàm lọc blog dựa trên từ khóa tìm kiếm
  const filterBlogs = (term) => {
    if (term.trim() === '') {
      setFilteredBlogs(data.blogsData);
    } else {
      const filtered = data.blogsData.filter(blog =>
        blog.title.toLowerCase().includes(term.toLowerCase()) ||
        blog.subtitle.toLowerCase().includes(term.toLowerCase()) ||
        blog.category.toLowerCase().includes(term.toLowerCase()) ||
        blog.author.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredBlogs(filtered);
    }
  };

  // Reset lại danh sách blog khi data thay đổi
  useEffect(() => {
    setFilteredBlogs(data.blogsData);
    setSearchTerm('');
    setHasSearched(false);
  }, [data.blogsData]);
  return (
    <>
      <div className="container">
        <div className="">
          <SectionHeading
            SectionSubtitle={data.sectionSubtitle}
            SectionTitle={data.sectionTitle}
            variant={"text-center"}
          />
          <form onSubmit={handleSearchSubmit} className="flex-row gap-0 ">
            <input
              type="text"
              placeholder={data.searchPlaceholder}
              value={searchTerm}
              onChange={handleSearchChange}
              aria-label="Search"
              className=" rounded-start-3 "
            />
            <button
              type="submit"
              className="cs_blue_bg cs_white_color p-2 rounded-end-3"
            >
              <i>
                <FaMagnifyingGlass />
              </i>
            </button>
          </form>
        </div>
        <div className="cs_height_50 cs_height_lg_50" />
        {filteredBlogs.length === 0 ? (
          <div className="text-center">
            <p>Không tìm thấy bài viết nào phù hợp với từ khóa "{searchTerm}"</p>
          </div>
        ) : (
          <div className="cs_posts_grid cs_style_1">
            {filteredBlogs.map((blog) => (
              <article key={blog.id} className="cs_post cs_style_1">
                <Link
                  to={blog.link}
                  className="cs_post_thumbnail position-relative"
                >
                  <img src={blog.image} alt="Post Thumbnail" />
                  <div className="cs_post_category position-absolute">
                    {blog.category}
                  </div>
                </Link>
                <div className="cs_post_content position-relative">
                  <div className="cs_post_meta_wrapper">
                    <div className="cs_posted_by cs_center position-absolute">
                      {blog.date}
                    </div>
                    <div className="cs_post_meta_item">
                      <img src="assets/img/icons/post_user_icon.png" alt="Icon" />
                      <span>By: {blog.author}</span>
                    </div>
                    <div className="cs_post_meta_item">
                      <img
                        src="assets/img/icons/post_comment_icon.png"
                        alt="Icon"
                      />
                      <span>{blog.comments}</span>
                    </div>
                  </div>
                  <h3 className="cs_post_title">
                    <Link to={blog.link}>{blog.title}</Link>
                  </h3>
                  <p className="cs_post_subtitle">{blog.subtitle}</p>
                  <Link to={blog.link} className="cs_post_btn">
                    <span>{blog.linkText}</span>
                    <span>
                      <i>
                        <FaAngleRight />
                      </i>
                    </span>
                  </Link>
                  <div className="cs_post_shape position-absolute" />
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default BlogsSection1;
