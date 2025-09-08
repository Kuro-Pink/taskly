import classNames from 'classnames/bind';
import styles from './Sitebar.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBarsStaggered, faGlobe, faTable, faTimeline } from '@fortawesome/free-solid-svg-icons';
import { Link, useParams } from 'react-router-dom';
import { fetchProjectById, setSelectedProjectId } from '../../../../redux/features/projectSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';

const cx = classNames.bind(styles);

function Sitebar() {
    const { key, id } = useParams(); // 🟢 Lấy giá trị từ URL
    const dispatch = useDispatch();

    // ✅ Lấy ID từ Redux store
    const selectedProjectId = useSelector((state) => state.projects.selectedProjectId);
    const currentProject = useSelector((state) => state.projects.currentProject);

    useEffect(() => {
        if (id) {
            dispatch(setSelectedProjectId(id)); // ✅ Lưu ID vào Redux
            dispatch(fetchProjectById(id)); // ✅ Lấy thông tin dự án
        }
    }, [id, dispatch]);

    return (
        <aside className={cx('wrapper h-full border-r-4 border-gray-300 px-6')}>
            <div className="py-6 text-3xl">
                <h3 className="py-2">{currentProject?.name}</h3>
                <span className="text-2xl text-gray-400">Type project</span>
            </div>

            <div>
                <h2>LẬP KẾ HOẠCH</h2>
                <ul className={cx('list-item')}>
                    <li className="py-4 pl-4">
                        <Link to={`/projects/${key}/summary/${selectedProjectId}`} className="md:hover:bg-gray-500">
                            <FontAwesomeIcon icon={faGlobe} className="size-10" />
                            <span className={cx('sitebar-item text-2xl')}>Tổng quan</span>
                        </Link>
                    </li>
                    <li className="py-4 pl-4">
                        <Link
                            to={`/projects/${key}/boards/${selectedProjectId}/timeline`}
                            className="md:hover:bg-gray-500"
                        >
                            <FontAwesomeIcon icon={faTimeline} className="size-10" />
                            <span className={cx('sitebar-item text-2xl')}>Dòng thời gian</span>
                        </Link>
                    </li>
                    <li className="py-4 pl-4">
                        <Link
                            to={`/projects/${key}/boards/${selectedProjectId}/backlog`}
                            className="md:hover:bg-gray-500"
                        >
                            <FontAwesomeIcon icon={faBarsStaggered} className="size-10" />
                            <span className={cx('sitebar-item text-2xl')}>Backlog</span>
                        </Link>
                    </li>
                    <li className="py-4 pl-4">
                        <Link to={`/projects/${key}/boards/${selectedProjectId}`} className="md:hover:bg-gray-500">
                            <FontAwesomeIcon icon={faTable} className="size-10" />
                            <span className={cx('sitebar-item text-2xl')}>Bảng</span>
                        </Link>
                    </li>
                </ul>
            </div>
        </aside>
    );
}

export default Sitebar;
