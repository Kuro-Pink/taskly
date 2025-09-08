import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { Plus, ChevronDown, ChevronRight } from 'lucide-react';

const DAY_WIDTH = 40;
const DATE_FORMAT = 'YYYY-MM-DD';

const Timeline = () => {
    const { issues, sprints } = useSelector((state) => state.backlog);
    const { epics } = useSelector((state) => state.epics);

    const [expandedEpicIds, setExpandedEpicIds] = useState([]);
    const [dateRange, setDateRange] = useState([]);

    useEffect(() => {
        if (epics.length > 0) {
            const startDates = epics.map((e) => moment(e.startDate));
            const endDates = epics.map((e) => moment(e.endDate));
            const minDate = moment.min(startDates);
            const maxDate = moment.max(endDates);
            const range = [];
            let current = moment(minDate);
            while (current <= maxDate) {
                range.push(current.clone());
                current.add(1, 'days');
            }
            setDateRange(range);
        }
    }, [epics]);

    const toggleEpic = (epicId) => {
        setExpandedEpicIds((prev) => (prev.includes(epicId) ? prev.filter((id) => id !== epicId) : [...prev, epicId]));
    };

    const getEpicBarStyle = (start, end) => {
        const startIndex = dateRange.findIndex((d) => d.format(DATE_FORMAT) === moment(start).format(DATE_FORMAT));
        const duration = moment(end).diff(moment(start), 'days') + 1;
        return {
            left: `${startIndex * DAY_WIDTH}px`,
            width: `${duration * DAY_WIDTH}px`,
            backgroundColor: '#d1a8f5',
            height: '20px',
            borderRadius: '4px',
            position: 'absolute',
        };
    };

    return (
        <div className="h-full w-full overflow-x-auto">
            <div className="grid grid-cols-[300px_1fr]">
                {/* Left: Epic & Issue List */}
                <div className="border-r bg-white">
                    <div className="border-b p-2 font-semibold">Sprints</div>
                    {epics.map((epic) => (
                        <div key={epic._id} className="border-b">
                            <div
                                className="flex cursor-pointer items-center justify-between px-2 py-1 hover:bg-gray-100"
                                onClick={() => toggleEpic(epic._id)}
                            >
                                <div className="flex items-center gap-2">
                                    {expandedEpicIds.includes(epic._id) ? (
                                        <ChevronDown size={16} />
                                    ) : (
                                        <ChevronRight size={16} />
                                    )}
                                    <span className="text-sm font-medium text-purple-700">
                                        {epic.key} {epic.name}
                                    </span>
                                </div>
                                <Plus size={14} className="text-gray-400 hover:text-black" />
                            </div>
                            {expandedEpicIds.includes(epic._id) && (
                                <div className="pl-6">
                                    {issues
                                        .filter((issue) => issue.epicId === epic._id)
                                        .map((issue) => (
                                            <div key={issue._id} className="flex justify-between px-1 py-1 text-sm">
                                                <div className="text-green-700">
                                                    {issue.key} {issue.title}
                                                </div>
                                                <div className="rounded bg-gray-200 px-2 py-0.5 text-xs">
                                                    {issue.status}
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>
                    ))}
                    <div className="cursor-pointer p-2 text-sm text-blue-600 hover:underline">+ Create Epic</div>
                </div>

                {/* Right: Gantt Chart */}
                <div className="relative">
                    {/* Date Header */}
                    <div className="sticky top-0 z-10 flex border-b bg-white">
                        {dateRange.map((date) => (
                            <div
                                key={date.format(DATE_FORMAT)}
                                className={`border-r px-2 py-1 text-center text-xs w-[${DAY_WIDTH}px] ${
                                    date.isSame(moment(), 'day') ? 'font-semibold text-blue-500' : 'text-gray-500'
                                }`}
                            >
                                {date.date()}
                            </div>
                        ))}
                    </div>

                    {/* Gantt Bars */}
                    <div className="relative" style={{ height: epics.length * 40 }}>
                        {epics.map((epic, index) => (
                            <div
                                key={epic._id}
                                className="absolute"
                                style={{
                                    top: `${index * 40 + 10}px`,
                                    ...getEpicBarStyle(epic.startDate, epic.endDate),
                                }}
                            >
                                <span className="ml-1 text-xs text-white">{epic.key}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Timeline;
