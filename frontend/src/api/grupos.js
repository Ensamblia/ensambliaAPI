import api from './axios';

export async function getMiembrosGrupo(perfilGrupoId) {
    const res = await api.get('/perfil-grupos/grupo/', { params: { perfil_id: perfilGrupoId } });
    return res.data ?? [];
}
export async function getSolicitudesDeGrupo(perfilGrupoId) {
    const res = await api.get('/solicitudes-grupo/', { params: { perfil_id: perfilGrupoId } });
    return res.data ?? [];
}
export async function solicitarUnirse(perfilGrupoId) {
    const res = await api.post('/solicitudes-grupo/', { perfil_id: perfilGrupoId });
    return res.data;
}
export async function cancelarSolicitud(solicitudId) {
    await api.delete(`/solicitudes-grupo/${solicitudId}/`);
}
export async function aprobarSolicitud(id) {
    const res = await api.post(`/solicitudes-grupo/${id}/aprobar/`);
    return res.data;
}
export async function rechazarSolicitud(id) {
    const res = await api.post(`/solicitudes-grupo/${id}/rechazar/`);
    return res.data;
}