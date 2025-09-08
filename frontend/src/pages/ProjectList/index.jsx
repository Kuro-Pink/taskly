import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProjects, deleteProject } from '../../redux/features/projectSlice';
import { useNavigate } from 'react-router-dom';

import {
    Card,
    CardContent,
    Typography,
    Button,
    CircularProgress,
    Grid,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from '@mui/material';

import { useState } from 'react';

const ProjectList = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { projects, loading, error } = useSelector((state) => state.projects);

    const [openDialog, setOpenDialog] = useState(false);
    const [selectedProjectId, setSelectedProjectId] = useState(null);

    useEffect(() => {
        dispatch(fetchProjects());
    }, [dispatch]);

    const handleDeleteClick = (projectId) => {
        setSelectedProjectId(projectId);
        setOpenDialog(true);
    };

    const handleConfirmDelete = () => {
        if (selectedProjectId) {
            dispatch(deleteProject(selectedProjectId));
            setOpenDialog(false);
        }
    };

    return (
        <div className="p-6">
            <Typography variant="h5" className="mb-6 font-bold">
                📋 Danh sách dự án
            </Typography>

            {loading && (
                <div className="flex justify-center">
                    <CircularProgress />
                </div>
            )}

            {error && (
                <Typography color="error" className="mb-4">
                    ❌ {error}
                </Typography>
            )}

            {projects.length === 0 && !loading ? (
                <Typography variant="body1">📌 Hiện không có dự án nào.</Typography>
            ) : (
                <Grid container spacing={3}>
                    {projects.map((project) => (
                        <Grid item xs={12} sm={6} md={4} key={project._id}>
                            <Card className="border border-gray-200 shadow-lg transition duration-200 hover:shadow-2xl">
                                <CardContent sx={{ width: 248, height: 120 }}>
                                    <Typography variant="h6" className="font-semibold text-blue-600">
                                        {project.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ py: 1 }} className="mb-2">
                                        Key: <span className="font-mono">{project.key}</span>
                                    </Typography>

                                    <div className="flex justify-between">
                                        <Button
                                            size="small"
                                            variant="contained"
                                            className="bg-blue-600 hover:bg-blue-700"
                                            onClick={() => navigate(`/projects/${project.key}/boards/${project._id}`)}
                                        >
                                            Xem
                                        </Button>
                                        <Button
                                            size="small"
                                            color="error"
                                            onClick={() => handleDeleteClick(project._id)}
                                        >
                                            Xóa
                                        </Button>
                                    </div>
                                    {project.githubUrl && (
                                        <a
                                            href={project.githubUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mb-3 inline-flex items-center text-sm text-gray-600 hover:text-black hover:underline"
                                        >
                                            <svg className="mr-1 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                                <path
                                                    fillRule="evenodd"
                                                    d="M12 .5C5.648.5.5 5.646.5 12a11.5 11.5 0 008.06 10.953c.59.108.805-.255.805-.567v-2.003c-3.275.712-3.963-1.577-3.963-1.577a3.128 3.128 0 00-1.316-1.73c-1.078-.737.082-.723.082-.723a2.489 2.489 0 011.815 1.223 2.514 2.514 0 003.432.982c.038-.556.29-1.046.624-1.375-2.614-.3-5.364-1.306-5.364-5.812a4.547 4.547 0 011.21-3.151 4.218 4.218 0 01.114-3.111s.984-.314 3.225 1.2a11.177 11.177 0 015.872 0c2.24-1.514 3.223-1.2 3.223-1.2.43.946.478 2.04.114 3.11a4.545 4.545 0 011.208 3.15c0 4.52-2.753 5.51-5.377 5.802.297.26.562.777.562 1.565v2.32c0 .315.213.679.81.564A11.5 11.5 0 0023.5 12C23.5 5.646 18.353.5 12 .5z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            Xem GitHub
                                        </a>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>Xác nhận xóa</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Bạn có chắc chắn muốn xóa dự án này không? Hành động này không thể hoàn tác.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)} color="primary">
                        Hủy
                    </Button>
                    <Button onClick={handleConfirmDelete} color="error">
                        Xóa
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default ProjectList;
