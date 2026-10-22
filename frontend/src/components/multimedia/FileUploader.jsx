// src/components/multimedia/FileUploader.jsx
import React, { useRef, useState } from 'react';
import { uploadFile } from '@/api/multimedia';
import styles from './FileUploader.module.css';

/**
 * Tipos aceptados en el selector de archivos. Debe coincidir con
 * la lista blanca del backend (apps/chats/utils.py).
 */
const ACCEPT =
  'image/jpeg,image/png,image/gif,image/webp,' +
  'audio/mpeg,audio/wav,audio/ogg,audio/webm,' +
  'video/mp4,video/webm,video/quicktime,' +
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
    if (!uploading) setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  const handleClick = () => {
    if (!uploading) inputRef.current?.click();
  };

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    handleFile(file);
  };

  const dropzoneClass = [
    styles.dropzone,
    dragging ? styles.dragging : '',
    uploading ? styles.disabled : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles.wrapper}>
      <div
        className={dropzoneClass}
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        role="button"
        tabIndex={0}
        aria-label={label}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
      >
        <div className={styles.dzIcon}>📎</div>
        <p className={styles.dzText}>{uploading ? 'Subiendo…' : label}</p>
        <p className={styles.dzHint}>{hint}</p>
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
        <div className={styles.progressWrapper}>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className={styles.progressText}>{progress}%</span>
        </div>
      )}

      {error && <p className={styles.error}>⚠️ {error}</p>}
      {success && <p className={styles.success}>✅ {success}</p>}
    </div>
  );
}