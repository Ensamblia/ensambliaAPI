// src/utils/planes.js
// Planes de suscripción. Solo informativos: todavía no hay pasarela de pago.
// Cuando la haya, `id` es la clave a enviar al backend al contratar.

export const PLANES = [
  {
    id: 'free',
    nombre: 'Free',
    descripcion: 'Para empezar a moverte por la escena.',
    precioMensual: 0,
    precioAnual: 0,
    ventajas: [
      'Perfil público de músico, grupo o local',
      'Ver anuncios y buscar locales',
      'Hasta 2 anuncios activos',
      'Responder a los mensajes que recibes',
      'Biblioteca con 5 archivos',
      'Ver el calendario de eventos',
    ],
  },
  {
    id: 'basic',
    nombre: 'Basic',
    descripcion: 'Para quien busca banda, músicos o sitio donde tocar.',
    precioMensual: 4.99,
    precioAnual: 49.9,
    recomendado: true,
    ventajas: [
      'Enviar mensajes directos a cualquier perfil',
      'Hasta 10 anuncios activos con fotos, audio o vídeo',
      'Ver por qué encajas con cada local o artista',
      'Artistas sugeridos para tu local',
      'Biblioteca con 50 archivos',
      'Publicar hasta 4 eventos al mes',
    ],
  },
  {
    id: 'premium',
    nombre: 'Premium',
    descripcion: 'Para destacar y que te encuentren primero.',
    precioMensual: 9.99,
    precioAnual: 99.9,
    ventajas: [
      'Todo lo de Basic',
      'Anuncios ilimitados y destacados arriba del listado',
      'Tu perfil primero en búsquedas y sugerencias',
      'Biblioteca ilimitada',
      'Eventos ilimitados y destacados en el calendario',
      'Insignia Premium en tu perfil',
    ],
  },
];

const euros = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
});

export function precioPlan(plan, periodo) {
  if (plan.precioMensual === 0) return { importe: '0 €', periodo: 'para siempre' };
  const anual = periodo === 'anual';
  return {
    importe: euros.format(anual ? plan.precioAnual : plan.precioMensual).replace(/ /g, ' '),
    periodo: anual ? '/año' : '/mes',
  };
}
