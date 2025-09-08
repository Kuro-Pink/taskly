import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeModal } from '../../redux/features/modalSlice';
import { createIssue, updateIssue, fetchAllIssue } from '../../redux/features/backlogSlice';
import { fetchAllEpics, createEpic, updateEpic } from '../../redux/features/epicSlice';

const TaskModal = () => {
    const dispatch = useDispatch();
    const currentProject = useSelector((state) => state.projects.currentProject);
    const { open, mode, type, data } = useSelector((state) => state.modal);

    // Hàm format date về yyyy-mm-dd để input date nhận đúng
    const formatDateInput = (date) => {
        if (!date) return '';
        const d = new Date(date);
        return d.toISOString().slice(0, 10);
    };

    // Ngày hiện tại và ngày hiện tại +14 ngày
    const now = new Date();
    const plus14 = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    const [title, setTitle] = useState('');
    const [startDate, setStartDate] = useState(formatDateInput(now));
    const [endDate, setEndDate] = useState(formatDateInput(plus14));

    useEffect(() => {
        if (mode === 'edit' && data) {
            setTitle(data.title || '');
            setStartDate(formatDateInput(data.start_date || data.startDate) || formatDateInput(now));
            setEndDate(formatDateInput(data.end_date || data.endDate) || formatDateInput(plus14));
        } else if (mode === 'create') {
            setTitle('');
            setStartDate(formatDateInput(now));
            setEndDate(formatDateInput(plus14));
        }
    }, [mode, data]);

    const handleSubmit = () => {
        if (!title.trim()) {
            alert('Tiêu đề không được để trống');
            return;
        }

        if (mode === 'create') {
            if (type === 'epic') {
                dispatch(createEpic({ name: title, projectId: currentProject._id })).then(() =>
                    dispatch(fetchAllEpics()),
                );
            } else {
                dispatch(
                    createIssue({
                        title,
                        startDate: new Date(startDate),
                        endDate: new Date(endDate),
                        epic: data.epicId || '',
                        type: 'Task',
                        project: currentProject._id,
                        parent: type === 'subIssue' ? data.parentId : null,
                    }),
                ).then(() => dispatch(fetchAllIssue()));
            }
        } else if (mode === 'edit') {
            if (type === 'epic') {
                dispatch(updateEpic({ epicId: data.id, updates: { name: title } })).then(() =>
                    dispatch(fetchAllEpics()),
                );
            } else {
                dispatch(
                    updateIssue({
                        issueId: data.id,
                        updates: {
                            title,
                            startDate: new Date(startDate),
                            endDate: new Date(endDate),
                        },
                    }),
                );
            }
        }

        dispatch(closeModal());
    };

    if (!open) return null;

    return (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="w-[400px] rounded-lg bg-white p-6 shadow-lg">
                <h2 className="mb-4 text-xl font-semibold">
                    {mode === 'create' ? 'Tạo mới' : 'Chỉnh sửa'} {type}
                </h2>

                <label className="mb-2 block font-medium text-gray-700">Tiêu đề</label>
                <input
                    type="text"
                    className="mb-4 w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Nhập tiêu đề"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />

                <div className="mb-6 flex space-x-4">
                    <div className="flex w-1/2 flex-col">
                        <label className="mb-2 font-medium text-gray-700">Ngày bắt đầu</label>
                        <input
                            type="date"
                            className="rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div className="flex w-1/2 flex-col">
                        <label className="mb-2 font-medium text-gray-700">Ngày kết thúc</label>
                        <input
                            type="date"
                            className="rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex justify-end space-x-3">
                    <button
                        onClick={() => dispatch(closeModal())}
                        className="rounded bg-gray-300 px-4 py-2 hover:bg-gray-400"
                    >
                        Huỷ
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                    >
                        Lưu
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TaskModal;
