import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Modal, Button, Alert, ProgressBar } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faFileAlt, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
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
    
                const response = await axios.post('/upload/upload', formData, {
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
            }, 2000);
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
                Import Data
            </button>

            <Modal show={showModal} onHide={handleCloseModal} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Import Data</Modal.Title>
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
                            <FontAwesomeIcon icon={faPlus} />
                        </div>
                        <h4>Drag and drop here</h4>
                        <p>No size limit</p>
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
                            <h5>Uploaded files</h5>
                            <div className="file-list">
                                {selectedFiles.map((file, index) => (
                                    <div key={index} className="file-item">
                                        <div className="file-info">
                                            <FontAwesomeIcon icon={faFileAlt} className="file-icon" />
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
                                                <FontAwesomeIcon icon={faCheck} className="status-icon success" />
                                            ) : (
                                                <FontAwesomeIcon
                                                    icon={faTimes}
                                                    className="status-icon remove"
                                                    onClick={() => removeFile(index)}
                                                />
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
                        {isUploading ? 'Đang xử lý...' : 'Save'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default ImportDataButton;