import React, { useEffect, useState } from 'react';
import { Box, TextField, Button, Typography, Paper, CircularProgress } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../../redux/features/authSlice';
import { toast } from 'react-toastify';
import { useNavigate, useLocation } from 'react-router-dom';
import { requestJoinProject } from '../../redux/features/projectSlice';
import { clearInviteToken } from '../../redux/features/inviteSlice';

const LoginForm = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const token = useSelector((state) => state.invite.token);

    const location = useLocation();
    // const from = location.state?.from ? location.state.from.pathname + location.state.from.search : '/dashboard'; // hoặc '/' tùy bạn muốn sau đăng nhập vào đâu
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const { loading } = useSelector((state) => state?.auth);

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateEmail(email)) {
            setEmailError('Email không hợp lệ!');
            return;
        }

        const inviteToken = location.state?.inviteToken || localStorage.getItem('inviteToken');

        if (inviteToken) {
            // 👉 ĐĂNG NHẬP TỪ LINK MỜI
            handleLoginWithInvite(inviteToken);
        } else {
            // 👉 ĐĂNG NHẬP THỦ CÔNG
            handleNormalLogin();
        }
    };
    const handleNormalLogin = () => {
        dispatch(loginUser({ email, password }))
            .unwrap()
            .then(() => {
                toast.success('🎉 Đăng nhập thành công!');
                navigate('/dashboard');
            })
            .catch((error) => {
                const errorMessage = error?.message || 'Đăng nhập thất bại!';
                toast.error(errorMessage);
            });
    };

    const handleLoginWithInvite = (inviteToken) => {
        dispatch(loginUser({ email, password }))
            .then((res) => {
                if (res.meta.requestStatus === 'fulfilled') {
                    toast.success('🎉 Đăng nhập thành công!');

                    dispatch(requestJoinProject({ code: inviteToken }))
                        .unwrap()
                        .then((response) => {
                            dispatch(clearInviteToken());
                            localStorage.removeItem('inviteToken');
                            navigate(`/projects/${response.project.key}/boards/${response.project._id}`);
                        })
                        .catch(() => {
                            toast.error('Không thể tham gia dự án với mã mời này!');
                            dispatch(clearInviteToken());
                            localStorage.removeItem('inviteToken');
                            navigate('/dashboard');
                        });
                } else {
                    const errorMessage = res.payload?.message || 'Đăng nhập thất bại!';
                    toast.error(errorMessage);
                }
            })
            .catch((error) => {
                toast.error('Có lỗi bất ngờ xảy ra!');
                console.error('Login error:', error);
            });
    };

    return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#f5f5f5">
            <Paper elevation={3} sx={{ px: 4, pt: 4, width: 350 }}>
                <Typography variant="h5" align="center" gutterBottom>
                    Đăng Nhập
                </Typography>
                <form onSubmit={handleSubmit}>
                    <TextField
                        label="Email"
                        type="email"
                        fullWidth
                        margin="normal"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onBlur={() =>
                            !validateEmail(email) ? setEmailError('Email không hợp lệ!') : setEmailError('')
                        }
                        error={!!emailError}
                        helperText={emailError}
                        required
                    />
                    <TextField
                        label="Mật khẩu"
                        type="password"
                        fullWidth
                        margin="normal"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <Box mt={2}>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            fullWidth
                            disabled={loading}
                            startIcon={loading && <CircularProgress size={16} color="inherit" />}
                        >
                            {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
                        </Button>
                    </Box>
                </form>
                <Typography sx={{ py: 2 }} variant="h6" align="center" gutterBottom>
                    Bạn chưa có tài khoản?{' '}
                    <Button
                        variant="text"
                        color="primary"
                        onClick={() =>
                            navigate(
                                '/auth/register',
                                //  { state: { from } }
                            )
                        }
                    >
                        Đăng Ký
                    </Button>
                </Typography>
            </Paper>
        </Box>
    );
};

export default LoginForm;
