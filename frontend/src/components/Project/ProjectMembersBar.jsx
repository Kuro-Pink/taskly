import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Avatar, Tooltip, Modal, Box, Typography, Button, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import InviteModal from './InviteModal'; // đường dẫn bạn đặt

const boxStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 460,
    bgcolor: 'background.paper',
    borderRadius: 3,
    boxShadow: 24,
    p: 5,
};

const ProjectMembersBar = () => {
    const currentProject = useSelector((state) => state.projects.currentProject);
    const members = currentProject?.members || [];
    const inviteCode = currentProject?.inviteCode;

    const [openListModal, setOpenListModal] = useState(false);
    const [openInviteModal, setOpenInviteModal] = useState(false);
    const [copied, setCopied] = useState(false);
    const [copiedCode, setCopiedCode] = useState(false);
    // const [inviteEmail, setInviteEmail] = useState('');
    const [openGmailModal, setOpenGmailModal] = useState(false);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(
            `http://localhost:5173/projects/ENG/boards/681b3842b4965b4b00d2d38d/${inviteCode}`,
        );
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    const copyCode = () => {
        navigator.clipboard.writeText(inviteCode);
        setCopiedCode(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="mb-4 flex items-center space-x-2">
            {members.slice(0, 3).map((member, index) => (
                <Tooltip title={member.name} key={index}>
                    <Avatar sx={{ width: 28, height: 28, fontSize: 14 }}>
                        {member.name?.[0]?.toUpperCase() || '?'}
                    </Avatar>
                </Tooltip>
            ))}

            {members.length > 3 && (
                <Tooltip title="Xem thêm">
                    <Avatar
                        onClick={() => setOpenListModal(true)}
                        sx={{ width: 28, height: 28, fontSize: 14, cursor: 'pointer' }}
                    >
                        …
                    </Avatar>
                </Tooltip>
            )}

            <IconButton
                onClick={() => setOpenInviteModal(true)}
                sx={{ bgcolor: '#1976d2', color: 'white', '&:hover': { bgcolor: '#1565c0' }, width: 32, height: 32 }}
            >
                <AddIcon fontSize="small" />
            </IconButton>

            {/* Modal: Xem danh sách thành viên */}
            <Modal open={openListModal} onClose={() => setOpenListModal(false)}>
                <Box sx={{ ...boxStyle, width: 300, maxHeight: 400, overflowY: 'auto' }}>
                    <Typography variant="h5" mb={2}>
                        Thành viên dự án
                    </Typography>
                    {members.map((member, idx) => (
                        <Box
                            key={idx}
                            className="mb-2 flex w-full cursor-pointer items-center justify-between rounded p-2 hover:bg-gray-100"
                        >
                            <Box className="flex items-center space-x-2">
                                <Avatar sx={{ width: 32, height: 32 }}>{member.name?.[0]?.toUpperCase() || '?'}</Avatar>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontSize: '1rem',
                                    }}
                                >
                                    {member.name}
                                </Typography>
                            </Box>

                            <Typography
                                variant="body2"
                                sx={{
                                    color: 'primary.main',
                                    fontWeight: 'bold',
                                    fontSize: '1rem',
                                }}
                            >
                                {member.role || 'Member'}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </Modal>

            {/* Modal: Link tham gia dự án */}
            <Modal open={openInviteModal} onClose={() => setOpenInviteModal(false)}>
                <Box sx={boxStyle}>
                    <Typography variant="h5" mb={2}>
                        Mời thành viên vào dự án
                    </Typography>
                    <Box className="flex items-center justify-between rounded bg-gray-100 px-2 py-1">
                        <Typography mb={1}>
                            Mã phòng: <strong>{inviteCode}</strong>
                        </Typography>
                        <IconButton size="small" onClick={copyCode}>
                            <ContentCopyIcon fontSize="small" />
                        </IconButton>
                    </Box>
                    <Box className="flex items-center justify-between rounded border px-3 py-2">
                        <Typography variant="body2" noWrap sx={{ maxWidth: '80%' }}>
                            http://localhost:5173/projects/ENG/boards/681b3842b4965b4b00d2d38d/{inviteCode}
                        </Typography>
                        <IconButton size="small" onClick={copyToClipboard}>
                            <ContentCopyIcon fontSize="small" />
                        </IconButton>
                    </Box>

                    {/* // Trong Modal "Link tham gia dự án", thêm phần mời qua Gmail: */}
                    <Box mt={3}>
                        <Typography variant="subtitle1" mb={1}>
                            Mời qua Gmail:
                        </Typography>
                        <Button variant="contained" onClick={() => setOpenGmailModal(true)}>
                            Gửi lời mời qua Gmail
                        </Button>
                    </Box>
                    {/* // Sau toàn bộ JSX, thêm cuối component: */}
                    <InviteModal
                        open={openGmailModal}
                        onClose={() => setOpenGmailModal(false)}
                        projectId={currentProject?._id}
                    />
                    {/* <Box mt={3}>
                        <Typography variant="subtitle1" mb={1}>
                            Mời qua email:
                        </Typography>

                        <Box className="flex space-x-2">
                            <input
                                type="email"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                placeholder="email@example.com"
                                className="flex-1 rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                            <button
                                onClick={() => {
                                    if (!inviteEmail) return alert('Vui lòng nhập email');
                                    // TODO: Dispatch hoặc gọi API gửi mail mời
                                    alert(`Đã gửi email mời đến ${inviteEmail}`);
                                    setInviteEmail('');
                                }}
                                className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                            >
                                Gửi
                            </button>
                        </Box>
                    </Box> */}
                    {copiedCode && (
                        <Typography mt={2} color="success.main" fontSize={14}>
                            Đã sao chép mã phòng vào clipboard!
                        </Typography>
                    )}
                    {copied && (
                        <Typography mt={2} color="success.main" fontSize={14}>
                            Đã sao chép liên kết vào clipboard!
                        </Typography>
                    )}
                </Box>
            </Modal>
        </div>
    );
};

export default ProjectMembersBar;

// TÍCH HỢP TRỰC TIẾP
// import ProjectMembersBar from './components/ProjectMembersBar';
// ...
// <ProjectMembersBar />
