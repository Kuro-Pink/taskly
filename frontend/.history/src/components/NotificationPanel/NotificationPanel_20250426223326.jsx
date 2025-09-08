// NotificationPanel.jsx
import React, { useState } from 'react';
import {
    Box,
    Typography,
    IconButton,
    Switch,
    List,
    ListItem,
    ListItemText,
    ListItemButton,
    Divider,
} from '@mui/material';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';

const NotificationPanel = ({ notifications = [] }) => {
    const [showOnlyUnread, setShowOnlyUnread] = useState(false);

    const handleToggleUnread = () => {
        setShowOnlyUnread(!showOnlyUnread);
    };

    const handleNotificationClick = (link) => {
        window.location.href = link; // Hoặc dùng router nếu cần
    };

    const filteredNotifications = showOnlyUnread ? notifications.filter((n) => !n.isRead) : notifications;

    return (
        <Box width={400} p={2} bgcolor="background.paper" borderRadius={2} boxShadow={3}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h6">Notifications</Typography>
                <Box display="flex" alignItems="center">
                    <Typography variant="body2" mr={1}>
                        Only show unread
                    </Typography>
                    <Switch checked={showOnlyUnread} onChange={handleToggleUnread} />
                </Box>
            </Box>

            {filteredNotifications.length === 0 ? (
                <Box textAlign="center" mt={5} mb={5}>
                    <NotificationsNoneIcon sx={{ fontSize: 80, color: 'grey.400' }} />
                    <Typography variant="body2" color="text.secondary" mt={2}>
                        You have no notifications from the last 30 days.
                    </Typography>
                </Box>
            ) : (
                <List>
                    {filteredNotifications.map((notification) => (
                        <React.Fragment key={notification._id}>
                            <ListItem disablePadding>
                                <ListItemButton onClick={() => handleNotificationClick(notification.link)}>
                                    <ListItemText
                                        primary={notification.title}
                                        secondary={new Date(notification.createdAt).toLocaleString()}
                                        primaryTypographyProps={{
                                            fontWeight: notification.isRead ? 'normal' : 'bold',
                                        }}
                                    />
                                </ListItemButton>
                            </ListItem>
                            <Divider />
                        </React.Fragment>
                    ))}
                </List>
            )}

            {/* Shortcut Hint */}
            <Box mt={3} textAlign="center">
                <Typography variant="body2" color="text.secondary">
                    Press ↑ ↓ to move through notifications.
                </Typography>
            </Box>
        </Box>
    );
};

export default NotificationPanel;
