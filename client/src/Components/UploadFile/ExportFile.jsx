import React, { useState } from 'react';
import axios from 'axios';
import { Modal, Button, Alert, Spinner } from 'react-bootstrap';
import '../../sass/shortcode/_importfile.scss';
import { FaFileExport } from 'react-icons/fa';

const ExportDataButton = ({ role }) => {
    const [showModal, setShowModal] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [exportStatus, setExportStatus] = useState(null);

    const handleExportData = () => {
        setShowModal(true);
        setExportStatus(null);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setExportStatus(null);
        setIsExporting(false);
    };

    const handleExport = async () => {
        setIsExporting(true);
        setExportStatus(null);

        try {
            const response = await axios.get(`${import.meta.env.VITE_BE_URL}/upload/export`, {
                params: { role }, // Truyền role qua query parameter
                responseType: 'blob',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
                    'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                },
            });

            const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${role.replace(/\s+/g, '_').toLowerCase()}_template.xlsx`; // Tên file tùy thuộc vào role
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            setExportStatus({
                type: 'success',
                message: `Xuất tiêu đề và vai trò ${role} thành công! File đã được tải xuống.`,
            });

            setTimeout(() => {
                handleCloseModal();
            }, 1000);
        } catch (error) {
            console.error('Export error:', error);

            if (axios.isAxiosError(error) && error.response) {
                if (error.response.status === 400) {
                    setExportStatus({
                        type: 'danger',
                        message: `Không có người dùng với vai trò ${role} để xuất.`,
                    });
                } else if (error.response.status === 401) {
                    setExportStatus({
                        type: 'danger',
                        message: 'Không có quyền truy cập. Vui lòng đăng nhập lại.',
                    });
                } else {
                    setExportStatus({
                        type: 'danger',
                        message: 'Lỗi server khi xuất dữ liệu.',
                    });
                }
            } else if (!error.response) {
                setExportStatus({
                    type: 'danger',
                    message: 'Không thể kết nối đến server. Vui lòng thử lại sau.',
                });
            } else {
                setExportStatus({
                    type: 'danger',
                    message: 'Lỗi khi xuất dữ liệu. Vui lòng thử lại.',
                });
            }
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <>
            <button className="btn btn-success mx-1" onClick={handleExportData}>
                Xuất dữ liệu
            </button>

            <Modal show={showModal} onHide={handleCloseModal} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Xuất Dữ Liệu</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="export-container text-center">
                        {isExporting ? (
                            <div className="exporting-status">
                                <Spinner animation="border" role="status" className="mb-3" />
                                <p>Đang xuất dữ liệu...</p>
                            </div>
                        ) : (
                            <div className="export-info">
                                <FaFileExport size={48} />
                                <h4>Bấm "Xuất" để tải file Excel</h4>
                                <p>File sẽ chứa các tiêu đề cột và vai trò {role}.</p>
                            </div>
                        )}

                        {exportStatus && (
                            <Alert variant={exportStatus.type} className="mt-3">
                                {exportStatus.message}
                            </Alert>
                        )}
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal} disabled={isExporting}>
                        Hủy
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleExport}
                        disabled={isExporting}
                    >
                        {isExporting ? 'Đang xử lý...' : 'Xuất'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default ExportDataButton;