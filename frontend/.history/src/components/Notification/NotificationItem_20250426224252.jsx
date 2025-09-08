import { Card, CardContent, Typography, Badge, Box } from '@mui/material';
import { notificationIcons } from './notificationIcons';
import { formatDistanceToNow } from 'date-fns';

const NotificationItem = ({ notification, onClick }) => {
    const { type, title, message, isRead, createdAt } = notification;

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
            }}
            onClick={onClick}
        >
            <Box p={2}>
                <Badge variant="dot" color="error" invisible={isRead}>
                    {notificationIcons[type] || <NotificationsActiveIcon />}
                </Badge>
            </Box>

            <CardContent sx={{ flex: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                    {title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {message}
                </Typography>
                <Typography variant="caption" color="text.disabled">
                    {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
                </Typography>
            </CardContent>
        </Card>
    );
};

export default NotificationItem;
