import { useSelector } from 'react-redux';

export default function Toast() {
    const { toasts } = useSelector((state) => state.notification);

    return (
        <div className="fixed top-4 right-4 z-50 space-y-2">
            {toasts.map((toast, index) => (
                <div key={index} className="rounded-md bg-blue-100 p-2 shadow-md">
                    <strong>{toast.type.toUpperCase()}</strong>: {toast.message}
                </div>
            ))}
        </div>
    );
}
