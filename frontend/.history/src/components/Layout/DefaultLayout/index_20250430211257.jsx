import classNames from 'classnames/bind';
import Header from '../components/Header';
import Sitebar from './Sitebar';
import ProjectLayout from '../ProjectLayout';

function DefaultLayout({ children }) {
    return <ProjectLayout>{children}</ProjectLayout>;
}

export default DefaultLayout;
