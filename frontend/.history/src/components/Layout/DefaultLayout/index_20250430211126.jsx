import classNames from 'classnames/bind';
import Header from '../components/Header';
import Sitebar from './Sitebar';
import ProjectLayout from '../ProjectLayout';
import styles from './DefaultLayout.module.scss';

const cx = classNames.bind(styles);

function DefaultLayout({ children }) {
    return <div className="projectLayout">{children}</div>;
}

export default DefaultLayout;
