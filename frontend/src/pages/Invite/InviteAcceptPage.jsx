import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { setInviteToken } from '../../redux/features/inviteSlice';

const InviteAcceptPage = () => {
    const location = useLocation();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const query = new URLSearchParams(location.search);
    const token = query.get('token');

    useEffect(() => {
        if (token) {
            dispatch(setInviteToken(token));
        }

        // Nếu chưa đăng nhập, chuyển về login (nhớ from)
        navigate('/auth/login', { state: { from: location }, replace: true });
    }, [token, dispatch]);

    return null; // hoặc loading indicator
};

export default InviteAcceptPage;
