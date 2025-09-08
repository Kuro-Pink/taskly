import { useState, useEffect } from 'react';
import { Tabs, Tab, Box, Typography, Stack } from '@mui/material';
import NotificationItem from './NotificationItem';
import ActivityItem from './ActivityItem';

const NotificationCenter = ({ notifications, activities, onNotificationClick }) => {
    const [tab, setTab] = useState(0);

    return (
        <Box width={400} p={2}>
            <Tabs value={tab} onChange={(_, newTab) => setTab(newTab)} centered>
                <Tab label="Notifications" />
                <Tab label="Activities" />
            </Tabs>

            <Box mt={2}>
                {tab === 0 && (
                    <Stack spacing={1}>
                        {notifications.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">
                                No notifications
                            </Typography>
                        ) : (
                            notifications.map((n) => (
                                <NotificationItem key={n._id} notification={n} onClick={() => onNotificationClick(n)} />
                            ))
                        )}
                    </Stack>
                )}

                {tab === 1 && (
                    <Stack spacing={1}>
                        {activities.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">
                                No activities
                            </Typography>
                        ) : (
                            activities.map((a) => <ActivityItem key={a._id} activity={a} />)
                        )}
                    </Stack>
                )}
            </Box>
        </Box>
    );
};

export default NotificationCenter;
