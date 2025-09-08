import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Sector } from 'recharts';
import { Box, Typography, Stack } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState, useMemo } from 'react';

import { fetchAllIssue } from '../../redux/features/backlogSlice';
import { fetchStatuses } from '../../redux/features/statusSlice';
import { fetchProjectById } from '../../redux/features/projectSlice';

const colorPalette = [
    '#FF6B6B',
    '#6BCB77',
    '#4D96FF',
    '#FFD93D',
    '#A66DD4',
    '#FF9671',
    '#00C9A7',
    '#F67280',
    '#C06C84',
    '#355C7D',
];

// Custom active shape with animation
const renderActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value } = props;

    return (
        <g>
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadius + 10}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
            />
        </g>
    );
};

const WorkStatusChart = () => {
    const dispatch = useDispatch();
    const { id } = useParams();

    const { issues } = useSelector((state) => state.backlog);
    const { statuses } = useSelector((state) => state.statuses);
    const currentProject = useSelector((state) => state.projects?.currentProject);

    const [activeIndex, setActiveIndex] = useState(null);

    useEffect(() => {
        if (id) {
            dispatch(fetchProjectById(id));
            dispatch(fetchAllIssue());
            dispatch(fetchStatuses());
        }
    }, [id, dispatch]);

    if (!currentProject || !id) {
        return <p className="text-red-500">❌ Dự án không tồn tại.</p>;
    }

    const filteredStatuses = statuses.filter((s) => s.project === currentProject._id);
    const data = filteredStatuses
        .map((status, index) => {
            const count = issues.filter((issue) => issue.status === status._id).length;
            return {
                name: status.name,
                value: count,
                color: status.color || colorPalette[index % colorPalette.length],
            };
        })
        .filter((item) => item.value > 0);

    const total = useMemo(() => data.reduce((sum, item) => sum + item.value, 0), [data]);

    const activeData = activeIndex !== null ? data[activeIndex] : null;

    return (
        <Box p={2} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <Typography variant="h5" fontWeight="bold">
                Tổng quan về trạng thái
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '1.2rem' }}>
                Nắm bắt nhanh về trạng thái của các mục công việc
            </Typography>

            <Stack direction="row" spacing={4} alignItems="center">
                <Box sx={{ width: 210, height: 210, position: 'relative' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                dataKey="value"
                                innerRadius={60}
                                outerRadius={80}
                                activeIndex={activeIndex}
                                activeShape={renderActiveShape}
                                onMouseEnter={(_, index) => setActiveIndex(index)}
                                onMouseLeave={() => setActiveIndex(null)}
                                paddingAngle={2}
                                startAngle={90}
                                endAngle={-270}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>

                    {/* Center Total/Percent */}
                    <Box
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            textAlign: 'center',
                            transition: 'all 0.3s ease',
                        }}
                    >
                        {activeData ? (
                            <>
                                <Typography variant="h5" fontWeight="bold">
                                    {((activeData.value / total) * 100).toFixed(1)}%
                                </Typography>
                                <Typography sx={{ fontSize: 12 }} variant="caption">
                                    {activeData.name}
                                </Typography>
                            </>
                        ) : (
                            <>
                                <Typography variant="h4" fontWeight={700}>
                                    {total}
                                </Typography>
                                <Typography sx={{ fontSize: 12 }} variant="body1" fontWeight={500}>
                                    Tổng công việc
                                </Typography>
                            </>
                        )}
                    </Box>
                </Box>

                {/* Legend */}
                <Box>
                    {data.map((item, index) => (
                        <Stack
                            key={item.name}
                            direction="row"
                            alignItems="center"
                            spacing={1}
                            mb={1}
                            onMouseEnter={() => setActiveIndex(index)}
                            onMouseLeave={() => setActiveIndex(null)}
                            sx={{ cursor: 'pointer' }}
                        >
                            <Box
                                sx={{
                                    width: 12,
                                    height: 12,
                                    backgroundColor: item.color,
                                    borderRadius: '2px',
                                }}
                            />
                            <Typography variant="body2" fontSize={13}>
                                {item.name}: {item.value}
                            </Typography>
                        </Stack>
                    ))}
                </Box>
            </Stack>
        </Box>
    );
};

export default WorkStatusChart;
