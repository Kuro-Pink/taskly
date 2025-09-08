import { Box, Typography, Stack, Tooltip, LinearProgress, Avatar, useTheme } from '@mui/material';
import { useSelector } from 'react-redux';

const TeamWorkload = () => {
    const currentProject = useSelector((state) => state.projects?.currentProject);
    const { issues } = useSelector((state) => state.backlog);
    const theme = useTheme();

    if (!currentProject) return null;

    const total = issues.length;

    // Tính số lượng công việc theo assigneeId
    const workloadMap = {};
    for (let issue of issues) {
        const assigneeId = issue.assignee || 'unassigned';
        workloadMap[assigneeId] = (workloadMap[assigneeId] || 0) + 1;
    }

    const members = currentProject?.members.map((m) => m.user);

    const assignees = [
        {
            id: 'unassigned',
            name: 'Chưa được phân bổ',
            avatar: '',
            count: workloadMap['unassigned'] || 0,
        },
        ...members.map((user) => ({
            id: user._id,
            name: user.name,
            avatar: user.avatarUrl || '',
            count: workloadMap[user._id] || 0,
        })),
    ].filter((a) => a.count > 0);

    const getBarColor = (percent) => {
        if (percent >= 50) return theme.palette.error.main;
        if (percent >= 30) return theme.palette.warning.main;
        return theme.palette.success.main;
    };

    return (
        <Box p={2} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, height: 296 }}>
            <Typography variant="h5" fontWeight="bold">
                Phân công công việc
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '1.2rem' }}>
                Nắm bắt được công việc của các thành viên
            </Typography>

            <Stack spacing={2}>
                {assignees.map((a) => {
                    const percent = Math.round((a.count / total) * 100);
                    const barColor = getBarColor(percent);

                    return (
                        <Stack key={a.id} direction="row" spacing={2} alignItems="center">
                            <Avatar sx={{ width: 28, height: 28 }}>
                                {a.id === 'unassigned' ? (
                                    '👤'
                                ) : a.avatar ? (
                                    <img src={a.avatar} alt={a.name} style={{ width: '100%' }} />
                                ) : (
                                    a.name[0]
                                )}
                            </Avatar>
                            <Box flexGrow={1}>
                                <Typography variant="body2" fontWeight={500}>
                                    {a.name}
                                </Typography>
                                <Tooltip
                                    title={
                                        <Typography sx={{ fontSize: 14 }}>
                                            {a.count} / {total} work items
                                        </Typography>
                                    }
                                    arrow
                                >
                                    <LinearProgress
                                        variant="determinate"
                                        value={percent}
                                        sx={{
                                            height: 12,
                                            borderRadius: 1,
                                            mt: 0.5,
                                            backgroundColor: '#e0e0e0',
                                            '& .MuiLinearProgress-bar': {
                                                backgroundColor: barColor,
                                            },
                                        }}
                                    />
                                </Tooltip>
                            </Box>
                            <Typography variant="body2" sx={{ minWidth: 40 }}>
                                {percent}%
                            </Typography>
                        </Stack>
                    );
                })}
            </Stack>
        </Box>
    );
};

export default TeamWorkload;
