// src/utils/eventos.js
// Fechas del calendario de eventos (siempre en la hora local del navegador).

const pad = (n) => String(n).padStart(2, '0');

export function claveDia(fecha) {
  return `${fecha.getFullYear()}-${pad(fecha.getMonth() + 1)}-${pad(fecha.getDate())}`;
}

// Valores para los inputs date y time a partir de la fecha ISO del evento
export function fechaYHoraInputs(iso) {
  const d = new Date(iso);
  return { fecha: claveDia(d), hora: `${pad(d.getHours())}:${pad(d.getMinutes())}` };
}

// Semanas del mes (lunes a domingo) con el número de día o null en los huecos
export function semanasDelMes(anio, mes) {
  const diasEnMes = new Date(anio, mes + 1, 0).getDate();
  const huecoInicial = (new Date(anio, mes, 1).getDay() + 6) % 7;
  const celdas = [...Array(huecoInicial).fill(null), ...Array.from({ length: diasEnMes }, (_, i) => i + 1)];
  while (celdas.length % 7) celdas.push(null);
  const semanas = [];
  for (let i = 0; i < celdas.length; i += 7) semanas.push(celdas.slice(i, i + 7));
  return semanas;
}

export function rangoMes(anio, mes) {
  return {
    desde: new Date(anio, mes, 1, 0, 0, 0, 0).toISOString(),
    hasta: new Date(anio, mes + 1, 0, 23, 59, 59, 999).toISOString(),
  };
}

export function agruparPorDia(eventos) {
  const grupos = new Map();
  eventos.forEach((e) => {
    const clave = claveDia(new Date(e.fecha_inicio));
    if (!grupos.has(clave)) grupos.set(clave, []);
    grupos.get(clave).push(e);
  });
  return grupos;
}

export function nombreMes(anio, mes) {
  return new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(new Date(anio, mes, 1));
}

// "sáb 21 nov · 21:00"
export function fechaEvento(iso) {
  const fecha = new Date(iso);
  const dia = new Intl.DateTimeFormat('es-ES', { weekday: 'short', day: 'numeric', month: 'short' }).format(fecha);
  const hora = new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit' }).format(fecha);
  return `${dia} · ${hora}`;
}

// Dónde es: el local de Ensamblia o el lugar escrito, y la ciudad
export function lugarEvento({ local, lugar, ciudad }) {
  return [local?.nombre || lugar, ciudad].filter(Boolean).join(' · ');
}
