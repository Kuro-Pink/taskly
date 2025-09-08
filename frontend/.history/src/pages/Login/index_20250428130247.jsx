import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../../redux/features/authSlice';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState(''); // Lỗi email
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error } = useSelector((state) => state?.auth);

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
        dispatch(loginUser({ email, password }))
            .then((res) => {
                if (res.meta.requestStatus === 'fulfilled') {
                    toast.success('🎉 Đăng nhập thành công!');
                    navigate('/dashboard');
                } else {
                    let errorMessage = 'Đăng nhập thất bại!';
                    if (typeof res.payload === 'string') {
                        errorMessage = res.payload;
                    } else if (res.payload?.message) {
                        errorMessage = res.payload.message;
                    }
                    toast.error(errorMessage);
                }
            })
            .catch((error) => {
                // Nếu lỗi ngoài dự đoán (exception)
                toast.error('Có lỗi bất ngờ xảy ra!');
                console.error('Login error:', error);
            });
    };

    return (
        <div className="login-container">
            <h2>Đăng Nhập</h2>
            <form onSubmit={handleSubmit}>
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
                <button type="submit" disabled={loading}>
                    {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
                </button>
            </form>
            {/* {error && <p className="error">{error}</p>} */}
        </div>
    );
};

export default LoginForm;
