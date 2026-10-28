// src/pages/PreciosPage.jsx
import React, { useContext, useState } from 'react';
import { Check } from 'lucide-react';
import { AuthContext } from '@/context/AuthContext';
import { Button, Card, PageHeader, Tag } from '@/components/ui';
import { PLANES, precioPlan } from '@/utils/planes';
import styles from './PreciosPage.module.css';

const PERIODOS = [
  { id: 'mensual', label: 'Mensual' },
  { id: 'anual', label: 'Anual' },
];

export function PreciosPage() {
  const { user } = useContext(AuthContext);
  const [periodo, setPeriodo] = useState('mensual');

  return (
    <main className={styles.page}>
      <PageHeader
        title="Planes y precios"
        subtitle="Elige cómo quieres moverte en Ensamblia. Los planes de pago llegarán pronto."
      />

      <div className={styles.periodos} role="group" aria-label="Periodo de facturación">
        {PERIODOS.map((p) => (
          <button
            key={p.id}
            type="button"
            className={[styles.periodo, periodo === p.id ? styles.periodoActivo : '']
              .filter(Boolean)
              .join(' ')}
            aria-pressed={periodo === p.id}
            onClick={() => setPeriodo(p.id)}
          >
            {p.label}
          </button>
        ))}
        <span className={styles.ahorro}>Anual: 2 meses gratis</span>
      </div>

      <div className={styles.grid}>
        {PLANES.map((plan) => {
          const precio = precioPlan(plan, periodo);
          const esFree = plan.precioMensual === 0;
          return (
            <Card
              key={plan.id}
              as="article"
              elevation={plan.recomendado ? 'raised' : 'flat'}
              padding="lg"
              className={[styles.plan, plan.recomendado ? styles.recomendado : '']
                .filter(Boolean)
                .join(' ')}
            >
              <div className={styles.cabecera}>
                <h2 className={styles.nombre}>{plan.nombre}</h2>
                {plan.recomendado && (
                  <Tag color="yellow" size="sm">
                    Recomendado
                  </Tag>
                )}
              </div>
              <p className={styles.descripcion}>{plan.descripcion}</p>

              <p className={styles.precio}>
                <span className={styles.importe}>{precio.importe}</span>
                <span className={styles.periodoTexto}>{precio.periodo}</span>
              </p>

              <ul className={styles.ventajas}>
                {plan.ventajas.map((v) => (
                  <li key={v} className={styles.ventaja}>
                    <Check size={16} aria-hidden="true" className={styles.check} />
                    <span>{v}</span>
                  </li>
                ))}
              </ul>

              <div className={styles.accion}>
                {esFree && !user && (
                  <Button to="/register" variant="secondary" block>
                    Crear cuenta gratis
                  </Button>
                )}
                {esFree && user && <span className={styles.planActual}>Tu plan actual</span>}
                {!esFree && (
                  <Button variant={plan.recomendado ? 'primary' : 'dark'} block disabled>
                    Próximamente
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <p className={styles.nota}>
        Todavía no cobramos nada: estamos preparando los pagos. Mientras tanto, todas las
        funciones siguen disponibles.
      </p>
    </main>
  );
}
