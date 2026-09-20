import { useReducer, useCallback } from 'react';

// 1. Definición de los estados universales
export const ASYNC_STATUS = {
    IDLE: 'IDLE',       // Estado inicial (sin petición en curso)
    LOADING: 'LOADING', // Petición iniciada / Cargando datos
    SUCCESS: 'SUCCESS', // Petición completada con éxito
    ERROR: 'ERROR',     // Petición fallida
};

// 2. Reducer para controlar el cambio de estado atómico
const asyncReducer = (state, action) => {
    switch (action.type) {
        case ASYNC_STATUS.LOADING:
            return {
                status: ASYNC_STATUS.LOADING,
                data: null,
                error: null,
            };
        case ASYNC_STATUS.SUCCESS:
            return {
                status: ASYNC_STATUS.SUCCESS,
                data: action.payload,
                error: null,
            };
        case ASYNC_STATUS.ERROR:
            return {
                status: ASYNC_STATUS.ERROR,
                data: null,
                error: action.payload,
            };
        case ASYNC_STATUS.IDLE:
            return {
                status: ASYNC_STATUS.IDLE,
                data: null,
                error: null,
            };
        default:
            return state;
    }
};

// 3. Custom Hook Reutilizable
export const useAsync = (asyncFunction, immediate = true) => {
    const [state, dispatch] = useReducer(asyncReducer, {
        status: ASYNC_STATUS.IDLE,
        data: null,
        error: null,
    });

    // Función ejecutora que envuelve la llamada a la API
    const execute = useCallback(
        async (...args) => {
            dispatch({ type: ASYNC_STATUS.LOADING });
            try {
                const response = await asyncFunction(...args);
                dispatch({ type: ASYNC_STATUS.SUCCESS, payload: response });
                return response;
            } catch (err) {
                const errorMessage = err.response?.data?.message || err.message || 'Error inesperado';
                dispatch({ type: ASYNC_STATUS.ERROR, payload: errorMessage });
                throw err;
            }
        },
        [asyncFunction]
    );

    return {
        execute,
        status: state.status,
        data: state.data,
        error: state.error,
        isIdle: state.status === ASYNC_STATUS.IDLE,
        isLoading: state.status === ASYNC_STATUS.LOADING,
        isSuccess: state.status === ASYNC_STATUS.SUCCESS,
        isError: state.status === ASYNC_STATUS.ERROR,
    };
};