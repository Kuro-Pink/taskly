import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchSprints } from '../../redux/features/sprintSlice';
import Gantt from 'frappe-gantt';
import { format, addDays } from 'date-fns';
import './Timeline.css';

const Timeline = () => {
    const dispatch = useDispatch();
    const { sprints, status } = useSelector((state) => state.sprints);
    const [viewMode, setViewMode] = useState('Week');
    const [gantt, setGantt] = useState(null);
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        dispatch(fetchSprints());
    }, [dispatch]);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentDate(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const tasks = sprints.map((sprint) => ({
        id: sprint.id,
        name: `${sprint.code} - ${sprint.name}`,
        start: sprint.startDate,
        end: sprint.endDate,
        progress: sprint.progress,
        custom_class: sprint.progress > 50 ? 'high-progress' : 'low-progress',
    }));

    useEffect(() => {
        if (tasks.length > 0) {
            const ganttChart = new Gantt('#gantt', tasks, {
                header_height: 50,
                column_width: 30,
                step: 24,
                view_modes: ['Day', 'Week', 'Month'],
                bar_height: 20,
                bar_corner_radius: 3,
                padding: 18,
                view_mode: viewMode,
                custom_popup_html: (task) => `
                    <div class='popup'>
                        <strong>${task.name}</strong><br>
                        Progress: ${task.progress}%
                    </div>`,
            });
            setGantt(ganttChart);
        }
    }, [tasks, viewMode]);

    const renderTimeHeader = () => {
        const days = [];
        for (let i = -3; i <= 10; i++) {
            const date = addDays(currentDate, i);
            days.push(
                <div key={i} className={`date-box ${i === 0 ? 'today' : ''}`}>
                    {format(date, 'MMM d')}
                </div>,
            );
        }
        return days;
    };

    return (
        <div className="timeline-container">
            <div className="timeline-header">
                <h2>Timeline</h2>
            </div>

            {/* Thanh ngày tháng */}
            <div className="time-header">{renderTimeHeader()}</div>

            <div className="timeline-content">{status === 'loading' ? <p>Loading...</p> : <div id="gantt"></div>}</div>

            {/* Nút chọn chế độ xem */}
            <div className="view-mode-buttons">
                {['Today', 'Week', 'Month', 'Quarters'].map((mode) => (
                    <button key={mode} onClick={() => setViewMode(mode)} className={viewMode === mode ? 'active' : ''}>
                        {mode}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Timeline;
