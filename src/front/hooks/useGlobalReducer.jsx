import { useContext, useReducer, createContext, useEffect } from "react";
import storeReducer, { initialStore } from "../store"
import authService from "../services/auth.service";

const StoreContext = createContext()

export function StoreProvider({ children }) {
    const [store, dispatch] = useReducer(storeReducer, initialStore())

    useEffect(() => {
        if (localStorage.getItem('token') && !store.user) {
            authService.getMe()
                .then(data => {
                    const currentUser = data?.data ?? data;
                    if (currentUser) {
                        dispatch({ type: 'auth', payload: { user: currentUser } });
                    } else {
                        dispatch({ type: 'setUserLoading', payload: false });
                    }
                })
                .catch(() => {
                    localStorage.removeItem('token');
                    dispatch({ type: 'logout' });
                });
        } else if (!localStorage.getItem('token')) {
            dispatch({ type: 'setUserLoading', payload: false });
        }
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