import classNames from 'classnames/bind';
import styles from './NavItem.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

function NavItem({ children }) {
    return (
        <li>
            <div className={cx('wrapper')}>
                <div className={cx('title')}>{children}</div>
                <FontAwesomeIcon icon={faChevronDown} className="ml-2 text-sm" />
            </div>
        </li>
    );
}

export default NavItem;
