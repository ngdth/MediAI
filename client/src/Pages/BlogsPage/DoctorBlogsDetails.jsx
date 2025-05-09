import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import Section from '../../Components/Section';
import DoctorBlogsLeft from './BlogsDetailsSide/DoctorBlogsLeft';
import DoctorBlogsRight from './BlogsDetailsSide/DoctorBlogsRight';

const DoctorBlogsDetails = () => {
    const { blogId } = useParams();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [recentPosts, setRecentPosts] = useState([]);
    const [specializations, setSpecializations] = useState([]);
    const [isDoctor, setIsDoctor] = useState(false);
    const role = localStorage.getItem('role');
    const location = useLocation();

    const [refreshCounter, setRefreshCounter] = useState(0);
    const processImagePath = (imagePath) => {
        if (!imagePath) return '/assets/img/post_details_1.jpeg';
        if (imagePath.startsWith('http')) return imagePath;

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

            const blogResponse = await axios.get(`${import.meta.env.VITE_BE_URL}/blog/${blogId}`, { headers });
            console.log("Blog content from server:", blogResponse.data.content);
            const blogData = blogResponse.data;

            const authorResponse = await axios.get(
                `${import.meta.env.VITE_BE_URL}/user/user/${blogData.author._id}`,
                { headers }
            );
            const authorData = authorResponse.data.user;

            setBlog({
                ...blogData,
                media: blogData.media.map((mediaItem) => ({
                    ...mediaItem,
                    url: processImagePath(mediaItem.url),
                })),
                author: {
                    ...blogData.author,
                    ...authorData
                }
            });

            const authorId = blogResponse.data.author._id;

            const recentPostsResponse = await axios.get(`${import.meta.env.VITE_BE_URL}/blog`, {
                headers,
                params: {
                    authorId: authorId,
                    limit: 5,
                    sortBy: 'createdAt',
                    order: 'desc'
                }
            });

            const formattedRecentPosts = recentPostsResponse.data
                .filter(post => post._id !== blogId)
                .slice(0, 3)
                .map(post => ({
                    imgSrc: processImagePath(post.media?.[0]?.url) || '/assets/img/post_details_1.jpeg',
                    date: new Date(post.createdAt).toLocaleDateString('en-US', {
                        day: 'numeric', month: 'numeric', year: 'numeric'
                    }),
                    title: post.title,
                    link: `/doctor/blog/${post._id}`, // Đổi thành đường dẫn bác sĩ
                    commentsCount: post.comments?.length || 0,
                    likesCount: post.likes?.length || 0,
                    unlikesCount: post.unlikes?.length || 0,
                }));

            setRecentPosts(formattedRecentPosts);

            setSpecializations([
                {
                    name: blogResponse.data.specialization,
                    link: `/doctor/blogs?specialization=${blogResponse.data.specialization}` // Đổi thành đường dẫn bác sĩ
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

    useEffect(() => {
        fetchBlogDetails();
    }, [blogId]);

    const handleAddComment = async (commentText) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${import.meta.env.VITE_BE_URL}/blog/${blogId}/comments`,
                { content: commentText },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const currentUser = JSON.parse(localStorage.getItem('user')) || {};
            setIsDoctor(currentUser.role === 'doctor');

            const newComment = {
                ...response.data,
                user: {
                    ...response.data.user,
                    avatar: response.data.user?.avatar || currentUser.avatar,
                    username: response.data.user?.username || currentUser.username || 'Tôi'
                }
            };

            setBlog(prev => ({
                ...prev,
                comments: [...prev.comments, newComment]
            }));
        } catch (error) {
            console.error('Error adding comment:', error);
            throw error;
        }
    };

    const handleLikeComment = async (commentId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `${import.meta.env.VITE_BE_URL}/blog/${blogId}/comments/${commentId}/like`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            updateCommentState(response.data.data);
            return response.data;
        } catch (error) {
            console.error('Error liking comment:', error);
        }
    };

    const handleUnlikeComment = async (commentId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `${import.meta.env.VITE_BE_URL}/blog/${blogId}/comments/${commentId}/unlike`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            updateCommentState(response.data.data);
            return response.data;
        } catch (error) {
            console.error('Error unliking comment:', error);
        }
    };

    const handleReplyComment = async (commentId, replyText) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${import.meta.env.VITE_BE_URL}/blog/${blogId}/comments/${commentId}/replies`,
                { content: replyText },
                { headers: { Authorization: `Bearer ${token}` } }
            );
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
                            const oldReply = comment.replies[index];
                            return oldReply ? {
                                ...updatedReply,
                                user: oldReply.user
                            } : updatedReply;
                        }) || [],
                        likes: updatedComment.likes,
                        unlikes: updatedComment.unlikes,
                    };
                }
                return comment;
            });
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
                subtitle: 'We are privileged to work with healthcare professionals',
                avatarSrc: blog.author?.imageUrl || '/assets/img/avatar_1.png',
                avatarAlt: 'Avatar',
                avatarName: blog.author?.username || 'Unknown',
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

    const formatRightSideData = () => {
        return {
            searchPlaceholder: 'Tìm kiếm....',
            secTitle: 'Chuyên khoa',
            service: {
                backgroundImage: '/assets/img/suegery_overlay.jpg',
                icon: '/assets/img/icons/service_icon_19.png',
                title: 'Bài viết y tế',
                subtitle: 'Khám phá những thông tin mới nhất về chăm sóc sức khỏe',
                link: '/doctor/blog',
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
                                <DoctorBlogsLeft
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
                                <DoctorBlogsRight data={rightSideData} blogData={blog} />
                            </div>
                        </div>
                    </div>
                )}
            </Section>
        </>
    );
};
export default DoctorBlogsDetails;