import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Paper, CircularProgress } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../../redux/features/authSlice';
import { toast } from 'react-toastify';
import { useNavigate, useLocation } from 'react-router-dom';

const RegisterForm = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    // const location = useLocation();
    // const from = location.state?.from ? location.state.from.pathname + location.state.from.search : '/dashboard'; // hoặc '/' tùy bạn muốn sau đăng nhập vào đâu
    const { loading } = useSelector((state) => state.auth);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const handleSubmit = (e) => {
        e.preventDefault();

        let hasError = false;

        if (!validateEmail(email)) {
            setEmailError('Email không hợp lệ!');
            hasError = true;
        } else {
            setEmailError('');
        }

        if (password !== confirmPassword) {
            setPasswordError('Mật khẩu nhập lại không khớp!');
            hasError = true;
        } else {
            setPasswordError('');
        }

        if (hasError) return;

        dispatch(registerUser({ name, email, password })).then((res) => {
            if (res.meta.requestStatus === 'fulfilled') {
                toast.success('🎉 Đăng ký thành công!');
                navigate('/auth/login');
            } else {
                toast.error(res.payload?.message || 'Đăng ký thất bại!');
            }
        });
    };

    return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#f5f5f5">
            <Paper elevation={3} sx={{ padding: 4, width: 400 }}>
                <Typography variant="h5" align="center" gutterBottom>
                    Đăng Ký
                </Typography>
                <form onSubmit={handleSubmit}>
                    <TextField
                        label="Họ và tên"
                        fullWidth
                        margin="normal"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
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
                    <TextField
                        label="Nhập lại mật khẩu"
                        type="password"
                        fullWidth
                        margin="normal"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        error={!!passwordError}
                        helperText={passwordError}
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
                            {loading ? 'Đang đăng ký...' : 'Đăng Ký'}
                        </Button>
                    </Box>
                </form>
                <Typography variant="h6" align="center" gutterBottom>
                    Quay lại đăng nhập?{' '}
                    <Button
                        variant="text"
                        color="secondary"
                        onClick={() =>
                            navigate(
                                '/auth/login',
                                // { state: { from } }
                            )
                        }
                    >
                        Đăng nhập
                    </Button>
                </Typography>
            </Paper>
        </Box>
    );
};

export default RegisterForm;
