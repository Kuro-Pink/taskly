import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../../redux/features/authSlice';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const RegisterForm = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [emailError, setEmailError] = useState(''); // Lỗi email
    const [passwordError, setPasswordError] = useState(''); // Lỗi mật khẩu không khớp
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error } = useSelector((state) => state.auth);

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Regex chuẩn email
        return emailRegex.test(email);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateEmail(email)) {
            setEmailError('Email không hợp lệ!');
            return;
        }

        if (password !== confirmPassword) {
            setPasswordError('Mật khẩu nhập lại không khớp!');
            return;
        }

        setEmailError('');
        setPasswordError(''); // Xóa lỗi nếu đúng

        dispatch(registerUser({ name, email, password })).then((res) => {
            if (res.meta.requestStatus === 'fulfilled') {
                toast.success('🎉 Đăng ký thành công!');
                navigate('/auth/login');
            } else {
                toast.error(res.payload.message || 'Đăng ký thất bại!');
            }
        });
    };

    return (
        <div className="register-container">
            <h2>Đăng Ký</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Họ và tên"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    onBlur={() => {
                        if (!validateEmail(email)) setEmailError('Email không hợp lệ!');
                        else setEmailError('');
                    }}
                />
                {emailError && <p className="error">{emailError}</p>}
                <input
                    type="password"
                    placeholder="Mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Nhập lại mật khẩu"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />
                {passwordError && <p className="error">{passwordError}</p>}
                <button type="submit" disabled={loading}>
                    {loading ? 'Đang đăng ký...' : 'Đăng Ký'}
                </button>
            </form>
            {error && <p className="error">{error}</p>}
        </div>
    );
};

export default RegisterForm;
