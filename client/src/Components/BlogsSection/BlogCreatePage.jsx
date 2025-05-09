import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaImage, FaFilePdf, FaEye, FaSave, FaArrowLeft, FaRedo, FaUndo, FaAlignLeft, FaAlignCenter, FaAlignRight, FaLink, FaPhotoVideo } from 'react-icons/fa';
import DOMPurify from 'dompurify';
import "../../sass/blog/editorStyles.scss";
import UrlInputModal from './UrlInputModal';

const BlogCreatePage = () => {
    const navigate = useNavigate();
    const editorRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [previewMode, setPreviewMode] = useState(false);
    const [doctorInfo, setDoctorInfo] = useState(null);
    const [lastSaved, setLastSaved] = useState(null);
    const [specializations, setSpecializations] = useState([]);
    const [showHTML, setShowHTML] = useState(false);
    const isComposing = useRef(false);
    const [linkModalOpen, setLinkModalOpen] = React.useState(false);
    const [videoModalOpen, setVideoModalOpen] = React.useState(false);

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        specialization: '',
        media: [],
        visibility: 'public',
    });

    const handleInsertLink = (url) => {
        if (url) {
            document.execCommand('createLink', false, url);
        }
    };

    const handleInsertVideo = (url) => {
        if (url) {
            const iframe = `<iframe src="${url}" width="560" height="315" frameborder="0"></iframe>`;
            document.execCommand('insertHTML', false, iframe);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            document.execCommand('insertLineBreak');
        }
        if (e.key === ' ') {
            e.stopPropagation();
            e.preventDefault();
            document.execCommand('insertText', false, ' ');
        }
    };

    const handleContentChange = useCallback(() => {
        if (!editorRef.current || isComposing.current) return;
        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        const range = selection.getRangeAt(0);
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(editorRef.current);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        const caretOffset = preCaretRange.toString().length;

        setFormData(prev => ({
            ...prev,
            content: editorRef.current.innerHTML,
            caretPosition: {
                node: range.startContainer,
                offset: range.startOffset
            }
        }));
    }, []);

    const handleCompositionStart = useCallback(() => {
        isComposing.current = true;
    }, []);

    const handleCompositionEnd = useCallback(() => {
        isComposing.current = false;
        handleContentChange();
    }, [handleContentChange]);

    useEffect(() => {
        if (editorRef.current && !showHTML && !previewMode) {
            editorRef.current.innerHTML = formData.content || '';
        }
    }, [formData.content, showHTML, previewMode]);

    const execCommand = (command, value = null) => {
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        document.execCommand(command, value);
        handleContentChange();
        editorRef.current.focus();
        try {
            selection.removeAllRanges();
            selection.addRange(range);
        } catch (e) {
            console.log("Không thể khôi phục selection");
        }
    };

    const toggleHTMLView = () => {
        if (editorRef.current) {
            const currentContent = editorRef.current.innerHTML;
            setFormData(prev => ({
                ...prev,
                content: currentContent
            }));
        }
        setShowHTML(!showHTML);
    };

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
                    if (idx > 0) {
                        range.insertNode(document.createElement('br'));
                    }
                    range.insertNode(document.createTextNode(line));
                });
            }
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    };

    useEffect(() => {
        const fetchDoctorInfo = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                const response = await axios.get(`${import.meta.env.VITE_BE_URL}/user/profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                console.log("✅ User data received:", response.data);
                const userData = response.data.user;
                setDoctorInfo(userData);
                console.log("👨‍⚕️ Doctor info set:", userData);
                setFormData(prev => {
                    console.log("🔄 Updating formData with doctor's specialization:", userData.specialization || '');
                    return {
                        ...prev,
                        specialization: userData.specialization || ''
                    }
                });

                const savedDraft = localStorage.getItem('blogDraft');
                if (savedDraft) {
                    console.log("Saved draft from localStorage:", JSON.parse(savedDraft));
                    try {
                        const draft = JSON.parse(savedDraft);
                        setFormData(draft);
                        setLastSaved(new Date(draft.lastSaved || Date.now()));
                    } catch (e) {
                        console.error('Error parsing saved draft:', e);
                    }
                }
            } catch (err) {
                console.error('Error fetching doctor info:', err);
                setError('Không thể tải thông tin bác sĩ. Vui lòng đăng nhập lại.');
            }
        };

        fetchDoctorInfo();

        const interval = setInterval(() => {
            autoSaveDraft();
        }, 2000);

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [navigate]);

    useEffect(() => {
        const handleFocus = () => {
            if (editorRef.current) {
                editorRef.current.focus();
            }
        };

        const buttons = document.querySelectorAll('.editor-toolbar button');
        buttons.forEach(button => {
            button.addEventListener('click', handleFocus);
        });

        return () => {
            buttons.forEach(button => {
                button.removeEventListener('click', handleFocus);
            });
        };
    }, []);

    const autoSaveDraft = useCallback(() => {
        if (editorRef.current && formData.title) {
            const currentContent = editorRef.current.innerHTML;
            const draftData = {
                ...formData,
                content: currentContent,
                lastSaved: Date.now()
            };
            localStorage.setItem('blogDraft', JSON.stringify(draftData));
        }
    }, [formData]);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                setError(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const saveDraft = () => {
        setSaving(true);
        if (editorRef.current) {
            const currentContent = editorRef.current.innerHTML;
            const draftData = {
                ...formData,
                content: currentContent,
                lastSaved: Date.now()
            };
            localStorage.setItem('blogDraft', JSON.stringify(draftData));
            setLastSaved(new Date());
        }
        setTimeout(() => {
            setSaving(false);
        }, 1000);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const syncContentToState = () => {
        if (editorRef.current) {
            setFormData(prev => ({
                ...prev,
                content: editorRef.current.innerHTML
            }));
        }
    };

    const handleHTMLContentChange = (e) => {
        const newContent = e.target.value;
        const cleanHTML = sanitizeHTML(newContent);
        setFormData(prevState => ({
            ...prevState,
            content: cleanHTML
        }));
    };

    const sanitizeHTML = (html) => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        return tempDiv.innerHTML;
    };

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        console.log("Files selected:", files);
        const maxFileSize = 10 * 1024 * 1024;
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/mpeg', 'video/quicktime', 'video/webm'];
        files.forEach(file => {
            console.log("Processing file:", file.name);
            if (file.size > maxFileSize) {
                console.error(`File "${file.name}" quá lớn. Kích thước tối đa là 10MB.`);
                setError(`File "${file.name}" quá lớn. Kích thước tối đa là 10MB.`);
                return;
            }

            if (!allowedTypes.includes(file.type)) {
                console.error(`File "${file.name}" không được hỗ trợ. Các định dạng được hỗ trợ: JPEG, PNG, GIF, WEBP, MP4, MPEG, MOV, WEBM.`);
                setError(`File "${file.name}" không được hỗ trợ. Các định dạng được hỗ trợ: JPEG, PNG, GIF, WEBP, MP4, MPEG, MOV, WEBM.`);
                return;
            }

            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    console.log("Image file loaded:", file.name);
                    setFormData(prev => ({
                        ...prev,
                        media: [
                            ...prev.media,
                            {
                                file,
                                preview: e.target.result,
                                type: file.type.startsWith('image/') ? 'image' : 'video',
                                name: file.name
                            }
                        ]
                    }));
                };
                reader.readAsDataURL(file);
            } else {
                console.log("Non-image file added:", file.name);
                setFormData(prev => ({
                    ...prev,
                    media: [
                        ...prev.media,
                        {
                            file,
                            type: file.type.startsWith('video/') ? 'video' : 'document',
                            name: file.name
                        }
                    ]
                }));
            }
        });
    };

    const removeMedia = (index) => {
        setFormData(prev => ({
            ...prev,
            media: prev.media.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        syncContentToState();

        console.log("Form data before submission:", formData);

        if (!formData.title.trim()) {
            console.error('Tiêu đề bài viết trống');
            setError('Vui lòng nhập tiêu đề bài viết');
            return;
        }

        if (!editorRef.current || !editorRef.current.innerHTML.trim()) {
            console.error('Nội dung bài viết trống');
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
                ALLOWED_TAGS: ['p', 'br', 'ul', 'ol', 'li', 'strong', 'em', 'u', 'a', 'img'],
                ALLOWED_ATTR: ['src', 'alt', 'href', 'class', 'style']
            }).replace(/ /g, ' ');

            const formDataToSend = new FormData();
            formDataToSend.append('title', formData.title);
            formDataToSend.append('content', cleanContent);
            formDataToSend.append('specialization', formData.specialization);
            formDataToSend.append('visibility', formData.visibility);

            console.log("Files to be uploaded:", formData.media);
            formData.media.forEach((media, index) => {
                if (media.file && media.file instanceof File) {
                    console.log(`Appending file ${index}:`, media.file.name);
                    formDataToSend.append('newFiles[]', media.file);
                } else if (media.file) {
                    console.warn(`Invalid file object at index ${index}:`, media.file);
                }
            });

            const response = await axios.post(
                `${import.meta.env.VITE_BE_URL}/blog`,
                formDataToSend,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            console.log("Response from server:", response.data);

            localStorage.removeItem('blogDraft');
            navigate(`/doctor/blog/${response.data._id}`);
        } catch (err) {
            console.error('Error creating blog:', err);
            setError(err.response?.data?.message || 'Có lỗi xảy ra khi tạo bài viết. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const togglePreview = () => {
        if (!previewMode && editorRef.current) {
            setFormData(prev => ({
                ...prev,
                content: editorRef.current.innerHTML
            }));
        }
        setPreviewMode(!previewMode);
    };

    const handleCancel = () => {
        if (formData.title || formData.content || formData.media.length > 0) {
            if (window.confirm("Bạn có chắc muốn hủy bỏ bài viết này? Tất cả nội dung chưa lưu sẽ bị mất.")) {
                navigate('/doctor/blog');
            }
        } else {
            navigate('/doctor/blog');
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
                                    onClick={() => navigate('/doctor/blog')}
                                >
                                    <FaArrowLeft /> Quay lại
                                </button>
                                <h1 className="h3 mb-0">Tạo bài viết mới</h1>
                            </div>
                            <div className="d-flex">
                                {lastSaved && (
                                    <small className="text-muted me-3 d-flex align-items-center">
                                        {saving ? 'Đang lưu...' : `Đã lưu lúc: ${lastSaved.toLocaleTimeString()}`}
                                    </small>
                                )}
                                <button
                                    className="btn btn-outline-primary me-2"
                                    onClick={saveDraft}
                                    disabled={saving || loading}
                                >
                                    <FaSave className="me-1" /> Lưu nháp
                                </button>
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
                                    {loading ? 'Đang đăng...' : 'Đăng bài'}
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
                                                    <button onClick={() => document.execCommand('justifyLeft')}><FaAlignLeft /></button>
                                                    <button onClick={() => document.execCommand('justifyRight')}><FaAlignRight /></button>
                                                    <button onClick={() => document.execCommand('justifyCenter')}><FaAlignCenter /></button>
                                                    <button onClick={() => document.execCommand('insertOrderedList')}>1.</button>
                                                    <button onClick={() => document.execCommand('insertUnorderedList')}>•</button>
                                                    <button onClick={() => setLinkModalOpen(true)}><FaLink /></button>
                                                    <button onClick={() => setVideoModalOpen(true)}><FaPhotoVideo /></button>
                                                    <button onClick={() => document.execCommand('undo')}><FaRedo /></button>
                                                    <button onClick={() => document.execCommand('redo')}><FaUndo /></button>
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
                                        <select
                                            className="form-control"
                                            id="specialization"
                                            name="specialization"
                                            value={formData.specialization || (doctorInfo?.specialization || '')}
                                            onChange={handleChange}
                                            disabled={!!doctorInfo?.specialization}
                                        >
                                            <option value={formData.specialization || (doctorInfo?.specialization || '')}>{formData.specialization || (doctorInfo?.specialization || '')}</option>
                                        </select>
                                        <small className="form-text text-muted">
                                            Chuyên khoa được tự động điền từ thông tin của bạn. Bạn có thể thay đổi nếu muốn.
                                        </small>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Đính kèm hình ảnh/tài liệu</label>
                                        <div className="input-group mb-3">
                                            <input
                                                type="file"
                                                className="form-control"
                                                id="fileUpload"
                                                multiple
                                                onChange={handleFileUpload}
                                                accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/mpeg,video/quicktime,video/webm"
                                            />
                                        </div>
                                        <small className="form-text text-muted">
                                            Hỗ trợ các định dạng: JPEG, PNG, GIF, WEBP, MP4, MPEG, MOV, WEBM. Kích thước tối đa: 10MB mỗi file.
                                        </small>
                                        {formData.media.length > 0 && (
                                            <div className="mt-3">
                                                <h6>Tệp đã tải lên ({formData.media.length})</h6>
                                                <div className="row g-2">
                                                    {formData.media.map((item, index) => (
                                                        <div className="col-md-3 col-sm-4 col-6" key={index}>
                                                            <div className="card h-100">
                                                                {item.type === 'image' && item.preview && (
                                                                    <img
                                                                        src={item.preview}
                                                                        className="card-img-top"
                                                                        alt={item.name}
                                                                        style={{ height: '120px', objectFit: 'cover' }}
                                                                    />
                                                                )}
                                                                {item.type !== 'image' && (
                                                                    <div
                                                                        className="card-img-top bg-light d-flex align-items-center justify-content-center"
                                                                        style={{ height: '120px' }}
                                                                    >
                                                                        <FaFilePdf size={40} className="text-danger" />
                                                                    </div>
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
                                            <small>Tác giả: {doctorInfo?.username || 'Bác sĩ'} | {new Date().toLocaleDateString('vi-VN')}</small>
                                        </div>
                                    </div>
                                    {formData.media.length > 0 && formData.media.some(m => m.type === 'image') && (
                                        <div className="featured-image mb-4">
                                            <img
                                                src={formData.media.find(m => m.type === 'image').preview}
                                                className="img-fluid rounded"
                                                alt="Featured"
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
                                                    'Nhân viên y tế - Chỉ bác sĩ và nhân viên y tế'
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
                                        {loading ? 'Đang đăng...' : 'Đăng bài'}
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

export default BlogCreatePage;