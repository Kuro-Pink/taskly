import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import { toast } from 'react-toastify';

const InviteModal = ({ open, onClose, projectId }) => {
    const [email, setEmail] = useState('');

    const handleInvite = async () => {
        if (!email) return toast.error('Vui lòng nhập email');

        try {
            const res = await fetch(`/api/projects/${projectId}/invite`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            let data;
            try {
                data = await res.json();
            } catch {
                data = { message: 'Lỗi hệ thống hoặc không trả về JSON' };
            }

            if (res.ok) {
                toast.success('📩 Lời mời đã được gửi!');
                setEmail('');
                onClose();
            } else {
                toast.error(data.message || 'Lỗi gửi lời mời');
            }
        } catch (err) {
            toast.error('Gửi lời mời thất bại');
            console.error(err);
        }
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Mời thành viên qua Gmail</DialogTitle>
            <DialogContent>
                <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    sx={{ mt: 1 }}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Huỷ</Button>
                <Button onClick={handleInvite} variant="contained">
                    Gửi lời mời
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default InviteModal;
