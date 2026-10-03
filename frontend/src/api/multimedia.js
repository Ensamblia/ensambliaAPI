import api from './axios';

/**
 * Sube un archivo a MinIO vía URL prefirmada.
 * 1. Pide URL prefirmada al backend.
 * 2. Sube el archivo directamente a MinIO.
 * 3. Registra el multimedia en la BD.
 *
 * @param {File} file - El archivo a subir.
 * @param {Object} options - Opciones: { anuncioId, onProgress }.
 * @returns {Promise<Object>} El objeto Multimedia creado.
 */
export async function uploadFile(file, options = {}) {
    const { anuncioId = null, onProgress } = options;

    // 1. Pedir URL prefirmada
    const presignedRes = await api.post('/multimedias/presigned-url/', {
        nombre: file.name,
        content_type: file.type || 'application/octet-stream',
        tamano_bytes: file.size,
    });

    const { upload_url, object_key, archivo_url } = presignedRes.data;

    // 2. Subir el archivo directamente a MinIO con XMLHttpRequest (para progreso)
    await uploadToMinio(upload_url, file, onProgress);

    // 3. Registrar el multimedia en la BD
    const multimediaRes = await api.post('/multimedias/', {
        nombre: file.name,
        archivo: object_key,
        tamano_bytes: file.size,
        anuncio_id: anuncioId,
    });

    return multimediaRes.data;
}

/**
 * Sube un archivo a MinIO usando XMLHttpRequest (para tener progreso).
 */
function uploadToMinio(uploadUrl, file, onProgress) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', uploadUrl, true);
        xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');

        if (onProgress) {
            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable) {
                    onProgress(Math.round((e.loaded / e.total) * 100));
                }
            };
        }

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve();
            } else {
                reject(new Error(`Error al subir a MinIO: ${xhr.status}`));
            }
        };

        xhr.onerror = () => reject(new Error('Error de red al subir a MinIO'));
        xhr.send(file);
    });
}

/**
 * Elimina un multimedia (y su archivo en MinIO).
 */
export async function deleteMultimedia(multimediaId) {
    const res = await api.delete(`/multimedias/${multimediaId}/`);
    return res.data;
}

/**
 * Lista los multimedia de un perfil.
 */
export async function getMultimediaByPerfil(perfilId) {
    const res = await api.get('/multimedias/perfil/', {
        params: { perfil_id: perfilId },
    });
    return res.data?.results ?? res.data ?? [];
}

/**
 * Lista los multimedia de un anuncio.
 */
export async function getMultimediaByAnuncio(anuncioId) {
    const res = await api.get('/multimedias/anuncio/', {
        params: { anuncio_id: anuncioId },
    });
    return res.data?.results ?? res.data ?? [];
}


/**
 * Sube un adjunto de chat a MinIO vía URL prefirmada.
 * 1. Pide URL prefirmada al backend (endpoint de chat).
 * 2. Sube el archivo directamente a MinIO.
 * 3. Registra el MensajeAdjunto (sin mensaje asociado todavía).
 *
 * @param {File} file - El archivo a subir.
 * @returns {Promise<Object>} El MensajeAdjunto creado.
 */
export async function uploadChatAttachment(file) {
    // 1. Pedir URL prefirmada al endpoint del chat
    const presignedRes = await api.post('/mensajes/presigned-adjunto/', {
        nombre: file.name,
        content_type: file.type || 'application/octet-stream',
        tamano_bytes: file.size,
    });

    const { upload_url, object_key } = presignedRes.data;

    // 2. Subir el archivo directamente a MinIO
    await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', upload_url, true);
        xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) resolve();
            else reject(new Error(`Error al subir: ${xhr.status}`));
        };
        xhr.onerror = () => reject(new Error('Error de red al subir'));
        xhr.send(file);
    });

    // 3. Registrar el adjunto en la BD
    const adjuntoRes = await api.post('/mensajes/crear-adjunto/', {
        nombre: file.name,
        archivo: object_key,
        tamano_bytes: file.size,
        content_type: file.type || 'application/octet-stream',
    });

    return adjuntoRes.data;
}