// Layout
import { HeaderOnly } from '../components/Layout';
import Home from '../pages/Home';
import Task from '../pages/Task';
import BacklogBoard from '../pages/BacklogBoard';
import Search from '../pages/Search';
import LoginForm from '../pages/Login';
import RegisterForm from '../pages/Register';
import ProjectList from '../pages/ProjectList';
import CreateProject from '../pages/CreateProject';
import Dashboard from '../pages/Dashboard';
import Timeline from '../pages/Timeline';
export const publicRoutes = [
    { path: '/dashboard', component: Dashboard, layout: HeaderOnly },
    { path: '/projects/:key/summary/:id', component: Home },
    { path: '/projects/:key/boards/:id', component: Task },
    { path: '/projects/:key/boards/:id/invite', component: Task },
    { path: '/projects/:key/boards/:id/backlog', component: BacklogBoard },
    { path: '/projects/:key/boards/:id/timeline', component: Timeline },
    { path: '/search', component: Search },

    { path: '/projects', component: ProjectList, layout: HeaderOnly },
    { path: '/projects/create', component: CreateProject, layout: HeaderOnly },

    { path: '/auth/login', component: LoginForm, layout: null },
    { path: '/auth/register', component: RegisterForm, layout: null },
];

export const privateRoutes = [];
