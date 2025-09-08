import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';

import { publicRoutes } from './routes';
import { DefaultLayout } from './components/Layout';

import { initWebSocket } from './utils/webSocket';
import { getUserInfo } from './redux/features/authSlice';

function App() {
    const dispatch = useDispatch();
    const { user, token, loading, error } = useSelector((state) => state.auth);

    const userId = user?.id; // Lấy userId từ Redux state

    useEffect(() => {
        if (userId) {
            initWebSocket(userId, dispatch); // Gửi userId để tham gia phòng riêng
        }
    }, [userId, dispatch]); // Gọi lại mỗi khi userId hoặc dispatch thay đổi

    useEffect(() => {
        if (token) {
            dispatch(getUserInfo(token)); // Gọi API để lấy thông tin người dùng nếu có token
        }
    }, [token, dispatch]);

    if (loading) {
        return <div>Đang tải...</div>;
    }

    if (error) {
        return <div>Lỗi: {error}</div>;
    }

    if (!user) {
        return <div>Vui lòng đăng nhập</div>;
    }

    return (
        <>
            <Toaster position="top-right" />
            <Router>
                <div className="App">
                    <Routes>
                        {publicRoutes.map((route, index) => {
                            const Page = route.component;

                            let Layout = DefaultLayout;

                            if (route.layout) {
                                Layout = route.layout;
                            } else if (route.layout === null) {
                                Layout = Fragment;
                            }

                            return (
                                <Route
                                    key={index}
                                    path={route.path}
                                    element={
                                        <Layout>
                                            <Page />
                                        </Layout>
                                    }
                                />
                            );
                        })}
                    </Routes>
                </div>
            </Router>
        </>
    );
}

export default App;
