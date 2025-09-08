import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchAllIssue } from '../../redux/features/backlogSlice';
import { fetchStatuses } from '../../redux/features/statusSlice';
import { fetchActivities } from '../../redux/features/notificationSlice';
import { fetchProjectById } from '../../redux/features/projectSlice';
import { fetchAllEpics } from '../../redux/features/epicSlice';

import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import GroupedActivityList from '../../components/Notification/GroupedActivityList';
import WorkStatusChart from '../../components/Chart/WorkStatusChart';
import WorkTypeDistribution from '../../components/Chart/WorkTypeDistribution';
import TeamWorkload from '../../components/Chart/TeamWorkload ';

function HomePage() {
    const dispatch = useDispatch();
    const { id } = useParams();
    const { user } = useSelector((state) => state.auth);
    const { issues, sprints } = useSelector((state) => state.backlog);
    const { statuses } = useSelector((state) => state.statuses);
    const { activities, notifications } = useSelector((state) => state.notification);
    const currentProject = useSelector((state) => state.projects?.currentProject);

    useEffect(() => {
        if (id) {
            dispatch(fetchProjectById(id)); // ✅ Lấy thông tin dự án
        }
    }, [id, dispatch]);

    useEffect(() => {
        dispatch(fetchAllIssue());
        dispatch(fetchStatuses());
        dispatch(fetchActivities());
        dispatch(fetchAllEpics());
    }, [dispatch]);

    const navItems = [
        {
            title: 'đã hoàn thành',
            number: activities.filter((a) => a.action === 'đã hoàn thành').length,
            time: activities.filter((a) => a.action === 'đã hoàn thành').at(0)?.createdAt || 'Chưa có dữ liệu',
            bgColor: 'bg-green-200',
            textColor: 'text-green-700',
            d: 'm4.25 8 2.5 3 5-6M8 .75a7.25 7.25 0 1 0 0 14.5A7.25 7.25 0 0 0 8 .75Z',
        },
        {
            title: 'đã cập nhật',
            number: activities.filter((a) => a.action === 'đã cập nhật').length,
            time: activities.filter((a) => a.action === 'đã cập nhật').at(0)?.createdAt || 'Chưa có dữ liệu',
            bgColor: 'bg-blue-200',
            textColor: 'text-blue-700',
            d: 'm14 6 .866-.866a1.25 1.25 0 0 0 0-1.768l-.232-.232a1.25 1.25 0 0 0-1.768 0L12 4m2 2-3.982 3.982a1.25 1.25 0 0 1-.64.342l-2.128.426.426-2.129a1.25 1.25 0 0 1 .342-.639L12 4m2 2-2-2M1.75 1.75h2.5v2.5h-2.5zm0 5h2.5v2.5h-2.5zm0 5h2.5v2.5h-2.5z',
        },
        {
            title: 'đã tạo mới',
            number: activities.filter((a) => a.action === 'đã tạo').length,
            time: activities.filter((a) => a.action === 'đã tạo').at(0)?.createdAt || 'Chưa có dữ liệu',
            bgColor: 'bg-pink-200',
            textColor: 'text-pink-700',
            d: 'M4 6.875 6 9.25l4-4.75m-7 7.75h8c.69 0 1.25-.56 1.25-1.25V3c0-.69-.56-1.25-1.25-1.25H3c-.69 0-1.25.56-1.25 1.25v8c0 .69.56 1.25 1.25 1.25Z',
        },
        {
            title: 'sắp hết hạn',
            number: notifications.filter((a) => a.action === 'sắp hết hạn').length,
            time: notifications.filter((a) => a.action === 'sắp hết hạn').at(0)?.createdAt || 'Chưa có dữ liệu',
            bgColor: 'bg-red-200',
            textColor: 'text-red-700',
            d: 'M1.75 6.75V13c0 .69.56 1.25 1.25 1.25h10c.69 0 1.25-.56 1.25-1.25V6.75m-12.5 0V3c0-.69.56-1.25 1.25-1.25h2.25m-3.5 5h12.5m0 0V3c0-.69-.56-1.25-1.25-1.25h-2.25m-5.5 0V0m0 1.75V4.5m0-2.75h5.5m0 0V0m0 1.75V4.5',
        },
    ];

    if (!currentProject || !id || !activities) {
        return <p className="text-red-500">❌ Dự án không tồn tại.</p>;
    }

    return (
        <div className="mx-auto w-full max-w-[1200px] px-12">
            {/* Title */}
            <div className="pt-10 pb-4">
                <nav>
                    <ol className="mb-2 flex text-gray-500">
                        <li>Dự ấn</li>
                        <li className="mx-4">/</li>
                        <li>{currentProject.name}</li>
                    </ol>
                    <h2 className="text-4xl font-bold">Tổng quan</h2>
                </nav>
            </div>
            {/* Content overal */}
            <div className="flex grid grid-cols-4 flex-col items-center justify-center gap-8 pt-8">
                {navItems.map((item, index) => (
                    <div key={index} className="rounded-lg border-2 border-gray-200">
                        <a href="#" className="flex items-center p-2">
                            <div className={`mr-4 ml-2 rounded-sm ${item.bgColor} p-4 ${item.textColor}`}>
                                <svg fill="none" viewBox="-4 -4 24 24" className="size-8" role="presentation">
                                    <path stroke="currentcolor" strokeWidth={1.5} strokeLinejoin="round" d={item.d} />
                                    {item.d2 && <path stroke="currentcolor" strokeWidth={1.5} d={item.d2} />}
                                </svg>
                            </div>
                            <div>
                                <div className="font-se flex items-center justify-center text-2xl">
                                    <span>{item.number}</span>
                                    <span className="ml-2">{item.title}</span>
                                </div>
                                <span className="text-xl text-gray-500">
                                    {item.time && item.time !== 'Chưa có dữ liệu'
                                        ? formatDistanceToNow(new Date(item.time), { addSuffix: true, locale: vi })
                                        : 'Chưa có dữ liệu'}
                                </span>
                            </div>
                        </a>
                    </div>
                ))}
            </div>

            <div className="mb-8 flex grid grid-cols-2 flex-col items-center justify-center gap-8 pt-8">
                {/* Chart */}
                <WorkStatusChart />
                {/* Recent activity */}
                <div className="rounded-lg border-2 border-gray-200">
                    <GroupedActivityList />
                </div>
                {/* Nav Item */}
                <WorkTypeDistribution />
                {/* Nav Item */}
                <TeamWorkload />
            </div>
        </div>
    );
}

export default HomePage;
