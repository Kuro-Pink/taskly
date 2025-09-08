import React from 'react';

const IssueDetailsModal = ({ issue, onClose }) => {
    if (!issue) return null;

    return (
        <div className="bg-opacity-30 fixed inset-0 z-50 flex items-center justify-center bg-black">
            <div className="relative max-h-[90vh] w-[700px] overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
                <button className="absolute top-3 right-3 text-gray-600 hover:text-black" onClick={onClose}>
                    ✕
                </button>

                <h2 className="mb-4 text-2xl font-semibold">{issue.title}</h2>

                <div className="space-y-2">
                    <p>
                        <strong>Type:</strong> {issue.type}
                    </p>
                    <p>
                        <strong>Status:</strong> In Progress
                    </p>
                    <p>
                        <strong>Sprint:</strong> {issue.sprint?.name || 'Backlog'}
                    </p>
                    <p>
                        <strong>Assignee:</strong> {issue.assignees?.[0]?.name || 'Unassigned'}
                    </p>
                    <p>
                        <strong>Reporter:</strong> {issue.reporter?.name || 'You'}
                    </p>
                    <p>
                        <strong>Description:</strong> {issue.description || 'No description'}
                    </p>
                </div>

                <div className="mt-6">
                    <h3 className="mb-2 text-lg font-semibold">Activity</h3>
                    <textarea className="w-full rounded-md border p-2" rows="3" placeholder="Add a comment..." />
                </div>
            </div>
        </div>
    );
};

export default IssueDetailsModal;
