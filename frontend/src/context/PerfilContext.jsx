import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '@/api/axios';
import { AuthContext } from './AuthContext';

export const PerfilContext = createContext({
    me: null,
    loading: true,
    refresh: () => {},
});

export function PerfilProvider({ children }) {
    const { user } = useContext(AuthContext);
    const [me, setMe] = useState(null);
    const [loading, setLoading] = useState(true);

    const cargar = () => {
        if (!user) {
        setMe(null);
        setLoading(false);
        return;
        }
        setLoading(true);
        api.get('/perfiles/me')
        .then((res) => setMe(res.data))
        .catch(() => setMe(null))
        .finally(() => setLoading(false));
    };

    useEffect(() => {
        cargar();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    return (
        <PerfilContext.Provider value={{ me, loading, refresh: cargar }}>
        {children}
        </PerfilContext.Provider>
    );
}