import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createProject } from '../../redux/features/projectSlice';
import { useNavigate } from 'react-router-dom';

const CreateProjectForm = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            alert('Tên dự án không được để trống');
            return;
        }

        const projectKey = name.substring(0, 3).toUpperCase(); // Lấy 3 chữ cái đầu
        const projectData = { name, description, projectKey };

        try {
            const response = await dispatch(createProject(projectData)).unwrap();
            alert('Dự án đã tạo thành công!');
            navigate(`/projects/${response.project.key}/boards/${response.project._id}`);
        } catch (error) {
            alert('Lỗi khi tạo dự án: ' + error.message);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="rounded-lg bg-white p-4 shadow-md">
            <label className="mb-2 block text-sm font-bold">Tên Dự Án:</label>
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded border p-2"
                required
            />

            <label className="mt-4 mb-2 block text-sm font-bold">Mô Tả:</label>
            <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded border p-2"
            />

            <button type="submit" className="mt-4 rounded bg-blue-500 px-4 py-2 text-white">
                Tạo Dự Án
            </button>
        </form>
    );
};

export default CreateProjectForm;
