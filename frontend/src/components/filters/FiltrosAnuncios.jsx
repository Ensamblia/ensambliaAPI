import React from 'react';

const wrapper = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px',
  padding: '20px 0',
  borderBottom: '1px solid #EBEBEB',
  marginBottom: '28px',
};

const baseInput = {
  padding: '9px 14px',
  border: '1px solid #EBEBEB',
  borderRadius: '8px',
  fontFamily: "'Inter', sans-serif",
  fontSize: '13.5px',
  color: '#0F0F0F',
  backgroundColor: '#FAFAFA',
  transition: 'border-color 140ms ease, box-shadow 140ms ease, background 140ms ease',
  outline: 'none',
};

const searchInput = {
  ...baseInput,
  flex: '1 1 240px',
  minWidth: '200px',
};

const selectInput = {
  ...baseInput,
  flex: '0 1 150px',
  cursor: 'pointer',
  appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%238A8A8A' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 12px center',
  paddingRight: '32px',
};

const focusStyles = {
  borderColor: '#FF5C35',
  boxShadow: '0 0 0 3px rgba(255,92,53,0.10)',
  backgroundColor: '#FFFFFF',
};

const blurStyles = {
  borderColor: '#EBEBEB',
  boxShadow: 'none',
  backgroundColor: '#FAFAFA',
};

export function FiltrosAnuncios({ onFilter }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (onFilter) onFilter({ [name]: value });
  };

  const addFocus = (e) => Object.assign(e.target.style, focusStyles);
  const removeFocus = (e) => Object.assign(e.target.style, blurStyles);

  return (
    <div style={wrapper}>
      <input
        type="text"
        name="busqueda"
        placeholder="Buscar por título, instrumento, ciudad…"
        style={searchInput}
        onChange={handleChange}
        onFocus={addFocus}
        onBlur={removeFocus}
      />

      <select name="instrumento" style={selectInput} onChange={handleChange} onFocus={addFocus} onBlur={removeFocus}>
        <option value="">Instrumento</option>
        <option value="guitarra">Guitarra</option>
        <option value="bateria">Batería</option>
        <option value="piano">Piano</option>
        <option value="bajo">Bajo</option>
        <option value="voz">Voz</option>
        <option value="violin">Violín</option>
        <option value="saxofon">Saxofón</option>
      </select>

      <select name="genero" style={selectInput} onChange={handleChange} onFocus={addFocus} onBlur={removeFocus}>
        <option value="">Género</option>
        <option value="rock">Rock</option>
        <option value="jazz">Jazz</option>
        <option value="clasica">Clásica</option>
        <option value="pop">Pop</option>
        <option value="flamenco">Flamenco</option>
        <option value="electronica">Electrónica</option>
        <option value="reggae">Reggae</option>
      </select>

      <select name="ciudad" style={selectInput} onChange={handleChange} onFocus={addFocus} onBlur={removeFocus}>
        <option value="">Ciudad</option>
        <option value="barcelona">Barcelona</option>
        <option value="madrid">Madrid</option>
        <option value="sevilla">Sevilla</option>
        <option value="valencia">Valencia</option>
        <option value="bilbao">Bilbao</option>
        <option value="granada">Granada</option>
      </select>
    </div>
  );
}
