import classNames from 'classnames/bind';
import Header from '../components/Header';
import Sitebar from './Sitebar';
import ProjectLayout from '../ProjectLayout';
import styles from './DefaultLayout.module.scss';

const cx = classNames.bind(styles);

function DefaultLayout({ children }) {
    return <ProjectLayout>{children}</ProjectLayout>;
}

export default DefaultLayout;
