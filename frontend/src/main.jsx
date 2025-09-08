// import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import { persistor, store } from './redux/store';
import GlobalStyles from './components/GlobalStyles';

import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
    // <StrictMode>
    <GlobalStyles>
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <App />
            </PersistGate>
        </Provider>
    </GlobalStyles>,
    // </StrictMode>,
);
