import { Card, CardContent, Typography, Badge, Box } from '@mui/material';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import { notificationIcons } from '../../components/Notification/notificationIcons';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const NotificationItem = ({ notification, onClick }) => {
    const { username, target, type, isRead, createdAt, title, message } = notification;

    const iconData = notificationIcons[type] || NotificationsActiveIcon;
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
                px: 0.5, // Giảm padding cho Card
            }}
            onClick={onClick}
        >
            <Box p={1}>
                <Badge variant="dot" color="error" invisible={isRead}>
                    <IconComponent style={{ color: iconData.color, fontSize: 20 }} />
                </Badge>
            </Box>

            <CardContent sx={{ flex: 1, p: 1.5 }}>
                {' '}
                {/* Giảm padding cho CardContent */}
                <Typography variant="body2" color="text.primary" sx={{ fontSize: '1.1rem', fontWeight: 600 }}>
                    {message || `${username} đã giao ${target}`}
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
