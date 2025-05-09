import { Rating } from '@smastrom/react-rating';
import { useEffect, useState } from 'react';
import { FaCalendarAlt, FaUser, FaThumbsUp, FaThumbsDown, FaReply, FaTags } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import axios from 'axios';

const DoctorBlogsLeft = ({ data, blogId, setBlog, onUnlikeReply, onLikeReply, onAddComment, onReplyComment, onLikeComment, onUnlikeComment }) => {
    const [commentText, setCommentText] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [liking, setLiking] = useState(false);

    if (!data) return null;

    const [likePercentage, setLikePercentage] = useState(0);
    const [unlikePercentage, setUnlikePercentage] = useState(0);
    const [localLikes, setLocalLikes] = useState(data.card.progress.likes.count || 0);
    const [localUnlikes, setLocalUnlikes] = useState(data.card.progress.unlikes.count || 0);
    const [hasLiked, setHasLiked] = useState(false);
    const [hasUnliked, setHasUnliked] = useState(false);

    useEffect(() => {
        console.log('Local likes/unlikes changed:', localLikes, localUnlikes);
        const likes = Number(localLikes) || 0;
        const unlikes = Number(localUnlikes) || 0;
        const totalInteractions = likes + unlikes;
        const newLikePercent = totalInteractions > 0
            ? Math.round((localLikes / totalInteractions) * 100)
            : 0;
        const newUnlikePercent = totalInteractions > 0
            ? Math.round((localUnlikes / totalInteractions) * 100)
            : 0;

        setLikePercentage(newLikePercent);
        setUnlikePercentage(newUnlikePercent);
    }, [localLikes, localUnlikes]);

    // Hàm xử lý like bài viết
    const handleLikeBlog = async () => {
        if (hasLiked) return;
        try {
            setLiking(true);
            const token = localStorage.getItem('token');
            const response = await axios.put(`http://localhost:8080/blog/${blogId}/like`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log('Like response:', response.data);
            const updatedBlog = response.data;
            setLocalLikes(updatedBlog.likesCount ?? localLikes);
            setLocalUnlikes(updatedBlog.unlikesCount ?? localUnlikes);
            setHasLiked(true); // Đã thích
            setHasUnliked(false); // Không còn không thích
        } catch (err) {
            console.error("Error liking blog:", err);
            setError("Failed to like blog. Please try again.");
        } finally {
            setLiking(false);
        }
    };

    // Hàm xử lý unlike bài viết
    const handleUnlikeBlog = async () => {
        if (hasUnliked) return;
        try {
            setLiking(true);
            const token = localStorage.getItem('token');
            const response = await axios.put(`http://localhost:8080/blog/${blogId}/unlike`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log('Unlike response:', response.data);
            const updatedBlog = response.data;
            setLocalLikes(updatedBlog.likesCount ?? localLikes);
            setLocalUnlikes(updatedBlog.unlikesCount ?? localUnlikes);
            setHasLiked(false); // Không còn thích
            setHasUnliked(true); // Đã không thích
        } catch (err) {
            console.error("Error unliking blog:", err);
            setError("Failed to unlike blog. Please try again.");
        } finally {
            setLiking(false);
        }
    };

    // Hàm xử lý comment
    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        try {
            setSubmitting(true);
            if (typeof onAddComment === 'function') {
                await onAddComment(commentText);
            } else {
                const token = localStorage.getItem('token');
                await axios.post(`http://localhost:8080/blog/${blogId}/comments`,
                    { text: commentText },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (typeof onRefresh === 'function') {
                    onRefresh();
                }
            }
            setCommentText('');
            setError(null);
        } catch (error) {
            console.error('Failed to submit comment:', error);
            setError("Failed to post comment. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleCommentReaction = async (commentId, action) => {
        try {
            const response = await (action === 'like'
                ? onLikeComment(commentId)
                : onUnlikeComment(commentId));

            if (response?.success) {
                setBlog(prev => ({
                    ...prev,
                    comments: prev.comments.map(comment =>
                        comment._id === commentId ? response.data : comment
                    )
                }));
            }
        } catch (error) {
            // ✅ Hiển thị message từ backend nếu có
            const errorMessage = error.response?.data?.message || `Thao tác ${action} thất bại`;
            setError(errorMessage);
            console.error(`Error ${action} comment:`, error);
        }
    };

    // Hàm xử lý reply comment
    const handleReply = (commentId) => {
        setReplyingTo(commentId);
        setReplyText('');
        setError(null);
    };

    // Hàm gửi reply
    const handleReplySubmit = async (e, commentId) => {
        e.preventDefault();
        if (!replyText.trim()) return;
        setSubmitting(true);
        try {
            if (typeof onReplyComment === 'function') {
                await onReplyComment(commentId, replyText);
            } else {
                const token = localStorage.getItem('token');
                await axios.post(
                    `http://localhost:8080/blog/${blogId}/comments/${commentId}/replies`,
                    { content: replyText },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (typeof onRefresh === 'function') {
                    onRefresh();
                }
            }
            setReplyingTo(null);
            setReplyText('');
            setError(null);
        } catch (err) {
            console.error("Error posting reply:", err);
            setError("Failed to post reply. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    // Hàm hủy reply
    const cancelReply = () => {
        setReplyingTo(null);
        setReplyText('');
        setError(null);
    };

    return (
        <>
            <div className="container">
                <div className="cs_post_details cs_style_1">
                    {/* Main Image */}
                    <div className="cs_post_thumb_thumbnail">
                        <img src={data.imageSrc} alt={data.imageAlt} />
                    </div>
                    <h3 className="cs_post_title">{data.thirdSecTitle}</h3>

                    {/* Post Meta */}
                    <ul className="cs_post_meta cs_mp0">
                        <li>
                            <i><FaTags /></i>
                            {data.text}
                        </li>
                        <li>
                            <i><FaCalendarAlt /></i>
                            {data.secText}
                        </li>
                    </ul>

                    <div className="cs_height_27 cs_height_lg_10" />

                    {/* Post Content */}
                    <div
                        className="blog-content"
                        dangerouslySetInnerHTML={{ __html: data.content }}
                        style={{
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                        }}
                    />

                    {/* Testimonial and Card Section */}
                    <div className="row cs_row_gap_30 cs_gap_y_30">
                        <div className="col-md-7">
                            <div className="cs_testimonial cs_style_12 cs_type_12">
                                <div className="cs_testimonial_info">
                                    <div className="cs_avatar cs_style_1 p-3">
                                        <div className="cs_avatar_thumbnail cs_center">
                                            <img
                                                src={data.testimonial.avatarSrc}
                                                alt={data.testimonial.avatarAlt}
                                            />
                                        </div>
                                        <div className="cs_avatar_info">
                                            <h3 className="cs_avatar_title">
                                                {data.testimonial.avatarName}
                                            </h3>
                                            <p className="cs_avatar_subtitle mb-0">
                                                {data.testimonial.avatarTitle}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="cs_rating_container">
                                        <button
                                            className="cs_btn cs_style_1 cs_color_1 cs_size_sm me-2"
                                            onClick={handleLikeBlog}
                                            disabled={liking}
                                        >
                                            <FaThumbsUp className="me-1" />
                                            Thích
                                            ({localLikes})
                                        </button>
                                        <button
                                            className="cs_btn cs_style_1 cs_color_2 cs_size_sm"
                                            onClick={handleUnlikeBlog}
                                            disabled={liking}
                                        >
                                            <FaThumbsDown className="me-1" />
                                            Không thích
                                            ({localUnlikes})
                                        </button>
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Blog Info Card */}
                        <div className="col-md-5">
                            <div className="cs_card cs_style_8">
                                <h3 className="cs_card_title">{data.card.title}</h3>
                                <p className="cs_card_subtitle">{data.card.subtitle}</p>
                                <div className="cs_progress_bar_wrapper">
                                    <div className="cs_progress_item">
                                        <div className="cs_progress_head">
                                            <span>{data.card.progress.likes.label}</span>
                                            <span>{likePercentage}%</span>
                                        </div>
                                        <div className="cs_progress">
                                            <div
                                                className="cs_progress_in"
                                                style={{ width: `${likePercentage}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="cs_progress_item">
                                        <div className="cs_progress_head">
                                            <span>{data.card.progress.unlikes.label}</span>
                                            <span>{unlikePercentage}%</span>
                                        </div>
                                        <div className="cs_progress">
                                            <div
                                                className="cs_progress_in"
                                                style={{ width: `${unlikePercentage}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="cs_height_30 cs_height_lg_30" />

                    {/* Comments Section */}
                    <h2 className="cs_reply_title mb-0">{data.commentTitle}</h2>

                    {data.comments && data.comments.length > 0 ? (
                        <ul className="cs_comment_list cs_mp0">
                            {data.comments.map((comment, index) => (
                                <li className="cs_comment_body" key={index}>
                                    <div className="cs_comment_thumbnail">
                                        <img
                                            src={comment.avatarSrc}
                                            alt={comment.avatarAlt}
                                            className="cs_radius_5"
                                            onError={(e) => {
                                                e.target.onerror = null; // Tránh lặp vô hạn
                                                e.target.src = '/assets/img/avatar_2.png'; // Ảnh mặc định
                                            }}
                                        />
                                    </div>
                                    <div className="cs_comment_info">
                                        <h3>{comment.name}</h3>
                                        <p>{comment.text}</p>
                                        <div className="cs_comment_meta_wrapper">
                                            <div className="cs_comment_date gap-4">
                                                <span>{comment.date}</span>
                                                <span>{comment.time}</span>
                                            </div>

                                            {/* Comment Actions */}
                                            <div className="cs_comment_actions">
                                                <button
                                                    className="cs_btn cs_style_12 cs_color_1 cs_size_xs me-2"
                                                    onClick={() => handleCommentReaction(comment.id, 'like')}
                                                >
                                                    <FaThumbsUp className="me-1" />
                                                    {comment.likes || 0}
                                                </button>
                                                <button
                                                    className="cs_btn cs_style_12 cs_color_2 cs_size_xs me-2"
                                                    onClick={() => handleCommentReaction(comment.id, 'unlike')}
                                                >
                                                    <FaThumbsDown className="me-1" />
                                                    {comment.unlikes || 0}
                                                </button>
                                                <button
                                                    className="cs_reply_btn cs_accent_color"
                                                    onClick={() => handleReply(comment.id)}
                                                >
                                                    <FaReply className="me-1" /> {comment.replay || 'Reply'}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Reply Form */}
                                        {replyingTo === comment.id && (
                                            <div className="cs_reply_form_container cs_mt_15">
                                                <textarea
                                                    className="cs_form_field"
                                                    rows="3"
                                                    value={replyText}
                                                    onChange={(e) => setReplyText(e.target.value)}
                                                    placeholder="Viết phản hồi của bạn..."
                                                ></textarea>

                                                {error && (
                                                    <div className="cs_alert cs_error cs_mt_10">
                                                        {error}
                                                    </div>
                                                )}

                                                <div className="cs_mt_15">
                                                    <button
                                                        className="cs_btn cs_style_1 cs_color_1 cs_size_sm me-2"
                                                        onClick={(e) => handleReplySubmit(e, comment.id)}
                                                        disabled={submitting}
                                                    >
                                                        {submitting ? 'Đang gửi...' : 'Gửi phản hồi'}
                                                    </button>
                                                    <button
                                                        className="cs_btn cs_style_1 cs_color_2 cs_size_sm"
                                                        onClick={cancelReply}
                                                        disabled={submitting}
                                                    >
                                                        Hủy
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Display Replies */}
                                        {comment.replies && comment.replies.length > 0 && (
                                            <div className="cs_replies_container">
                                                <ul className="cs_mp0">
                                                    {comment.replies.map((reply, replyIndex) => (
                                                        <li className="cs_comment_body cs_reply_item" key={replyIndex}>
                                                            <div className="cs_comment_thumbnail">
                                                                <img
                                                                    src={reply.avatarSrc || '/assets/img/avatar_3.png'}
                                                                    alt={reply.avatarAlt || "Reply Author"}
                                                                    className="cs_radius_5"
                                                                    onError={(e) => {
                                                                        e.target.onerror = null;
                                                                        e.target.src = '/assets/img/avatar_2.png';
                                                                    }}
                                                                />
                                                            </div>
                                                            <div className="cs_comment_info">
                                                                <h3>{reply.name || 'Anonymous'}</h3>
                                                                <p>{reply.text}</p>
                                                                <div className="cs_comment_meta_wrapper">
                                                                    <div className="cs_comment_date">
                                                                        <span>{reply.date}</span>
                                                                        {reply.time && <span>{reply.time}</span>}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="cs_comment_actions">
                                                                <button
                                                                    className="cs_btn cs_style_12 cs_color_1 cs_size_xs me-2"
                                                                    onClick={() => onLikeReply(comment.id, reply.id)}
                                                                >
                                                                    <FaThumbsUp className="me-1" />
                                                                    {reply.likes || 0}
                                                                </button>
                                                                <button
                                                                    className="cs_btn cs_style_12 cs_color_2 cs_size_xs"
                                                                    onClick={() => onUnlikeReply(comment.id, reply.id)}
                                                                >
                                                                    <FaThumbsDown className="me-1" />
                                                                    {reply.unlikes || 0}
                                                                </button>
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="cs_mt_15">Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>
                    )}

                    <div className="cs_height_30 cs_height_lg_10" />

                    {/* Comment Form */}
                    <h2 className="cs_reply_heading">Thêm bình luận</h2>
                    <form className="cs_reply_form row cs_row_gap_30 cs_gap_y_30" onSubmit={handleCommentSubmit}>
                        <div className="col-md-12">
                            <textarea
                                className="cs_form_field"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="Viết bình luận của bạn..."
                                required
                                rows="3"
                            />
                        </div>

                        {error && (
                            <div className="col-md-12">
                                <div className="cs_alert cs_error">
                                    {error}
                                </div>
                            </div>
                        )}

                        <div className="col-md-12">
                            <button
                                type="submit"
                                className="cs_btn cs_style_1 cs_color_1"
                                disabled={submitting}
                            >
                                {submitting ? 'Đang gửi...' : 'Gửi bình luận'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default DoctorBlogsLeft;
