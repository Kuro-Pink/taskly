import { Card, CardContent, Typography, Badge, Box } from '@mui/material';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import { notificationIcons } from './notificationIcons';
import { formatDistanceToNow } from 'date-fns';
import { markAsRead } from '../../redux/features/notificationSlice';
import { vi } from 'date-fns/locale';
import { useDispatch } from 'react-redux';

const NotificationItem = ({ notification }) => {
    const dispatch = useDispatch();
    const { username, target, action, type, isRead, createdAt, title, message } = notification;

    const iconData = notificationIcons[type] || {
        icon: NotificationsActiveIcon,
        color: '#1976d2', // hoặc màu mặc định
    };
    if (!iconData) return null;

    const IconComponent = iconData.icon;
    return (
        <Card
            variant="outlined"
            sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 1,
                cursor: 'pointer',
                bgcolor: isRead ? 'background.paper' : 'action.hover',
                '&:hover': { bgcolor: 'action.selected' },
                maxWidth: 380, // Điều chỉnh chiều rộng để item nhỏ lại
                maxHeight: 76, // Giới hạn chiều cao của Card
                p: 0.5, // Giảm padding cho Card
            }}
            onClick={() => dispatch(markAsRead(notification._id))}
        >
            <Box p={1}>
                <Badge variant="dot" color="error" invisible={isRead}>
                    <IconComponent style={{ color: iconData.color, fontSize: 20 }} />{' '}
                </Badge>
            </Box>

            <CardContent sx={{ flex: 1, px: 1.5 }}>
                {' '}
                {/* Giảm padding cho CardContent */}
                <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1.3rem' }}>
                    {title || 'Thông báo'}
                </Typography>
                <Typography variant="body2" color="text.primary" sx={{ fontSize: '1.1rem' }}>
                    {message
                        ? message
                        : action === 'sắp hết hạn' || action === 'đã quá hạn'
                          ? `${username} thông báo ${target} ${action}`
                          : `${username} ${action} ${target}`}
                </Typography>
                <Typography variant="caption" color="text.disabled" sx={{ fontSize: '1rem' }}>
                    {formatDistanceToNow(new Date(createdAt), {
                        addSuffix: true,
                        locale: vi,
                    })}
                </Typography>
            </CardContent>
        </Card>
    );
};

export default NotificationItem;
