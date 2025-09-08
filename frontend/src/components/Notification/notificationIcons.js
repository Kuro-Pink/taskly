import CheckBoxOutlinedIcon from '@mui/icons-material/CheckBoxOutlined'; // Task
import FlashOnOutlinedIcon from '@mui/icons-material/FlashOnOutlined'; // Epic
import BookmarkBorderOutlinedIcon from '@mui/icons-material/BookmarkBorderOutlined'; // Story
import BugReportOutlinedIcon from '@mui/icons-material/BugReportOutlined'; // Bug
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline'; // 💬

export const notificationIcons = {
    task: {
        icon: CheckBoxOutlinedIcon,
        color: '#3b82f6',
    },
    epic: {
        icon: FlashOnOutlinedIcon,
        color: '#a855f7',
    },
    story: {
        icon: BookmarkBorderOutlinedIcon,
        color: '#22c55e',
    },
    bug: {
        icon: BugReportOutlinedIcon,
        color: '#ef4444',
    },
    assign: {
        icon: AssignmentIndIcon,
        color: '#ef4444',
    },
    comment: {
        icon: ChatBubbleOutlineIcon,
        color: '#10b981', // 💬 xanh lá (green-500), bạn có thể đổi
    },
};
