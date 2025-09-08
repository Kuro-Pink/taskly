import { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import Tippy from '@tippyjs/react/headless';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleXmark, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import SearchMenu from './SearchMenu';
import classNames from 'classnames/bind';
import styles from './search.module.scss';

const cx = classNames.bind(styles);

export default function SearchBox({ onSelectItem }) {
    const [searchText, setSearchText] = useState('');

    const { issues } = useSelector((state) => state.backlog);
    const { epics } = useSelector((state) => state.epics);
    const currentProject = useSelector((state) => state.projects.currentProject);

    const members = currentProject?.members || [];

    const filteredResults = useMemo(() => {
        const lower = searchText.toLowerCase();

        const matchedIssues = issues
            .filter((issue) => issue.title.toLowerCase().includes(lower))
            .map((issue) => ({
                type: 'Issue',
                label: issue.title,
                id: issue._id,
                data: issue,
            }));

        const matchedEpics = epics
            .filter((epic) => epic.name.toLowerCase().includes(lower))
            .map((epic) => ({
                type: 'Epic',
                label: epic.name,
                id: epic._id,
                data: epic,
            }));

        const matchedMembers = members
            .filter((m) => m.name.toLowerCase().includes(lower))
            .map((m) => ({
                type: 'Member',
                label: m.name,
                id: m.user._id,
                data: m,
            }));

        return [...matchedIssues, ...matchedEpics, ...matchedMembers];
    }, [searchText, issues, epics, members]);

    return (
        <Tippy
            interactive
            visible={searchText.length > 0 && filteredResults.length > 0}
            render={(attrs) => (
                <div className={cx('search-result')} tabIndex="-1" {...attrs}>
                    <SearchMenu
                        results={filteredResults}
                        onClose={() => setSearchText('')}
                        onSelect={(item) => {
                            if (item.type === 'Issue') {
                                onSelectItem(item.data); // 👈 gọi callback truyền data
                            }
                        }}
                    />
                </div>
            )}
        >
            <div className={cx('search')}>
                <input
                    placeholder="Tìm kiếm trong dự án..."
                    spellCheck={false}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                />
                {searchText && (
                    <button className={cx('clear')} onClick={() => setSearchText('')}>
                        <FontAwesomeIcon icon={faCircleXmark} />
                    </button>
                )}
                <button className={cx('search-btn')}>
                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                </button>
            </div>
        </Tippy>
    );
}
