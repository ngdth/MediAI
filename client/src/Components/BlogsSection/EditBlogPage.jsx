import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaImage, FaFilePdf, FaEye, FaSave, FaArrowLeft, FaRedo, FaUndo, FaAlignLeft, FaAlignCenter, FaAlignRight, FaLink, FaPhotoVideo } from 'react-icons/fa';
import DOMPurify from 'dompurify';
import "../../sass/blog/editorStyles.scss";
import UrlInputModal from './UrlInputModal';

const EditBlogPage = () => {
    const { blogId } = useParams();
    const navigate = useNavigate();
    const editorRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [previewMode, setPreviewMode] = useState(false);
    const [doctorInfo, setDoctorInfo] = useState(null);
    const [lastSaved, setLastSaved] = useState(null);
    const [showHTML, setShowHTML] = useState(false);
    const isComposing = useRef(false);
    const [linkModalOpen, setLinkModalOpen] = useState(false);
    const [videoModalOpen, setVideoModalOpen] = useState(false);
    const [deletedMediaUrls, setDeletedMediaUrls] = useState([]);
    const MAX_MEDIA_PER_BLOG = 1;
    const [mediaLimitReached, setMediaLimitReached] = useState(false);
    // Form data state
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        specialization: '',
        media: [],
        visibility: 'public',
    });

    useEffect(() => {
        setMediaLimitReached(formData.media.length >= MAX_MEDIA_PER_BLOG);
    }, [formData.media]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            document.execCommand('insertLineBreak');
        }

        // Xử lý riêng cho phím Space
        if (e.key === ' ') {
            e.stopPropagation();
            e.preventDefault();
            document.execCommand('insertText', false, ' ');
        }
    };

    // Fetch doctor info and blog data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }
                // Fetch doctor info
                const doctorRes = await axios.get(`${import.meta.env.VITE_BE_URL}/user/profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setDoctorInfo(doctorRes.data.user);

                // Fetch blog data
                const blogRes = await axios.get(`${import.meta.env.VITE_BE_URL}/blog/${blogId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const blog = blogRes.data;
                setFormData({
                    title: blog.title || '',
                    content: blog.content || '',
                    specialization: blog.specialization || doctorRes.data.user.specialization || '',
                    media: (blog.media || []).map(m => ({
                        ...m,
                        preview: `${import.meta.env.VITE_BE_URL}${m.url.replace('/src', '')}`,
                        type: m.type
                    })),
                    visibility: blog.visibility || 'public'
                });
                setLastSaved(new Date(blog.updatedAt || blog.createdAt));
                // Set editor content
                if (editorRef.current) editorRef.current.innerHTML = blog.content || '';
            } catch (err) {
                setError('Không thể tải thông tin bài viết hoặc bác sĩ.');
            }
        };
        fetchData();
    }, [blogId, navigate]);

    // Đồng bộ editor content với state khi content thay đổi
    useEffect(() => {
        if (editorRef.current && !showHTML && !previewMode) {
            editorRef.current.innerHTML = formData.content || '';
        }
    }, [formData.content, showHTML, previewMode]);

    // Toolbar và định dạng
    const execCommand = (command, value = null) => {
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        document.execCommand(command, value);
        handleContentChange();
        editorRef.current.focus();
        try {
            selection.removeAllRanges();
            selection.addRange(range);
        } catch (e) { }
    };

    // Xử lý nội dung editor
    const handleContentChange = useCallback(() => {
        if (!editorRef.current || isComposing.current) return;
        setFormData(prev => ({
            ...prev,
            content: editorRef.current.innerHTML
        }));
    }, []);

    const handleCompositionStart = useCallback(() => { isComposing.current = true; }, []);
    const handleCompositionEnd = useCallback(() => { isComposing.current = false; handleContentChange(); }, [handleContentChange]);

    const handlePaste = (e) => {
        e.preventDefault();
        const items = e.clipboardData.items;
        let handled = false;
        for (const item of items) {
            if (item.type.startsWith('image/')) {
                const blob = item.getAsFile();
                const reader = new FileReader();
                reader.onload = (ev) => {
                    const img = document.createElement('img');
                    img.src = ev.target.result;
                    img.style.maxWidth = '100%';
                    const selection = window.getSelection();
                    if (!selection.rangeCount) return;
                    const range = selection.getRangeAt(0);
                    range.deleteContents();
                    range.insertNode(img);
                    range.setStartAfter(img);
                    range.collapse(true);
                    selection.removeAllRanges();
                    selection.addRange(range);
                };
                reader.readAsDataURL(blob);
                handled = true;
                break;
            }
        }
        if (!handled) {
            const html = e.clipboardData.getData('text/html');
            const text = e.clipboardData.getData('text/plain');
            const selection = window.getSelection();
            if (!selection.rangeCount) return;
            const range = selection.getRangeAt(0);
            range.deleteContents();
            if (html) {
                const fragment = range.createContextualFragment(html);
                range.insertNode(fragment);
            } else if (text) {
                const lines = text.split('\n');
                lines.forEach((line, idx) => {
                    if (idx > 0) range.insertNode(document.createElement('br'));
                    range.insertNode(document.createTextNode(line));
                });
            }
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    };

    // Xử lý file upload
    const handleFileUpload = (e) => {
        if (mediaLimitReached) {
            setError("Bạn cần xóa media hiện tại trước khi thêm mới.");
            return;
        }
        const file = e.target.files[0];
        if (!file) return;

        const maxFileSize = 10 * 1024 * 1024;
        const allowedTypes = [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'video/mp4', 'video/mpeg', 'video/quicktime', 'video/webm'
        ];

        if (file.size > maxFileSize) {
            setError(`File "${file.name}" quá lớn. Kích thước tối đa là 10MB.`);
            return;
        }
        if (!allowedTypes.includes(file.type)) {
            setError(`File "${file.name}" không được hỗ trợ.`);
            return;
        }

        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                setFormData(prev => ({
                    ...prev,
                    media: [{
                        file,
                        preview: ev.target.result,
                        type: 'image',
                        name: file.name
                    }]
                }));
            };
            reader.readAsDataURL(file);
        } else {
            setFormData(prev => ({
                ...prev,
                media: [{
                    file,
                    type: 'video',
                    name: file.name
                }]
            }));
        }
    };

    // Xóa media
    const removeMedia = (index) => {
        const mediaItem = formData.media[index];
        setFormData(prev => ({
            ...prev,
            media: prev.media.filter((_, i) => i !== index)
        }));
        // Nếu media cũ (có url), thêm vào danh sách xóa
        if (mediaItem.url) {
            setDeletedMediaUrls(prev => [...prev, mediaItem.url]);
        }
    };

    // Xử lý input
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Modal link/video
    const handleInsertLink = (url) => {
        if (url) document.execCommand('createLink', false, url);
    };
    const handleInsertVideo = (url) => {
        if (url) {
            const iframe = `<iframe src="${url}" width="560" height="315" frameborder="0"></iframe>`;
            document.execCommand('insertHTML', false, iframe);
        }
    };

    // Preview
    const togglePreview = () => {
        if (!previewMode && editorRef.current) {
            setFormData(prev => ({
                ...prev,
                content: editorRef.current.innerHTML
            }));
        }
        setPreviewMode(!previewMode);
    };

    // Submit cập nhật
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title.trim()) {
            setError('Vui lòng nhập tiêu đề bài viết');
            return;
        }
        if (!editorRef.current || !editorRef.current.innerHTML.trim()) {
            setError('Vui lòng nhập nội dung bài viết');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }
            const cleanContent = DOMPurify.sanitize(editorRef.current.innerHTML, {
                ALLOWED_TAGS: ['p', 'br', 'ul', 'ol', 'li', 'strong', 'em', 'u', 'a', 'img', 'iframe'],
                ALLOWED_ATTR: ['src', 'alt', 'href', 'class', 'style', 'frameborder', 'width', 'height']
            }).replace(/&nbsp;/g, ' ');

            const keptMediaUrls = formData.media
                .filter(media => media.url && !deletedMediaUrls.includes(media.url))
                .map(media => media.url);

            const formDataToSend = new FormData();
            formDataToSend.append('keptMedia', JSON.stringify(keptMediaUrls));
            formData.media.forEach(media => {
                if (media.file) {
                    formDataToSend.append('newFiles[]', media.file);
                }
            });
            formDataToSend.append('deletedMedia', JSON.stringify(deletedMediaUrls));;
            formDataToSend.append('title', formData.title);
            formDataToSend.append('content', cleanContent);
            formDataToSend.append('specialization', formData.specialization);
            formDataToSend.append('visibility', formData.visibility);
            await axios.put(
                `${import.meta.env.VITE_BE_URL}/blog/${blogId}`,
                formDataToSend,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            navigate(`/blog/${blogId}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật bài viết.');
        } finally {
            setLoading(false);
        }
    };

    // Hủy
    const handleCancel = () => {
        if (window.confirm("Bạn có chắc muốn hủy chỉnh sửa?")) {
            navigate('/blog');
        }
    };

    return (
        <div className="container-fluid-create">
            <div className="row">
                <div className="col-12 col-lg-10 mx-auto">
                    <div className="card shadow-sm">
                        <div className="card-header bg-white d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center">
                                <button
                                    className="btn btn-outline-secondary me-3"
                                    onClick={() => navigate('/blog')}
                                >
                                    <FaArrowLeft /> Quay lại
                                </button>
                                <h1 className="h3 mb-0">Chỉnh sửa bài viết</h1>
                                {lastSaved && (
                                    <small className="text-muted ms-3">
                                        Đã lưu gần nhất: {lastSaved.toLocaleString()}
                                    </small>
                                )}
                            </div>
                            <div className="d-flex">
                                <button
                                    className="btn btn-outline-info me-2"
                                    onClick={togglePreview}
                                    disabled={loading}
                                >
                                    <FaEye className="me-1" /> {previewMode ? 'Sửa bài' : 'Xem trước'}
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleSubmit}
                                    disabled={loading}
                                >
                                    {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                                </button>
                            </div>
                        </div>
                        <div className="card-body">
                            {error && (
                                <div className="alert alert-danger" role="alert">
                                    {error}
                                </div>
                            )}
                            {!previewMode ? (
                                <>
                                    <div className="mb-3">
                                        <label htmlFor="title" className="form-label">Tiêu đề bài viết <span className="text-danger">*</span></label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="title"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleChange}
                                            placeholder="Nhập tiêu đề bài viết"
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="content" className="form-label">Nội dung bài viết <span className="text-danger">*</span></label>
                                        {showHTML ? (
                                            <textarea
                                                className="form-control html-view"
                                                value={formData.content}
                                                onChange={handleHTMLContentChange}
                                                rows="8"
                                            />
                                        ) : (
                                            <div className="wysiwyg-editor">
                                                <div className="editor-toolbar">
                                                    <button type="button" onClick={() => document.execCommand('bold')} title="In đậm"><strong>B</strong></button>
                                                    <button type="button" onClick={() => document.execCommand('italic')} title="In nghiêng"><em>I</em></button>
                                                    <button type="button" onClick={() => document.execCommand('underline')} title="Gạch chân"><u>U</u></button>
                                                    <div className="heading-dropdown">
                                                        <button type="button" onClick={() => document.execCommand('formatBlock', false, 'h1')}>H1</button>
                                                        <button type="button" onClick={() => document.execCommand('formatBlock', false, 'h2')}>H2</button>
                                                        <button type="button" onClick={() => document.execCommand('formatBlock', false, 'h3')}>H3</button>
                                                    </div>
                                                    <button onClick={() => document.execCommand('justifyLeft')}><i className="align-left-icon" /><FaAlignLeft /></button>
                                                    <button onClick={() => document.execCommand('justifyRight')}><i className="align-right-icon" /><FaAlignRight /></button>
                                                    <button onClick={() => document.execCommand('justifyCenter')}><i className="align-center-icon" /><FaAlignCenter /></button>
                                                    <button onClick={() => document.execCommand('insertOrderedList')}>1.</button>
                                                    <button onClick={() => document.execCommand('insertUnorderedList')}>•</button>
                                                    <button onClick={() => setLinkModalOpen(true)}><FaLink /></button>
                                                    <button onClick={() => setVideoModalOpen(true)}><FaPhotoVideo /></button>
                                                    <button onClick={() => document.execCommand('undo')}><FaRedo /></button>
                                                    <button onClick={() => document.execCommand('redo')}><FaUndo /></button>
                                                    {/* <button type="button" onClick={toggleHTMLView} title="Xem mã HTML">HTML</button> */}
                                                </div>

                                                <UrlInputModal
                                                    isOpen={linkModalOpen}
                                                    onClose={() => setLinkModalOpen(false)}
                                                    onSubmit={handleInsertLink}
                                                    title="Nhập URL liên kết"
                                                />
                                                <UrlInputModal
                                                    isOpen={videoModalOpen}
                                                    onClose={() => setVideoModalOpen(false)}
                                                    onSubmit={handleInsertVideo}
                                                    title="Nhập URL video (YouTube/Vimeo)"
                                                />

                                                <div
                                                    ref={editorRef}
                                                    className="editor-content form-control"
                                                    contentEditable={!showHTML && !previewMode}
                                                    onPaste={handlePaste}
                                                    onKeyDown={handleKeyDown}
                                                    suppressContentEditableWarning={true}
                                                />
                                            </div>
                                        )}
                                        <small className="form-text text-muted">
                                            Sử dụng thanh công cụ phía trên để định dạng nội dung bài viết.
                                        </small>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="specialization" className="form-label">Chuyên khoa</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="specialization"
                                            name="specialization"
                                            value={formData.specialization}
                                            onChange={handleChange}
                                            disabled={!!doctorInfo?.specialization}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Đính kèm hình ảnh/tài liệu</label>
                                        <input
                                            type="file"
                                            className="form-control"
                                            multiple
                                            onChange={handleFileUpload}
                                            disabled={mediaLimitReached}
                                            accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/mpeg,video/quicktime,video/webm"
                                        />
                                        {mediaLimitReached && (
                                            <div className="alert alert-warning mt-2">
                                                Chỉ được phép có 1 media. Vui lòng xóa media hiện tại để thêm mới.
                                            </div>
                                        )}
                                        {formData.media.length > 0 && (
                                            <div className="mt-3">
                                                <div className="row g-2">
                                                    {formData.media.map((item, index) => (
                                                        <div className="col-md-3 col-sm-4 col-6" key={index}>
                                                            <div className="card h-100">
                                                                {item.type === 'image' && (item.preview || item.url) && (
                                                                    <img
                                                                        src={item.preview || item.url}
                                                                        className="card-img-top"
                                                                        alt={item.name}
                                                                        style={{ height: '120px', objectFit: 'cover' }}
                                                                        onError={(e) => {
                                                                            e.target.onerror = null;
                                                                            e.target.src = '/assets/img/post_1.jpeg';
                                                                        }}
                                                                    />
                                                                )}
                                                                {item.type !== 'image' && (
                                                                    <video
                                                                        src={item.preview || item.url}
                                                                        className="card-img-top"
                                                                        controls
                                                                        style={{ height: '120px', objectFit: 'cover' }}
                                                                    />
                                                                )}
                                                                <div className="card-body p-2">
                                                                    <p className="card-text small text-truncate">{item.name}</p>
                                                                    <button
                                                                        className="btn btn-sm btn-outline-danger"
                                                                        onClick={() => removeMedia(index)}
                                                                    >
                                                                        Xóa
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="visibility" className="form-label">Quyền xem</label>
                                        <select
                                            className="form-control"
                                            id="visibility"
                                            name="visibility"
                                            value={formData.visibility}
                                            onChange={handleChange}
                                        >
                                            <option value="public">Công khai - Tất cả mọi người</option>
                                            <option value="private">Riêng tư - Chỉ bạn</option>
                                            <option value="doctors">Bác sĩ - Chỉ bác sĩ</option>
                                        </select>
                                    </div>
                                </>
                            ) : (
                                <div className="blog-preview">
                                    <h1 className="mb-4">{formData.title}</h1>
                                    <div className="d-flex align-items-center mb-4">
                                        <div className="badge bg-primary me-2">{formData.specialization || 'Chuyên khoa'}</div>
                                        <div className="text-muted">
                                            <small>Tác giả: {doctorInfo?.username || 'Bác sĩ'} | {lastSaved && lastSaved.toLocaleDateString('vi-VN')}</small>
                                        </div>
                                    </div>
                                    {formData.media.length > 0 && formData.media.some(m => m.type === 'image') && (
                                        <div className="featured-image mb-4">
                                            <img
                                                src={formData.media.find(m => m.type === 'image').preview}
                                                className="img-fluid rounded"
                                                alt="Featured"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = '/assets/img/post_1.jpeg';
                                                }}
                                            />
                                        </div>
                                    )}
                                    <div className="blog-content mb-4">
                                        <div
                                            style={{ whiteSpace: 'pre-line', wordBreak: 'break-word' }}
                                            dangerouslySetInnerHTML={{
                                                __html: formData.content
                                                    .replace(/<br\s*\/?>/gi, '\n')
                                                    .replace(/<\/p><p>/gi, '\n')
                                                    .replace(/<\/?p>/gi, '')
                                            }}
                                        />
                                    </div>
                                    {formData.media.length > 0 && (
                                        <div className="attachments mb-4">
                                            <h5>Tệp đính kèm</h5>
                                            <div className="row g-2">
                                                {formData.media.map((item, index) => (
                                                    <div className="col-md-2 col-sm-3 col-4" key={index}>
                                                        <div className="card h-100">
                                                            {item.type === 'image' && item.preview && (
                                                                <img
                                                                    src={item.preview}
                                                                    className="card-img-top"
                                                                    alt={item.name}
                                                                    style={{ height: '80px', objectFit: 'cover' }}
                                                                />
                                                            )}
                                                            {item.type !== 'image' && (
                                                                <div
                                                                    className="card-img-top bg-light d-flex align-items-center justify-content-center"
                                                                    style={{ height: '80px' }}
                                                                >
                                                                    <FaFilePdf size={30} className="text-danger" />
                                                                </div>
                                                            )}
                                                            <div className="card-body p-2">
                                                                <p className="card-text small text-truncate">{item.name}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <div className="visibility-info alert alert-info">
                                        <small>
                                            <strong>Quyền xem:</strong> {
                                                formData.visibility === 'public' ? 'Công khai - Tất cả mọi người' :
                                                    formData.visibility === 'private' ? 'Riêng tư - Chỉ bạn' :
                                                        'Bác sĩ - Chỉ bác sĩ'
                                            }
                                        </small>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="card-footer bg-white">
                            <div className="d-flex justify-content-between">
                                <button
                                    className="btn btn-outline-secondary"
                                    onClick={handleCancel}
                                >
                                    Hủy
                                </button>
                                {!previewMode && (
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleSubmit}
                                        disabled={loading}
                                    >
                                        {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditBlogPage;
