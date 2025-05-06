import React, { useState, useEffect } from "react";
import { FaCalendarAlt, FaChevronCircleRight, FaUser, FaComments, FaThumbsUp, FaThumbsDown } from "react-icons/fa";
import { FaArrowRightLong, FaMagnifyingGlass } from "react-icons/fa6";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import '../../../sass/blog/blogsSection1.scss';

const BlogsRight = ({ data, blogData }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const [localBlogData, setLocalBlogData] = useState(blogData);

  useEffect(() => {
    setLocalBlogData(blogData);
  }, [blogData]);
  // Kiểm tra dữ liệu để tránh lỗi
  if (!data) {
    return <aside className="col-lg-4">
      <div className="cs_height_0 cs_height_lg_50" />
      <div className="cs_sidebar cs_style_1">
        <p>Đang tải dữ liệu...</p>
      </div>
    </aside>;
  }

  return (
    <>
      <aside className="col-lg-4">
        <div className="cs_height_0 cs_height_lg_50" />
        <div className="cs_sidebar cs_style_1">
          {/* Service */}
          {data.service && (
            <div
              className="cs_sidebar_widget cs_service cs_bg_filed"
              style={{
                backgroundImage: `url(${data.service.backgroundImage})`,
              }}
            >
              <div className="cs_iconbox cs_style_11">
                <div className="cs_iconbox_icon cs_center">
                  <img src={data.service.icon} alt="Icon" />
                </div>
                <h3 className="cs_iconbox_title cs_white_color">
                  {data.service.title}
                </h3>
                <p className="cs_iconbox_subtitle cs_white_color">
                  {data.service.subtitle}
                </p>
                <Link to={data.service.link} className="cs_iconbox_btn cs_center">
                  <i><FaChevronCircleRight /></i>
                </Link>
              </div>
            </div>
          )}

          {/* Recent Posts */}
          <div className="cs_sidebar_widget cs_radius_15">
            <h3 className="cs_sidebar_title">Bài viết gần đây</h3>
            {data.recentPosts && data.recentPosts.length > 0 ? (
              data.recentPosts.map((post, index) => (
                <div key={index} className="cs_post cs_style_2">
                  <Link
                    to={post.link || `#`}
                    className="cs_post_thumb_thumbnail cs_type_2 cs_zoom"
                  >
                    <img
                      src={post.imgSrc.startsWith('/src')
                        ? `${import.meta.env.VITE_BE_URL}${post.imgSrc.replace('/src', '')}`
                        : post.imgSrc}
                      alt={post.title || "Blog post"}
                      className="cs_zoom_in"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/assets/img/post_details_1.jpeg';
                      }}
                    />
                  </Link>
                  <div className="cs_post_info">
                    <div className="cs_post_meta">
                      <i><FaCalendarAlt /></i>
                      {post.date || (post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'No date')}

                      {post.author && (
                        <span className="cs_post_author">
                          <i><FaUser /></i>
                          {post.author.username || 'Unknown author'}
                        </span>
                      )}
                    </div>
                    <h3 className="cs_post_title ">
                      <Link to={post.link || `#`}>{post.title || "Untitled"}</Link>
                    </h3>

                    {/* Post stats - giữ lại nhưng áp dụng CSS mới */}
                    <div className="cs_post_meta cs_fs_14 cs_medium mt-2">
                      <span><i><FaComments /></i> {post.commentsCount || 0}</span>
                      <span><i><FaThumbsUp /></i> {post.likesCount || 0}</span>
                      <span><i><FaThumbsDown /></i> {post.unlikesCount || 0}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>Không tìm thấy bài viết</p>
            )}
          </div>

          {/* Blog Stats - Thêm phần hiển thị thống kê của bài viết hiện tại */}
          {/* {localBlogData && (
            <div className="cs_sidebar_widget cs_radius_15">
              <h3 className="cs_sidebar_title">Thống kê bài viết</h3>
              <div className="cs_blog_stats">
                <div className="cs_stat_item">
                  <i><FaComments /></i>
                  <span>Bình luận: {localBlogData.comments?.length || 0}</span>
                </div>
                <div className="cs_stat_item">
                  <i><FaThumbsUp /></i>
                  <span>Lượt thích: {localBlogData.likes?.length || 0}</span>
                </div>
                <div className="cs_stat_item">
                  <i><FaThumbsDown /></i>
                  <span>Không thích: {localBlogData.unlikes?.length || 0}</span>
                </div>
              </div>
            </div>
          )} */}

          {/* Categories */}
          {data.secTitle && data.categories && (
            <div className="cs_sidebar_widget cs_radius_15">
              <h3 className="cs_sidebar_title">{data.secTitle}</h3>
              <ul className="cs_categories cs_mp0">
                {data.categories.map((category, index) => (
                  <li key={index}>
                    <Link
                      to={`/blogs?specialization=${encodeURIComponent(category.name)}`}
                      className="cs_category_link"
                    >
                      <i><FaArrowRightLong /></i>
                      {category.name || "Category"}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tags */}
          {data.secTitle2 && data.tags && (
            <div className="cs_sidebar_widget cs_radius_15">
              <div className="cs_sidebar_tags">
                <h3 className="cs_sidebar_title">{data.secTitle2}</h3>
                <div className="cs_tag_list">
                  {data.tags.map((tag, index) => (
                    <Link key={index} to={tag.tagUrl || "#"} className="cs_tag_link">
                      {tag.tagTitle || "Tag"}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default BlogsRight;

