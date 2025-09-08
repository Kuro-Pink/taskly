import { useState } from 'react';

const IssueDetailsModal = ({ issue, onClose }) => {
    if (!issue) return null;

    const [editedTitle, setEditedTitle] = useState(issue.title || '');
    const [editedDescription, setEditedDescription] = useState(issue.description || '');
    const [editedType, setEditedType] = useState(issue.type || 'Task');
    const [editedAssignee, setEditedAssignee] = useState(issue.assignee?.name || '');

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-auto bg-black/30 p-6 pt-20">
            <div className="h-[620px] w-[1160px] rounded-lg bg-white shadow-2xl">
                {/* Header */}
                <div className="flex h-[60px] items-center justify-between border-b px-8">
                    <div>
                        <span className="rounded bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                            {issue.type || 'Task'}
                        </span>
                        <h2 className="mt-2 text-2xl font-bold text-gray-900">{issue.title}</h2>
                    </div>
                    <button className="text-3xl text-gray-400 hover:text-gray-700" onClick={onClose}>
                        ×
                    </button>
                </div>

                {/* Body */}
                <div className="h-[612px] overflow-y-auto px-8 py-6">
                    {/* Description */}
                    <div className="mb-8">
                        <h3 className="mb-2 text-base font-semibold text-gray-700">Description</h3>
                        <textarea
                            className="w-full rounded-md border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                            rows={4}
                            placeholder="Add a description..."
                            defaultValue={issue.description || ''}
                        />
                    </div>

                    {/* Info Section */}
                    <div className="mb-8 grid grid-cols-2 gap-6">
                        <div>
                            <label className="mb-1 block text-sm font-semibold text-gray-700">Assignee</label>
                            <input
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                                value={issue.assignee?.name || 'Unassigned'}
                                readOnly
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-semibold text-gray-700">Reporter</label>
                            <input
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                                value={issue.reporter?.name || 'You'}
                                readOnly
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-semibold text-gray-700">Sprint</label>
                            <input
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                                value={issue.sprint?.name || 'Backlog'}
                                readOnly
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-semibold text-gray-700">Tags</label>
                            <div className="flex flex-wrap gap-2">
                                {(issue.tags || []).map((tag, idx) => (
                                    <span key={idx} className="rounded bg-gray-200 px-3 py-1 text-sm text-gray-800">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Comment Section */}
                    <div>
                        <h3 className="mb-2 text-base font-semibold text-gray-700">Activity</h3>
                        <textarea
                            className="w-full rounded-md border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                            rows={4}
                            placeholder="Add a comment..."
                        ></textarea>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IssueDetailsModal;
