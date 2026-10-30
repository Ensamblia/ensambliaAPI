// src/components/filters/CiudadPorComarca.jsx
import React, { useState } from 'react';
import { Field, Select } from '@/components/ui';

/**
 * Comarca + ciudad. Elegir antes la comarca acota la lista de ciudades
 * (son 947 municipios: en un único desplegable no se puede elegir en el móvil).
 * Controlado por la ciudad: value = ciudad_id (string), onChange(ciudad_id).
 */
export function CiudadPorComarca({ ciudades, comarcas, value, onChange, required = false }) {
  const comarcaDeCiudad = ciudades.find((c) => String(c.ciudad_id) === String(value))?.comarca_id;
  const [comarcaElegida, setComarcaElegida] = useState('');
  // Si ya hay ciudad (p. ej. al editar), su comarca manda hasta que se elija otra
  const comarca = comarcaElegida || (comarcaDeCiudad ? String(comarcaDeCiudad) : '');
  const opciones = comarca ? ciudades.filter((c) => String(c.comarca_id) === comarca) : ciudades;

  const cambiarComarca = (e) => {
    setComarcaElegida(e.target.value);
    // La ciudad elegida ya no está en la comarca nueva: se vacía
    if (value && e.target.value && String(comarcaDeCiudad) !== e.target.value) onChange('');
  };

  return (
    <>
      <Field label="Comarca" hint="Elígela primero para encontrar antes la ciudad.">
        <Select value={comarca} onChange={cambiarComarca}>
          <option value="">Todas las comarcas</option>
          {comarcas.map((c) => (
            <option key={c.comarca_id} value={c.comarca_id}>
              {c.nombre}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Ciudad" required={required}>
        <Select value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="">Elige una ciudad</option>
          {opciones.map((c) => (
            <option key={c.ciudad_id} value={c.ciudad_id}>
              {c.nombre}
            </option>
          ))}
        </Select>
      </Field>
    </>
  );
}
