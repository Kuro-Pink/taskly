import { Card, CardContent, Typography } from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const ActivityItem = ({ activity }) => {
    const { username, action, target, updatedAt } = activity;
    if (!activity) return null;

    return (
        <Card
            variant="outlined"
            sx={{
                mb: 1,
                height: 76, // 👈 chỉnh chiều cao (ví dụ 72px)
                display: 'flex',
                alignItems: 'center',
            }}
        >
            <CardContent sx={{ py: 2, px: 1, width: '100%' }}>
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
