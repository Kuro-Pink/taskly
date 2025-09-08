import React, { useState } from 'react';
import { Button, Modal, Box, FormControl, InputLabel, Select, MenuItem, Typography, Stack } from '@mui/material';

const BoardFilter = ({ tasks, epics, sprints, filters, handleSetFilters }) => {
    const [open, setOpen] = useState(false);

    const handleChange = (field) => (e) => {
        handleSetFilters({ [field]: e.target.value });
    };

    const handleClear = () => {
        handleSetFilters({ epic: '', type: '', sprint: '' });
        setOpen(false);
    };

    const handleApply = () => {
        setOpen(false);
    };

    const filteredTasks = tasks.filter((task) => {
        const matchEpic = !filters.epic || task.epic === filters.epic || task.epic?._id === filters.epic;
        const matchType = !filters.type || task.type === filters.type;
        return matchEpic && matchType;
    });

    return (
        <>
            {/* Header + nút mở modal */}
            <div className="mb-2 ml-4 flex items-center">
                {/* <Typography variant="body2" color="text.secondary">
                    Hiển thị <strong>{filteredTasks.length}</strong> / {tasks.length} công việc trong backlog
                </Typography> */}

                <Button variant="outlined" onClick={() => setOpen(true)}>
                    Bộ lọc công việc
                </Button>
            </div>

            {/* Modal */}
            <Modal open={open} onClose={() => setOpen(false)}>
                <Box
                    sx={{
                        width: 400,
                        bgcolor: 'background.paper',
                        boxShadow: 24,
                        p: 4,
                        borderRadius: 2,
                        mx: 'auto',
                        mt: '10%',
                    }}
                >
                    <Typography variant="h6" mb={2}>
                        Bộ lọc công việc
                    </Typography>

                    <Stack spacing={2}>
                        {/* Epic Filter */}
                        <FormControl fullWidth size="small">
                            <InputLabel>Epic</InputLabel>
                            <Select value={filters.epic || ''} onChange={handleChange('epic')} label="Epic">
                                <MenuItem value="">Tất cả</MenuItem>
                                {epics.map((epic) => (
                                    <MenuItem key={epic._id} value={epic._id}>
                                        {epic.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {/* Type Filter */}
                        <FormControl fullWidth size="small">
                            <InputLabel>Trạng thái</InputLabel>
                            <Select value={filters.type || ''} onChange={handleChange('type')} label="Trạng thái">
                                <MenuItem value="">Tất cả</MenuItem>
                                <MenuItem value="Task">Task</MenuItem>
                                <MenuItem value="Bug">Bug</MenuItem>
                                <MenuItem value="Story">Story</MenuItem>
                            </Select>
                        </FormControl>

                        {/* Sprint Filter */}
                        <FormControl fullWidth size="small">
                            <InputLabel>Sprint</InputLabel>
                            <Select value={filters.sprint || ''} onChange={handleChange('sprint')} label="Sprint">
                                <MenuItem value="">Tất cả</MenuItem>
                                {sprints.map((sprint) => (
                                    <MenuItem key={sprint._id} value={sprint._id}>
                                        {sprint.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {/* Actions */}
                        <Stack direction="row" spacing={2} justifyContent="flex-end">
                            <Button onClick={handleClear} variant="outlined" color="secondary">
                                Xoá lọc
                            </Button>
                            <Button onClick={handleApply} variant="contained">
                                Áp dụng
                            </Button>
                        </Stack>
                    </Stack>
                </Box>
            </Modal>
        </>
    );
};

export default BoardFilter;
