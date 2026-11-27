import { useContext, useReducer, createContext, useEffect } from "react";
import { storeReducer, initialStore, restoreSession } from "@desvan/shared/store";

const StoreContext = createContext()

export function StoreProvider({ children }) {
    const [store, dispatch] = useReducer(storeReducer, initialStore())

    // Lee el token guardado y carga el usuario (asíncrono).
    // Mientras tanto store.userLoading es true.
    useEffect(() => {
        restoreSession(dispatch);
    }, [])

    return <StoreContext.Provider value={{ store, dispatch }}>
        {children}
    </StoreContext.Provider>
}

let alertTimeout = null;

// Hook para acceder al estado global y a dispatch
export default function useGlobalReducer() {
    const { dispatch, store } = useContext(StoreContext)
    
    const showErrorAlert = (msg) => {
        dispatch({ type: 'setError', payload: msg });
        if (alertTimeout) {
            clearTimeout(alertTimeout);
        }
        if (msg) {
            alertTimeout = setTimeout(() => {
                dispatch({ type: 'setError', payload: null });
            }, 8000);
        }
    };

    return { store, dispatch, showErrorAlert }
}