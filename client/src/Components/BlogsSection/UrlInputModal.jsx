import React from 'react';

const UrlInputModal = ({ isOpen, onClose, onSubmit, title }) => {
    const [url, setUrl] = React.useState('');

    React.useEffect(() => {
        if (isOpen) setUrl('');
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{title}</h5>
                        <button type="button" className="close" onClick={onClose}>
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div className="modal-body">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Nhập URL"
                            value={url}
                            onChange={e => setUrl(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Hủy
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary ml-1"
                            onClick={() => { onSubmit(url); onClose(); }}
                        >
                            OK
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UrlInputModal;
