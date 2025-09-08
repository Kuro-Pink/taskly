import { Card, CardContent, Typography } from '@mui/material';
import { formatDistanceToNow } from 'date-fns';

const ActivityItem = ({ activity }) => {
    const { user, action, target, createdAt } = activity;

    return (
        <Card variant="outlined" sx={{ mb: 1 }}>
            <CardContent>
                <Typography variant="body2">
                    <strong>{user}</strong> {action} <strong>{target}</strong>
                </Typography>
                <Typography variant="caption" color="text.disabled">
                    {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
                </Typography>
            </CardContent>
        </Card>
    );
};

export default ActivityItem;
