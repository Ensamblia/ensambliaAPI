import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Users } from 'lucide-react';
import api from '@/api/axios';
import { getSolicitudesDeGrupo, aprobarSolicitud, rechazarSolicitud } from '@/api/grupos';
import { Button, Card, EmptyState, PageHeader, Spinner, Tag } from '@/components/ui';

export function SolicitudesGrupoPage() {
  const { id } = useParams();
  const [grupo, setGrupo] = useState(null);
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accion, setAccion] = useState('');

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const [g, sols] = await Promise.all([
        api.get(`/perfiles/${id}/`).then((r) => r.data).catch(() => null),
        getSolicitudesDeGrupo(id),
      ]);
      setGrupo(g);
      setSolicitudes(sols);
    } finally { setLoading(false); }
  }, [id]);

  useEffect(() => { cargar(); }, [cargar]);

  const resolver = async (solicitudId, aprobar) => {
    setAccion('');
    try {
      await (aprobar ? aprobarSolicitud(solicitudId) : rechazarSolicitud(solicitudId));
      await cargar();
    } catch (err) {
      setAccion(err.response?.data?.error || 'No se pudo resolver la solicitud.');
    }
  };

  if (loading) return <main style={{ padding: 40 }}><Spinner size="lg" /></main>;

  return (
    <main style={{ width: 'min(820px, calc(100% - 64px))', margin: '0 auto', padding: '32px 0 64px' }}>
      <PageHeader
        title={grupo ? `Solicitudes · ${grupo.nombre}` : 'Solicitudes'}
        icon={<Users size={22} />}
        tone="coral"
        backTo={`/perfiles/${id}`}
        backLabel="Banda"
      />
      {accion && <p style={{ color: 'var(--danger)' }}>{accion}</p>}
      {solicitudes.length === 0 && (
        <EmptyState
          icon="📨"
          title="No hay solicitudes"
          description="Solo el dueño del grupo puede ver y gestionar las solicitudes."
        />
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {solicitudes.map((s) => (
          <Card key={s.solicitud_id} padding="md">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <div>
                <strong>{s.perfil_nombre || `Perfil #${s.perfil_id}`}</strong>
                <p style={{ fontSize: 13, opacity: .7, margin: 0 }}>
                  {new Date(s.fecha_solicitud).toLocaleDateString('es-ES')} · <Tag size="sm">{s.estado}</Tag>
                </p>
              </div>
              {s.estado === 'pendiente' && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button variant="primary" size="sm" onClick={() => resolver(s.solicitud_id, true)}>Aprobar</Button>
                  <Button variant="secondary" size="sm" onClick={() => resolver(s.solicitud_id, false)}>Rechazar</Button>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </main>
  );
}