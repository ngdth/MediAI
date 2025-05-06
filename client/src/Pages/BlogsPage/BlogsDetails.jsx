import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import PageHeading from '../../Components/PageHeading';
import Section from '../../Components/Section';
import BlogsLeft from './BlogsDetailsSide/BlogsLeft';
import BlogsRight from './BlogsDetailsSide/BlogsRight';

const headingData = {
  title: 'Chi tiết Blog',
};

const BlogsDetails = () => {
  const { blogId } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentPosts, setRecentPosts] = useState([]);
  const [specializations, setSpecializations] = useState([]);

  const [refreshCounter, setRefreshCounter] = useState(0); // Thêm state này
  // Hàm gọi API để lấy chi tiết blog và các dữ liệu liên quan
  const processImagePath = (imagePath) => {
    if (!imagePath) return '/assets/img/post_details_1.jpeg';
    if (imagePath.startsWith('http')) return imagePath;

    // Xử lý đường dẫn từ server
    if (imagePath.startsWith('/src/uploads') || imagePath.startsWith('/uploads')) {
      return `${import.meta.env.VITE_BE_URL}${imagePath.replace('/src', '')}`;
    }

    return imagePath;
  };

  const fetchBlogDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Gọi API lấy chi tiết blog
      const blogResponse = await axios.get(`${import.meta.env.VITE_BE_URL}/blog/${blogId}`, { headers });
      console.log("Blog content from server:", blogResponse.data.content);
      const blogData = blogResponse.data;

      const authorResponse = await axios.get(
        `${import.meta.env.VITE_BE_URL}/user/user/${blogData.author._id}`, // Sử dụng _id thay vì $oid
        { headers }
      );
      const authorData = authorResponse.data.user;

      // Cập nhật state blog với thông tin tác giả đầy đủ
      setBlog({
        ...blogData,
        media: blogData.media.map((mediaItem) => ({
          ...mediaItem,
          url: processImagePath(mediaItem.url), // Sử dụng processImagePath để xử lý đường dẫn ảnh
        })),
        author: {
          ...blogData.author,
          ...authorData // Merge thông tin chi tiết từ API user
        }
      });
      // Lấy ID của tác giả từ blog để lấy các bài viết khác của tác giả này
      const authorId = blogResponse.data.author._id;

      // Gọi API lấy các bài viết gần đây của cùng tác giả
      const recentPostsResponse = await axios.get(`${import.meta.env.VITE_BE_URL}/blog`, {
        headers,
        params: {
          authorId: authorId,
          limit: 5,
          sortBy: 'createdAt',
          order: 'desc'
        }
      });

      // Định dạng dữ liệu bài viết gần đây
      const formattedRecentPosts = recentPostsResponse.data
        .filter(post => post._id !== blogId) // Loại bỏ bài viết hiện tại
        .slice(0, 3) // Giới hạn 3 bài viết
        .map(post => ({
          imgSrc: processImagePath(post.media?.[0]?.url) || '/assets/img/post_details_1.jpeg',
          date: new Date(post.createdAt).toLocaleDateString('en-US', {
            day: 'numeric', month: 'numeric', year: 'numeric'
          }),
          title: post.title,
          link: `/blog/${post._id}`,
          commentsCount: post.comments?.length || 0,
          likesCount: post.likes?.length || 0,
          unlikesCount: post.unlikes?.length || 0,
        }));

      setRecentPosts(formattedRecentPosts);

      // Lấy danh sách chuyên khoa từ blog hiện tại
      // Nếu cần danh sách đầy đủ các chuyên khoa, có thể gọi API riêng
      setSpecializations([
        {
          name: blogResponse.data.specialization,
          link: `/blogs?specialization=${blogResponse.data.specialization}`
        },
      ]);

      setError(null);
    } catch (err) {
      console.error("Error fetching blog details:", err);
      setError(err.response?.data?.message || "Failed to fetch blog details. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Gọi API khi component mount hoặc blogId thay đổi
  useEffect(() => {
    fetchBlogDetails();
  }, [blogId]);

  // Xử lý thêm bình luận
  const handleAddComment = async (commentText) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_BE_URL}/blog/${blogId}/comments`,
        { content: commentText }, // Sử dụng 'content' thay vì 'text'
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const currentUser = JSON.parse(localStorage.getItem('user')) || {};

      const newComment = {
        ...response.data,
        user: {
          ...response.data.user,
          avatar: response.data.user?.avatar || currentUser.avatar,
          username: response.data.user?.username || currentUser.username || 'Tôi'
        }
      };

      // fetchBlogDetails();
      setBlog(prev => ({
        ...prev,
        comments: [...prev.comments, newComment]
      }));
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  };


  // Xử lý thích bình luận
  const handleLikeComment = async (commentId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${import.meta.env.VITE_BE_URL}/blog/${blogId}/comments/${commentId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // fetchBlogDetails();
      updateCommentState(response.data.data);
      return response.data;
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  // Xử lý bỏ thích bình luận
  const handleUnlikeComment = async (commentId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${import.meta.env.VITE_BE_URL}/blog/${blogId}/comments/${commentId}/unlike`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // fetchBlogDetails();
      updateCommentState(response.data.data);
      return response.data;
    } catch (error) {
      console.error('Error unliking comment:', error);
    }
  };

  // Xử lý trả lời bình luận
  const handleReplyComment = async (commentId, replyText) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_BE_URL}/blog/${blogId}/comments/${commentId}/replies`,
        { content: replyText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // fetchBlogDetails();
      setBlog(prev => {
        const newComments = prev.comments.map(comment => {
          if (comment._id === commentId) {
            return {
              ...comment,
              replies: [...comment.replies, response.data]
            };
          }
          return comment;
        });
        return { ...prev, comments: newComments };
      });
    } catch (error) {
      console.error('Error replying to comment:', error);
      throw error;
    }
  };

  const updateCommentState = (updatedComment) => {
    setBlog(prev => {
      const newComments = prev.comments.map(comment => {
        if (comment._id === updatedComment._id) {
          return {
            ...updatedComment,
            user: comment.user,
            replies: updatedComment.replies?.map((updatedReply, index) => {
              // Giữ lại user data cho mỗi reply
              const oldReply = comment.replies[index];
              return oldReply ? {
                ...updatedReply,
                user: oldReply.user // Giữ lại user data từ reply cũ
              } : updatedReply;
            }) || [],
            likes: updatedComment.likes,
            unlikes: updatedComment.unlikes,
          };
        }
        return comment;
      }
      );
      return { ...prev, comments: newComments };
    });
  };

  const handleLikeReply = async (commentId, replyId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${import.meta.env.VITE_BE_URL}/blog/${blogId}/comments/${commentId}/replies/${replyId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      updateReplyState(commentId, replyId, response.data.data);
    } catch (error) {
      console.error('Error liking reply:', error);
    }
  };

  const handleUnlikeReply = async (commentId, replyId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${import.meta.env.VITE_BE_URL}/blog/${blogId}/comments/${commentId}/replies/${replyId}/unlike`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      updateReplyState(commentId, replyId, response.data.data);
    } catch (error) {
      console.error('Error unliking reply:', error);
    }
  };

  // Hàm cập nhật state cho reply
  const updateReplyState = (commentId, replyId, updatedReply) => {
    setBlog(prev => ({
      ...prev,
      comments: prev.comments.map(comment => {
        if (comment._id === commentId) {
          return {
            ...comment,
            replies: comment.replies.map(reply =>
              reply._id === replyId ? { ...reply, ...updatedReply } : reply
            )
          };
        }
        return comment;
      })
    }));
  };

  // Định dạng dữ liệu cho BlogsLeft
  const formatLeftSideData = () => {
    if (!blog) return null;
    const totalInteractions = (blog.likes?.length || 0) + (blog.unlikes?.length || 0);

    return {
      imageSrc: processImagePath(blog.media?.[0]?.url) || '/assets/img/post_details_1.jpeg',
      imageAlt: blog.title,
      text: blog.specialization || 'GENERAL',
      secText: new Date(blog.createdAt).toLocaleDateString('en-US', {
        day: 'numeric', month: 'numeric', year: 'numeric'
      }),
      thirdSecTitle: blog.title,
      content: blog.content,
      testimonial: {
        // rating: 4,
        subtitle: 'We are privileged to work with healthcare professionals',
        avatarSrc: blog.author?.imageUrl || '/assets/img/avatar_1.png',
        avatarAlt: 'Avatar',
        avatarName: blog.author?.username || 'Unknown',
        // avatarTitle: 'Author',
      },
      card: {
        title: 'Thông tin bài viết',
        subtitle: blog.specialization || 'Chuyên khoa',
        progress: {
          likes: {
            label: 'Thích',
            count: blog.likes?.length || 0,
            percentage: totalInteractions > 0 ? Math.round((blog.likes?.length / totalInteractions) * 100) : 0,
          },
          unlikes: {
            label: 'không thích',
            count: blog.unlikes?.length || 0,
            percentage: totalInteractions > 0 ? Math.round((blog.unlikes?.length / totalInteractions) * 100) : 0,
          },
        },
      },
      commentTitle: `Bình luận (${blog.comments?.length || 0})`,
      comments: blog.comments?.map(comment => ({
        id: comment._id,
        avatarSrc: comment.user?.avatar || comment.user?.imageUrl || '/assets/img/avatar_2.png',
        avatarAlt: 'Avatar',
        name: comment.user?.username || 'Anonymous',
        text: comment.content,
        date: new Date(comment.createdAt).toLocaleDateString('vi-VN', {
          day: 'numeric', month: 'numeric', year: 'numeric',
        }),
        time: new Date(comment.createdAt).toLocaleTimeString('en-US', {
          hour: '2-digit', minute: '2-digit',
        }),
        replay: 'Trả lời',
        link: '/',
        likes: comment.likes?.length || 0,
        unlikes: comment.unlikes?.length || 0,
        replies: comment.replies?.map(reply => ({
          id: reply._id,
          avatarSrc: reply.user?.imageUrl || '/assets/img/avatar_3.png',
          avatarAlt: 'Avatar',
          name: reply.user?.username || 'Anonymous',
          text: reply.content,
          likes: reply.likes?.length || 0,
          unlikes: reply.unlikes?.length || 0,
          date: new Date(reply.createdAt).toLocaleDateString('vi-VN', {
            day: 'numeric', month: 'numeric', year: 'numeric'
          }),
          time: new Date(reply.createdAt).toLocaleTimeString('en-US', {
            hour: '2-digit', minute: '2-digit'
          }),
        })) || [],
      })) || [],
    };
  };

  // Định dạng dữ liệu cho BlogsRight
  const formatRightSideData = () => {
    return {
      searchPlaceholder: 'Tìm kiếm....',
      secTitle: 'Chuyên khoa',
      service: {
        backgroundImage: '/assets/img/suegery_overlay.jpg',
        icon: '/assets/img/icons/service_icon_19.png',
        title: 'Bài viết y tế',
        subtitle: 'Khám phá những thông tin mới nhất về chăm sóc sức khỏe',
        link: '/blog',
      },
      commentCount: blog?.comments?.length || 0,
      recentPosts: recentPosts,
      categories: specializations,
    };
  };

  const leftSideData = formatLeftSideData();
  const rightSideData = formatRightSideData();

  return (
    <>
      {/* Apply the optimized CSS structure */}
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

      {/* Start Blog Details Section with optimized spacing */}
      <Section
        topSpaceLg="80"
        topSpaceMd="120"
        bottomSpaceLg="80"
        bottomSpaceMd="120"
      >
        {loading ? (
          <div className="container">
            <div className="text-center py-5">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Đang tải...</span>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="container">
            <div className="alert alert-danger text-center" role="alert">
              {error}
              <button
                className="btn btn-outline-primary mt-3"
                onClick={fetchBlogDetails}
              >
                Thử lại
              </button>
            </div>
          </div>
        ) : (
          <div className="container">
            <div className="row">
              <div className="col-lg-8">
                <BlogsLeft
                  key={blogId}
                  data={leftSideData}
                  blogId={blogId}
                  setBlog={setBlog}
                  onAddComment={handleAddComment}
                  onReplyComment={handleReplyComment}
                  onLikeComment={handleLikeComment}
                  onUnlikeComment={handleUnlikeComment}
                  onRefresh={fetchBlogDetails}
                  onLikeReply={handleLikeReply}
                  onUnlikeReply={handleUnlikeReply}
                />
              </div>
              <div className="col-lg-4">
                <BlogsRight data={rightSideData} blogData={blog} />
              </div>
            </div>
          </div>
        )}
      </Section>
      {/* End Blog Details Section */}
    </>
  );
};
export default BlogsDetails;