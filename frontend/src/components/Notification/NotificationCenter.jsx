import { useState, useEffect } from 'react';
import { Tabs, Tab, Box, Typography, Stack } from '@mui/material';
import NotificationItem from './NotificationItem';
import ActivityItem from './ActivityItem';
import { useDispatch, useSelector } from 'react-redux';
import { fetchActivities, fetchNotifications } from '../../redux/features/notificationSlice';

import { format, isToday, isYesterday } from 'date-fns';
import { vi } from 'date-fns/locale';
import { current } from '@reduxjs/toolkit';

const NotificationCenter = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const currentProject = useSelector((state) => state.projects?.currentProject);
    const { notifications, activities } = useSelector((state) => state?.notification);

    const [tab, setTab] = useState(0);

    const groupActivitiesByDate = (activities) => {
        return activities.reduce((groups, activity) => {
            const date = new Date(activity.updatedAt);
            let label;

            if (isToday(date)) {
                label = 'Hôm nay';
            } else if (isYesterday(date)) {
                label = 'Hôm qua';
            } else {
                label = format(date, 'dd/MM/yyyy', { locale: vi });
            }

            if (!groups[label]) groups[label] = [];
            groups[label].push(activity);
            return groups;
        }, {});
    };

    useEffect(() => {
        dispatch(fetchActivities());
        dispatch(fetchNotifications());
    }, [dispatch]);

    if (!Array.isArray(activities) || !Array.isArray(notifications) || !user || !currentProject) {
        return (
            <Typography variant="body2" color="text.secondary">
                Loading...
            </Typography>
        );
    }

    return (
        <Box width={400} p={2}>
            <Tabs value={tab} onChange={(_, newTab) => setTab(newTab)} centered>
                <Tab label="Notifications" />
                <Tab label="Activities" />
            </Tabs>

            <Box
                mt={2}
                sx={{
                    maxHeight: 360,
                    overflowY: 'auto',
                }}
            >
                {tab === 0 && (
                    <Stack spacing={1}>
                        {notifications.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">
                                No notifications
                            </Typography>
                        ) : (
                            Object.entries(groupActivitiesByDate(notifications)).map(([label, group]) => (
                                <Box key={label}>
                                    <Typography
                                        variant="subtitle1"
                                        fontWeight="bold"
                                        color="text.primary"
                                        sx={{ mb: 1 }}
                                    >
                                        {label}
                                    </Typography>
                                    <Stack spacing={1}>
                                        {group
                                            .filter((notify) => user?.id && notify.userId === user.id)
                                            .map((n) => (
                                                <NotificationItem key={n._id} notification={n} />
                                            ))}
                                    </Stack>
                                </Box>
                            ))
                        )}
                    </Stack>
                )}

                {tab === 1 && (
                    <Box
                        sx={{
                            maxHeight: 360,
                            overflowY: 'auto',
                        }}
                    >
                        <Stack spacing={2}>
                            {activities.length === 0 ? (
                                <Typography variant="body2" color="text.secondary">
                                    No activities
                                </Typography>
                            ) : (
                                Object.entries(groupActivitiesByDate(activities)).map(([label, group]) => (
                                    <Box key={label}>
                                        <Typography
                                            variant="subtitle1"
                                            fontWeight="bold"
                                            color="text.primary"
                                            sx={{ mb: 1 }}
                                        >
                                            {label}
                                        </Typography>
                                        <Stack spacing={1}>
                                            {group
                                                .filter(
                                                    (a) =>
                                                        currentProject?._id &&
                                                        String(a.projectId) === String(currentProject._id),
                                                )
                                                .map((a) => (
                                                    <ActivityItem key={a._id} activity={a} />
                                                ))}
                                        </Stack>
                                    </Box>
                                ))
                            )}
                        </Stack>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default NotificationCenter;
