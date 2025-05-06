import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Modal, Button, Alert, ProgressBar } from 'react-bootstrap';
import '../../sass/shortcode/_importfile.scss';

const ImportDataButton = () => {
    const [showModal, setShowModal] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({});
    const [uploadStatus, setUploadStatus] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleImportData = () => {
        setShowModal(true);
        setSelectedFiles([]);
        setUploadStatus(null);
        setUploadProgress({});
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedFiles([]);
        setUploadStatus(null);
        setUploadProgress({});
    };

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isDragging) setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const validateFile = (file) => {
        const validTypes = ['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
        if (!validTypes.includes(file.type)) {
            setUploadStatus({
                type: 'danger',
                message: 'Chỉ chấp nhận file CSV hoặc Excel'
            });
            return false;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB
            setUploadStatus({
                type: 'danger',
                message: 'Kích thước file không được vượt quá 5MB'
            });
            return false;
        }

        return true;
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const newFiles = Array.from(e.dataTransfer.files);
            const validFiles = newFiles.filter(file => validateFile(file));
            if (validFiles.length > 0) {
                setSelectedFiles(prev => [...prev, ...validFiles]);
                setUploadStatus(null);
            }
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);
            const validFiles = newFiles.filter(file => validateFile(file));
            if (validFiles.length > 0) {
                setSelectedFiles(prev => [...prev, ...validFiles]);
                setUploadStatus(null);
            }
        }
    };

    const handleSave = async () => {
        if (selectedFiles.length === 0) {
            setUploadStatus({
                type: 'danger',
                message: 'Vui lòng chọn file để upload'
            });
            return;
        }

        setIsUploading(true);
        setUploadProgress({});

        try {
            const uploadPromises = selectedFiles.map(async (file) => {
                const formData = new FormData();
                formData.append('file', file);

                const response = await axios.post(`${import.meta.env.VITE_BE_URL}/upload/upload`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    },
                    onUploadProgress: (progressEvent) => {
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        setUploadProgress(prev => ({
                            ...prev,
                            [file.name]: percentCompleted
                        }));
                    }
                });

                return response.data;
            });

            const results = await Promise.all(uploadPromises);

            setUploadStatus({
                type: 'success',
                message: `Nhập dữ liệu thành công - ${selectedFiles.length} file`
            });

            // Tự động đóng modal sau khi upload thành công
            setTimeout(() => {
                handleCloseModal();
            }, 1000);
        } catch (error) {
            console.error('Upload error:', error);

            // Xử lý các loại lỗi khác nhau
            if (error.response) {
                // Lỗi từ server
                if (error.response.status === 400) {
                    setUploadStatus({
                        type: 'danger',
                        message: 'File không hợp lệ hoặc dữ liệu không đúng định dạng'
                    });
                } else if (error.response.status === 413) {
                    setUploadStatus({
                        type: 'danger',
                        message: 'File quá lớn, vui lòng chọn file nhỏ hơn'
                    });
                } else {
                    setUploadStatus({
                        type: 'danger',
                        message: error.response.data.message || 'Lỗi server'
                    });
                }
            } else if (error.request) {
                // Không nhận được phản hồi từ server
                setUploadStatus({
                    type: 'danger',
                    message: 'Không thể kết nối đến server, vui lòng thử lại sau'
                });
            } else {
                // Lỗi khi thiết lập request
                setUploadStatus({
                    type: 'danger',
                    message: 'Lỗi khi tải file, vui lòng thử lại'
                });
            }
        } finally {
            setIsUploading(false);
        }
    };


    const handleClickDropzone = () => {
        fileInputRef.current.click();
    };

    const removeFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <>
            <button className="btn btn-success" onClick={handleImportData}>
                Nhập dữ liệu
            </button>

            <Modal show={showModal} onHide={handleCloseModal} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Nhập dữ liệu</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div
                        className={`dropzone ${isDragging ? 'active' : ''}`}
                        onDragEnter={handleDragEnter}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={handleClickDropzone}
                    >
                        <div className="upload-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-plus" viewBox="0 0 16 16">
                                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4" />
                            </svg>
                        </div>
                        <h4>Bỏ file vào đây</h4>
                        <p>không giới hạn kích cỡ</p>
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            accept=".csv,.xlsx,.xls"
                            onChange={handleFileChange}
                            multiple
                        />
                    </div>

                    {selectedFiles.length > 0 && (
                        <div className="uploaded-files mt-4">
                            <h5>Tệp đã tải lên</h5>
                            <div className="file-list">
                                {selectedFiles.map((file, index) => (
                                    <div key={index} className="file-item">
                                        <div className="file-info">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-file-earmark" viewBox="0 0 16 16">
                                                <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5z" />
                                            </svg>
                                            <div>
                                                <p className="file-name">{file.name}</p>
                                                <p className="file-size">{(file.size / 1024).toFixed(2)} KB</p>
                                            </div>
                                        </div>
                                        {uploadProgress[file.name] ? (
                                            <div className="file-progress">
                                                <ProgressBar
                                                    now={uploadProgress[file.name]}
                                                    label={`${uploadProgress[file.name]}%`}
                                                    style={{ width: '100%' }}
                                                />
                                            </div>
                                        ) : (
                                            uploadProgress[file.name] === 100 ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="green" className="bi bi-check-lg" viewBox="0 0 16 16">
                                                    <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z" />
                                                </svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x" viewBox="0 0 16 16" onClick={() => removeFile(index)}>
                                                    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
                                                </svg>
                                            )
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {uploadStatus && (
                        <Alert variant={uploadStatus.type} className="mt-3">
                            {uploadStatus.message}
                        </Alert>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal} disabled={isUploading}>
                        Hủy
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSave}
                        disabled={selectedFiles.length === 0 || isUploading}
                    >
                        {isUploading ? 'Đang xử lý...' : 'Lưu'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default ImportDataButton;