import { useState } from 'react';
import { Link } from 'react-router-dom';

const Dropdown = ({ title, items }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [inviteCode, setInviteCode] = useState('');

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => {
        setIsModalOpen(false);
        setInviteCode('');
    };

    const handleInviteSubmit = () => {
        dispatch(requestJoinProject({ inviteCode })) // Gửi yêu cầu tham gia với inviteCode
            .then((response) => {
                console.log('Dự án đã được tham gia:', response); // Kiểm tra nếu cần
                closeModal(); // Đóng modal sau khi yêu cầu được gửi
            })
            .catch((error) => {
                console.error('Lỗi khi tham gia dự án:', error); // Xử lý lỗi nếu có
            });
    };

    return (
        <div className="index-10 relative">
            <button
                className="rounded px-4 py-2 text-sm font-medium hover:bg-gray-200"
                onClick={() => setIsOpen(!isOpen)}
            >
                {title} ▾
            </button>

            {isOpen && (
                <div className="absolute left-0 mt-2 w-64 rounded border bg-white shadow-lg">
                    {items.map((item, index) => (
                        <div key={index}>
                            {item.path ? (
                                <Link
                                    to={item.path}
                                    className="flex items-center px-4 py-2 hover:bg-gray-100"
                                    onClick={() => setIsOpen(false)}
                                >
                                    {item.icon && <img src={item.icon} alt="" className="mr-2 h-6 w-6" />}
                                    <span className="text-sm">{item.label}</span>
                                </Link>
                            ) : (
                                <button
                                    className="flex w-full items-center px-4 py-2 text-left hover:bg-gray-100"
                                    onClick={() => {
                                        if (item.label === 'Vào dự án bằng mã') {
                                            openModal();
                                        } else {
                                            item.onClick && item.onClick();
                                        }
                                        setIsOpen(false);
                                    }}
                                >
                                    {item.icon && <img src={item.icon} alt="" className="mr-2 h-6 w-6" />}
                                    <span className="text-sm">{item.label}</span>
                                </button>
                            )}
                        </div>
                    ))}
                    {isModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-xs">
                            <div className="w-96 space-y-4 rounded-lg bg-white p-6">
                                <h2 className="text-xl font-semibold">Nhập mã dự ánán</h2>
                                <input
                                    type="text"
                                    value={inviteCode}
                                    onChange={(e) => setInviteCode(e.target.value)}
                                    className="w-full rounded border p-2"
                                    placeholder="Invite Code..."
                                />
                                <div className="flex justify-end space-x-2">
                                    <button
                                        onClick={closeModal}
                                        className="rounded bg-gray-300 px-4 py-2 hover:bg-gray-400"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        onClick={handleInviteSubmit}
                                        className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                                    >
                                        Vào
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Dropdown;
