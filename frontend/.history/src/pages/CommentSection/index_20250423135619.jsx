import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import socket from '../utils/socket'; // Đã setup sẵn socket.io-client
import axios from 'axios';

const CommentSection = ({ issueId }) => {
    //<CommentSection issueId={selectedIssue._id} />
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const user = useSelector((state) => state.auth.user);

    useEffect(() => {
        fetchComments();
        socket.emit('join-issue', issueId);

        socket.on('new-comment', (comment) => {
            setComments((prev) => [...prev, comment]);
        });

        return () => socket.off('new-comment');
    }, [issueId]);

    const fetchComments = async () => {
        const res = await axios.get(`/api/comments/${issueId}`);
        setComments(res.data);
    };

    const handleSubmit = async () => {
        if (!newComment) return;
        await axios.post('/api/comments', { content: newComment, issue: issueId });
        setNewComment('');
    };

    return (
        <div className="mt-4 border-t pt-2">
            <h3 className="mb-2 text-sm font-semibold">Bình luận</h3>
            {comments.map((c) => (
                <div key={c._id} className="mb-2 text-sm">
                    <strong>{c.author.name}: </strong>
                    {c.content}
                </div>
            ))}
            <div className="mt-2 flex gap-2">
                <input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1 rounded border p-1 text-sm"
                    placeholder="Viết bình luận..."
                />
                <button onClick={handleSubmit} className="rounded bg-blue-500 px-3 text-sm text-white">
                    Gửi
                </button>
            </div>
        </div>
    );
};

export default CommentSection;
