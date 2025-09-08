import { Card, CardContent, Typography, Badge, Box } from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import { notificationIcons } from '../../components/Notification/notificationIcons';

const ActivityItem = ({ activity }) => {
    const { username, type, action, target, updatedAt } = activity;

    // const iconData = notificationIcons[type] || NotificationsActiveIcon;
    // if (!iconData) return null;

    // const IconComponent = iconData.icon;

    return (
        <Card
            variant="outlined"
            sx={{
                mb: 1,
                height: 80, // 👈 chỉnh chiều cao (ví dụ 72px)
                display: 'flex',
                alignItems: 'center',
                px: 1,
                p: 2,
            }}
        >
            {/* <Box p={1}>
                <Badge variant="dot" color="error" invisible={isRead}>
                    <IconComponent style={{ color: iconData.color, fontSize: 20 }} />
                </Badge>
            </Box> */}

            <CardContent sx={{ py: 3, px: 1, width: '100%' }}>
                <Typography variant="body2" fontSize={12}>
                    <strong>{username}</strong> {action} <strong>{target}</strong>
                </Typography>
                <Typography variant="caption" color="text.disabled" fontSize={10}>
                    {formatDistanceToNow(new Date(updatedAt), { addSuffix: true, locale: vi })}
                </Typography>
            </CardContent>
        </Card>
    );
};

export default ActivityItem;
