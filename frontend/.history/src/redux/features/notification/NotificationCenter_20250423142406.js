import { useSelector, useDispatch } from 'react-redux';
import { clearNotifications } from './notificationSlice';

export default function NotificationCenter() {
    const { toasts, unreadCount } = useSelector((state) => state.notification);
    const dispatch = useDispatch();

    return (
        <div className="p-4">
            <div className="flex justify-between">
                <h2 className="text-lg font-bold">Thông báo ({unreadCount})</h2>
                <button onClick={() => dispatch(clearNotifications())}>Xóa</button>
            </div>
            <ul className="mt-2">
                {toasts.map((t, idx) => (
                    <li key={idx} className="border-b p-2">
                        <b>{t.type}</b>: {t.message}
                    </li>
                ))}
            </ul>
        </div>
    );
}
