import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createProject } from '../../redux/features/projectSlice';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Typography, Card, CardContent } from '@mui/material';

const CreateProjectForm = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [githubLink, setGithubLink] = useState('');
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            alert('Tên dự án không được để trống');
            return;
        }

        const projectKey = name.substring(0, 3).toUpperCase();
        const projectData = { name, description, projectKey };

        try {
            const response = await dispatch(createProject(projectData)).unwrap();
            const project = response.project;
            setGithubLink(project.githubUrl); // Lấy link GitHub

            alert('Dự án đã tạo thành công!');
            navigate(`/projects/${project.key}/boards/${project._id}`);
        } catch (error) {
            alert('Lỗi khi tạo dự án: ' + error.message);
        }
    };

    return (
        <div className="mt-10 flex justify-center">
            <Card className="w-full max-w-xl shadow-md">
                <CardContent>
                    <Typography variant="h5" className="mb-4 text-center font-bold text-blue-600">
                        Tạo Dự Án Mới
                    </Typography>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <TextField
                            label="Tên Dự Án"
                            variant="outlined"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            fullWidth
                        />
                        <TextField
                            label="Mô Tả"
                            variant="outlined"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            multiline
                            rows={4}
                            fullWidth
                        />
                        <Button type="submit" variant="contained" className="bg-blue-500 text-white hover:bg-blue-600">
                            Tạo Dự Án
                        </Button>
                    </form>

                    {githubLink && (
                        <Typography className="mt-6 text-green-600">
                            Repo GitHub:{' '}
                            <a
                                href={githubLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 underline"
                            >
                                {githubLink}
                            </a>
                        </Typography>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default CreateProjectForm;
