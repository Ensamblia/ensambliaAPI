import api from './axios';

export async function listarMercado(params = {}) {
    const res = await api.get('/anuncios/', { params });
    return res.data;
}

let TIPOS_MERCADO_CACHE = null;
let TIPOS_MERCADO_PROMISE = null;

export function getTiposMercadoIds() {
    if (TIPOS_MERCADO_CACHE) return Promise.resolve(TIPOS_MERCADO_CACHE);
    if (TIPOS_MERCADO_PROMISE) return TIPOS_MERCADO_PROMISE;

    TIPOS_MERCADO_PROMISE = api
        .get('/tipo-anuncios/')
        .then((res) => {
            const lista = res.data?.results ?? res.data ?? [];
            const ids = lista
                .filter((t) => /vend|compr/i.test(t.tipo || ''))
                .map((t) => t.tipo_anuncio_id);
            TIPOS_MERCADO_CACHE = ids;
            return ids;
        })
        .catch(() => {
            TIPOS_MERCADO_CACHE = [];
            return [];
        });

    return TIPOS_MERCADO_PROMISE;
}