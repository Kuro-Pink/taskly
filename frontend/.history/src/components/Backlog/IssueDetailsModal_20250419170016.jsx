import React from 'react';

const IssueDetailsModal = ({ issue, onClose }) => {
    if (!issue) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-auto bg-black/30 p-6 pt-20">
            <div className="h-[680px] w-[1160px] rounded-lg bg-white shadow-2xl">
                {/* Header */}
                <div className="flex h-[68px] items-center justify-between border-b px-6">
                    <div>
                        <span className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                            {issue.type || 'Task'}
                        </span>
                        <h2 className="mt-1 text-xl font-semibold text-gray-800">{issue.title}</h2>
                    </div>
                    <button className="text-2xl text-gray-500 hover:text-gray-800" onClick={onClose}>
                        ×
                    </button>
                </div>

                {/* Body */}
                <div className="h-[612px] overflow-y-auto px-6 py-4">
                    {/* Description */}
                    <div className="mb-6">
                        <h3 className="text-sm font-medium text-gray-600">Description</h3>
                        <p className="mt-1 text-sm text-gray-800">{issue.description || 'No description provided.'}</p>
                    </div>

                    {/* Info Section (moved from right column) */}
                    <div className="mb-6 grid grid-cols-2 gap-4">
                        <div>
                            <h3 className="text-sm font-medium text-gray-600">Assignee</h3>
                            <p className="mt-1 text-sm text-gray-800">{issue.assignee?.name || 'Unassigned'}</p>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-gray-600">Reporter</h3>
                            <p className="mt-1 text-sm text-gray-800">{issue.reporter?.name || 'You'}</p>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-gray-600">Sprint</h3>
                            <p className="mt-1 text-sm text-gray-800">{issue.sprint?.name || 'Backlog'}</p>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-gray-600">Tags</h3>
                            <div className="mt-1 flex flex-wrap gap-2">
                                {(issue.tags || []).map((tag, idx) => (
                                    <span key={idx} className="rounded bg-gray-200 px-2 py-1 text-xs text-gray-700">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Comment Section */}
                    <div>
                        <h3 className="text-sm font-medium text-gray-600">Activity</h3>
                        <textarea
                            className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                            rows={3}
                            placeholder="Add a comment..."
                        ></textarea>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IssueDetailsModal;
