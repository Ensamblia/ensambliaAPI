// src/components/eventos/CalendarioMes.jsx
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { claveDia, nombreMes, semanasDelMes } from '@/utils/eventos';
import styles from './CalendarioMes.module.css';

const DIAS_SEMANA = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export function CalendarioMes({ anio, mes, eventosPorDia, diaSeleccionado, onSeleccionarDia, onMesAnterior, onMesSiguiente }) {
  const hoy = claveDia(new Date());
  const mesTexto = nombreMes(anio, mes);
  const soloMes = mesTexto.replace(/ de \d+$/, '');

  return (
    <div className={styles.calendario}>
      <div className={styles.cabecera}>
        <button type="button" className={styles.nav} onClick={onMesAnterior} aria-label="Mes anterior">
          <ChevronLeft size={18} aria-hidden="true" />
        </button>
        <h2 className={styles.mes}>{mesTexto}</h2>
        <button type="button" className={styles.nav} onClick={onMesSiguiente} aria-label="Mes siguiente">
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      </div>

      <div className={styles.rejilla}>
        {DIAS_SEMANA.map((d) => (
          <span key={d} className={styles.diaSemana} aria-hidden="true">
            {d}
          </span>
        ))}
        {semanasDelMes(anio, mes).flat().map((dia, i) => {
          if (!dia) return <span key={`hueco-${i}`} className={styles.hueco} />;
          const clave = claveDia(new Date(anio, mes, dia));
          const n = eventosPorDia.get(clave)?.length ?? 0;
          const clases = [
            styles.dia,
            n ? styles.conEventos : '',
            clave === hoy ? styles.hoy : '',
            clave === diaSeleccionado ? styles.seleccionado : '',
          ].filter(Boolean).join(' ');
          return (
            <button
              key={clave}
              type="button"
              className={clases}
              aria-pressed={clave === diaSeleccionado}
              aria-label={`${dia} de ${soloMes}${n ? `, ${n} ${n === 1 ? 'evento' : 'eventos'}` : ''}`}
              onClick={() => onSeleccionarDia(clave === diaSeleccionado ? null : clave)}
            >
              <span>{dia}</span>
              {n > 0 && <span className={styles.punto} aria-hidden="true" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
