import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { closeDetailModal } from '../../redux/features/modalDetailSlice';

const IssueDetailsModal = ({ issue }) => {
    const dispatch = useDispatch();
    const [showDetails, setShowDetails] = useState(true);
    const [editableIssue, setEditableIssue] = useState({ ...issue });

    if (!issue) return null;

    const handleChange = (field, value) => {
        setEditableIssue((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-16">
            <div className="max-h-[90vh] w-[700px] overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
                <div className="mb-4 flex items-center justify-between border-b pb-3">
                    <h2 className="text-xl font-semibold text-gray-800">
                        {editableIssue.title} <span className="text-sm text-gray-400">#{editableIssue._id}</span>
                    </h2>
                    <button
                        className="text-xl text-gray-500 hover:text-black"
                        onClick={() => dispatch(closeDetailModal())}
                    >
                        &times;
                    </button>
                </div>

                <button
                    className="mb-4 text-sm text-blue-600 hover:underline"
                    onClick={() => setShowDetails((prev) => !prev)}
                >
                    {showDetails ? 'Ẩn chi tiết' : 'Hiện chi tiết'}
                </button>

                {showDetails && (
                    <table className="mb-6 w-full border text-sm">
                        <tbody>
                            <tr>
                                <td className="border px-2 py-1 font-medium">Title</td>
                                <td className="border px-2 py-1">
                                    <input
                                        value={editableIssue.title || ''}
                                        onChange={(e) => handleChange('title', e.target.value)}
                                        className="w-full rounded border px-2 py-1"
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="border px-2 py-1 font-medium">Type</td>
                                <td className="border px-2 py-1">
                                    <input
                                        value={editableIssue.type || ''}
                                        onChange={(e) => handleChange('type', e.target.value)}
                                        className="w-full rounded border px-2 py-1"
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="border px-2 py-1 font-medium">Status</td>
                                <td className="border px-2 py-1">
                                    <input
                                        value={editableIssue.status?.name || ''}
                                        onChange={(e) =>
                                            handleChange('status', { ...editableIssue.status, name: e.target.value })
                                        }
                                        className="w-full rounded border px-2 py-1"
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="border px-2 py-1 font-medium">Assignee</td>
                                <td className="border px-2 py-1">
                                    <input
                                        value={editableIssue.assignee?.name || ''}
                                        onChange={(e) =>
                                            handleChange('assignee', {
                                                ...editableIssue.assignee,
                                                name: e.target.value,
                                            })
                                        }
                                        className="w-full rounded border px-2 py-1"
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="border px-2 py-1 font-medium">Start Date</td>
                                <td className="border px-2 py-1">
                                    <input
                                        type="date"
                                        value={editableIssue.startDate?.slice(0, 10) || ''}
                                        onChange={(e) => handleChange('startDate', e.target.value)}
                                        className="w-full rounded border px-2 py-1"
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="border px-2 py-1 font-medium">End Date</td>
                                <td className="border px-2 py-1">
                                    <input
                                        type="date"
                                        value={editableIssue.endDate?.slice(0, 10) || ''}
                                        onChange={(e) => handleChange('endDate', e.target.value)}
                                        className="w-full rounded border px-2 py-1"
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                )}

                {/* Các phần còn lại UI gốc giữ nguyên ở đây */}
            </div>
        </div>
    );
};

export default IssueDetailsModal;
