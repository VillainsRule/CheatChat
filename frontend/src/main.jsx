import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Main from '@components/Main';
import Error from '@components/Error';
import { ErrorBoundary } from './errorBoundary';

let root = createRoot(document.querySelector('#root'));

root.render(
    <ErrorBoundary>
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<Main />} />
                <Route path='*' element={<Error header='404' message={`there's one page on this website. how do you get lost??`} />} />
            </Routes>
        </BrowserRouter>
    </ErrorBoundary>
);

document.oncontextmenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
};