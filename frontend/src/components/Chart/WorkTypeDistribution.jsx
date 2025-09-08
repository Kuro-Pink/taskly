import { Box, Typography, Stack, Tooltip } from '@mui/material';
import { useSelector } from 'react-redux';

const typeColors = {
    Story: '#3b9eff',
    Epic: '#a259ff',
    Task: '#73aa24',
    Subtask: '#7f8c8d',
    Bug: '#e74c3c',
};

const WorkTypeDistribution = () => {
    const { issues } = useSelector((state) => state.backlog);
    const { epics } = useSelector((state) => state.epics);
    const currentProject = useSelector((state) => state.projects?.currentProject);

    // Đếm các loại từ issues
    const counts = issues
        .filter((i) => i.project === currentProject._id)
        .reduce((acc, issue) => {
            const type = issue.type || 'Unknown';
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {});

    // Thêm riêng Epics từ state.epics
    counts['Epic'] = epics.filter((e) => e.project === currentProject._id)?.length || 0;

    const total = Object.values(counts).reduce((sum, count) => sum + count, 0);

    const data = Object.entries(counts).map(([type, count]) => ({
        type,
        count,
        percent: total > 0 ? Math.round((count / total) * 100) : 0,
        color: typeColors[type] || '#ccc',
    }));

    return (
        <Box p={2} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, width: 416, height: 296 }}>
            <Typography variant="h5" fontWeight="bold">
                Loại công việc
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '1.2rem' }}>
                Phân loại công việc theo mục đích của chúng.
            </Typography>

            <Stack direction="row" justifyContent="space-between" mb={1}>
                <Typography fontWeight={600} fontSize={14}>
                    Loại vấn đề
                </Typography>
                <Typography fontWeight={600} fontSize={12}>
                    Sự phân bổ
                </Typography>
            </Stack>

            {data.map(({ type, percent, count, color }) => (
                <Stack key={type} direction="row" alignItems="center" spacing={2} mb={1}>
                    <Box minWidth={60}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <Box width={12} height={12} borderRadius="2px" sx={{ backgroundColor: color }} />
                            <Typography fontSize={13}>{type}</Typography>
                        </Stack>
                    </Box>

                    <Tooltip
                        title={
                            <Typography sx={{ fontSize: 11 }}>
                                {count} of {total} items
                            </Typography>
                        }
                        arrow
                        placement="top"
                    >
                        <Box
                            flex={1}
                            height={16}
                            borderRadius={4}
                            bgcolor="#e0e0e0"
                            position="relative"
                            sx={{ cursor: 'pointer' }}
                        >
                            <Box
                                sx={{
                                    width: `${percent}%`,
                                    height: '100%',
                                    bgcolor: color,
                                    borderRadius: 4,
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontSize: 11,
                                        color: 'white',
                                        lineHeight: '18px',
                                        textAlign: 'center',
                                    }}
                                >
                                    {percent}%
                                </Typography>
                            </Box>
                        </Box>
                    </Tooltip>
                </Stack>
            ))}
        </Box>
    );
};

export default WorkTypeDistribution;
