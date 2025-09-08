import { useState } from 'react';

function Navbar() {
    const [avatars, setAvatars] = useState([
        'https://i.pravatar.cc/100?img=1',
        'https://i.pravatar.cc/100?img=2',
        'https://i.pravatar.cc/100?img=3',
    ]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [inviteCode, setInviteCode] = useState('');

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => {
        setIsModalOpen(false);
        setInviteCode('');
    };

    const handleInviteSubmit = () => {
        console.log('Invite code:', inviteCode);
        closeModal();
    };

    return (
        <div className="flex items-center space-x-2 bg-gray-100 p-4">
            {/* Title */}
            <div className="py-2">
                <nav>
                    <ol className="mb-2 flex text-gray-500">
                        <li>Dự ấn</li>
                        <li className="mx-4">/</li>
                        <li>Backlog</li>
                    </ol>
                </nav>
            </div>
            <div className="flex items-center space-x-2">
                {avatars.map((url, index) => (
                    <img key={index} src={url} alt="Avatar" className="h-10 w-10 rounded-full object-cover" />
                ))}
            </div>

            <button
                onClick={openModal}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-2xl font-bold text-blue-500 hover:bg-blue-100"
            >
                +
            </button>

            {/* Modal */}
            {isModalOpen && (
                <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
                    <div className="w-80 space-y-4 rounded-lg bg-white p-6">
                        <h2 className="text-xl font-semibold">Nhập Invite Code</h2>
                        <input
                            type="text"
                            value={inviteCode}
                            onChange={(e) => setInviteCode(e.target.value)}
                            className="w-full rounded border p-2"
                            placeholder="Invite Code..."
                        />
                        <div className="flex justify-end space-x-2">
                            <button onClick={closeModal} className="rounded bg-gray-300 px-4 py-2 hover:bg-gray-400">
                                Hủy
                            </button>
                            <button
                                onClick={handleInviteSubmit}
                                className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                            >
                                Gửi
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
export default Navbar;
