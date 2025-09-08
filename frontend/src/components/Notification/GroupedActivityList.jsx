import { useState, useEffect } from 'react';
import { Box, Typography, Stack } from '@mui/material';
import NotificationItem from './NotificationItem';
import ActivityItem from './ActivityItem';
import { useDispatch, useSelector } from 'react-redux';
import { fetchActivities } from '../../redux/features/notificationSlice';

import { format, isToday, isYesterday } from 'date-fns';
import { vi } from 'date-fns/locale';

const NotificationCenter = () => {
    const dispatch = useDispatch();
    const { activities } = useSelector((state) => state?.notification);

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
    }, [dispatch]);

    if (!activities) {
        return (
            <Typography variant="body2" color="text.secondary">
                Loading...
            </Typography>
        );
    }

    return (
        <Box width={400} p={2}>
            {/* Header */}
            <Typography variant="h5" fontWeight="bold">
                Các hoạt động
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '1.2rem' }}>
                Luôn cập nhật với những gì đang xảy ra trong dự án.
            </Typography>
            {/* Body */}
            <Box
                sx={{
                    maxHeight: 210,
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
                                <Typography variant="subtitle1" fontWeight="bold" color="text.primary" sx={{ mb: 1 }}>
                                    {label}
                                </Typography>
                                <Stack spacing={1}>
                                    {group.map((a) => (
                                        <ActivityItem key={a._id} activity={a} />
                                    ))}
                                </Stack>
                            </Box>
                        ))
                    )}
                </Stack>
            </Box>
        </Box>
    );
};

export default NotificationCenter;
