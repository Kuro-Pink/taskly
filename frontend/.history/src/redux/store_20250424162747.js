import { combineReducers, configureStore } from '@reduxjs/toolkit';
import webSocketReducer from './features/webSocketSlice';
import authReducer from './features/authSlice';
import projectReducer from './features/projectSlice';
import statusReducer from './features/statusSlice';
import backlogSlice from './features/backlogSlice';
import epicSlice from './features/epicSlice';
import commentReducer from './features/commentSlice';

import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

const persistConfig = {
    key: 'root',
    version: 1,
    storage,
    whitelist: ['auth'], // Chỉ lưu trữ auth, không lưu task/sprint để tránh lỗi dữ liệu lớn
};

const rootReducer = combineReducers({
    websocket: webSocketReducer,
    auth: authReducer,
    projects: projectReducer,
    statuses: statusReducer,
    backlog: backlogSlice,
    epics: epicSlice,
    comment: commentReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
});

export let persistor = persistStore(store);
