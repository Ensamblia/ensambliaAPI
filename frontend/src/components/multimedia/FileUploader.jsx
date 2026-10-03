import React, { useRef, useState } from 'react';
import { uploadFile } from '../../api/multimedia';

/* ── Styles ── */
const wrapper = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
};

const dropzone = (dragging) => ({
  border: `2px dashed ${dragging ? '#FF5C35' : '#EBEBEB'}`,
  borderRadius: '12px',
  padding: '28px 20px',
  textAlign: 'center',
  backgroundColor: dragging ? '#FFF0EC' : '#FAFAFA',
  cursor: 'pointer',
  transition: 'all 160ms ease',
});

const dzIcon = { fontSize: '1.8rem', marginBottom: '6px' };

const dzText = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '13.5px',
  color: '#555555',
  margin: 0,
};

const dzHint = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '11.5px',
  color: '#8A8A8A',
  marginTop: '4px',
};

const progressWrapper = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
};

const progressBar = {
  height: '6px',
  backgroundColor: '#F2F2F2',
  borderRadius: '999px',
  overflow: 'hidden',
};

const progressFill = (percent) => ({
  height: '100%',
  width: `${percent}%`,
  backgroundColor: '#FF5C35',
  transition: 'width 200ms ease',
});

const progressText = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '12px',
  color: '#8A8A8A',
};

const errorText = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '12.5px',
  color: '#E0402B',
  margin: 0,
};

const successText = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '12.5px',
  color: '#1E6B3A',
  margin: 0,
};

/**
 * Tipos aceptados en el selector de archivos. Debe coincidir con
 * la lista blanca del backend (apps/chats/utils.py).
 */
const ACCEPT =
  // Imágenes
  'image/jpeg,image/png,image/gif,image/webp,' +
  // Audio
  'audio/mpeg,audio/wav,audio/ogg,audio/webm,' +
  // Vídeo
  'video/mp4,video/webm,video/quicktime,' +
  // Documentos
  'application/pdf,text/plain,' +
  'application/msword,' +
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document,' +
  'application/vnd.oasis.opendocument.text';

export function FileUploader({
  anuncioId = null,
  onUploaded = null,
  label = 'Arrastra un archivo o haz click para seleccionar',
  hint = 'Imágenes ≤10MB · Audio/Vídeo ≤50MB · PDF/Docs ≤10MB',
}) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFile = async (file) => {
    if (!file) return;

    setError('');
    setSuccess('');
    setUploading(true);
    setProgress(0);

    try {
      const resultado = await uploadFile(file, {
        anuncioId,
        onProgress: (p) => setProgress(p),
      });
      setSuccess(`Archivo subido: ${resultado.nombre}`);
      if (onUploaded) onUploaded(resultado);
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.message ||
        'Error al subir el archivo';
      setError(msg);
    } finally {
      setUploading(false);
      setProgress(0);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  const handleClick = () => {
    if (!uploading) inputRef.current?.click();
  };

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    handleFile(file);
  };

  return (
    <div style={wrapper}>
      <div
        style={dropzone(dragging)}
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div style={dzIcon}>📎</div>
        <p style={dzText}>{uploading ? 'Subiendo…' : label}</p>
        <p style={dzHint}>{hint}</p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          onChange={handleChange}
          style={{ display: 'none' }}
          disabled={uploading}
        />
      </div>

      {uploading && (
        <div style={progressWrapper}>
          <div style={progressBar}>
            <div style={progressFill(progress)} />
          </div>
          <span style={progressText}>{progress}%</span>
        </div>
      )}

      {error && <p style={errorText}>⚠️ {error}</p>}
      {success && <p style={successText}>✅ {success}</p>}
    </div>
  );
}