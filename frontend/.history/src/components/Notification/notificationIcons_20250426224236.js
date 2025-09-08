import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import UpdateIcon from '@mui/icons-material/Update';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import VisibilityIcon from '@mui/icons-material/Visibility';

export const notificationIcons = {
    assignment: <AssignmentIndIcon color="primary" />,
    comment: <ChatBubbleOutlineIcon color="success" />,
    mention: <NotificationsActiveIcon color="secondary" />,
    progress: <EmojiEventsIcon color="warning" />,
    status_update: <UpdateIcon color="info" />,
    deadline_reminder: <AccessTimeIcon color="error" />,
    watcher: <VisibilityIcon color="action" />,
};
