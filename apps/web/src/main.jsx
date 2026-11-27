import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { StoreProvider } from './hooks/useGlobalReducer';
import { configureTokenStorage } from '@desvan/shared/storage';
import { configureApi } from '@desvan/shared/config';

// En la web el token se guarda en localStorage (en la app, expo-secure-store)
configureTokenStorage(window.localStorage);
// URL del backend: en la web viene de Vite (en la app, de EXPO_PUBLIC_BACKEND_URL)
configureApi({ baseUrl: import.meta.env.VITE_BACKEND_URL });

const Main = () => {

    if (!import.meta.env.VITE_BACKEND_URL) return (
        <div className="container py-5 text-center">
            <h1 className="h4">Falta configurar VITE_BACKEND_URL</h1>
            <p>Añade la URL del backend en el archivo <code>.env</code> (por ejemplo <code>VITE_BACKEND_URL=http://localhost:3001/</code>) y reinicia Vite.</p>
        </div>
    );
    return (
        <React.StrictMode>
            <StoreProvider>
                <RouterProvider router={router}>
                </RouterProvider>
            </StoreProvider>
        </React.StrictMode>
    );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Main />)
