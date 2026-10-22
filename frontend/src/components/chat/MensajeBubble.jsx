// src/components/chat/MensajeBubble.jsx
import React, { useEffect, useRef, useState } from 'react';
import { Button, IconButton, Textarea } from '@/components/ui';
import { AdjuntoPreview } from './AdjuntoPreview';
import styles from './MensajeBubble.module.css';

export function MensajeBubble({
  mensaje,
  esMio,
  leidoPorOtro = false,
  enEdicion = false,
  editContenido = '',
  onEditChange,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDeleteRequest,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const cerrar = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    window.addEventListener('click', cerrar);
    return () => window.removeEventListener('click', cerrar);
  }, [menuOpen]);

  const adjuntos = mensaje.adjuntos || [];
  const eliminado = mensaje.esta_eliminado;

  const rowClass = [styles.row, esMio ? styles.rowMio : styles.rowOtro].join(' ');
  const wrapperClass = [
    styles.wrapper,
    enEdicion ? styles.wrapperEnEdicion : '',
  ]
    .filter(Boolean)
    .join(' ');
  const bubbleClass = [
    styles.bubble,
    esMio ? styles.bubbleMio : styles.bubbleOtro,
    eliminado ? styles.bubbleEliminado : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rowClass}>
      <div className={wrapperClass}>
        {enEdicion ? (
          <div className={styles.editBox}>
            <Textarea
              autoFocus
              value={editContenido}
              onChange={onEditChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  onSaveEdit();
                }
                if (e.key === 'Escape') {
                  e.preventDefault();
                  onCancelEdit();
                }
              }}
              aria-label="Editar mensaje"
            />
            <div className={styles.editActions}>
              <Button variant="secondary" size="sm" onClick={onCancelEdit}>
                Cancelar
              </Button>
              <Button variant="primary" size="sm" onClick={onSaveEdit}>
                Guardar
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className={bubbleClass}>
            {!eliminado && adjuntos.length > 0 && (
                <div className={styles.adjuntosWrapper}>
                  {adjuntos.map((adj, idx) => (
                    <AdjuntoPreview
                      key={adj.adjunto_id}
                      adjunto={adj}
                      isOwn={esMio}
                      allAdjuntos={adjuntos}
                      initialIndex={idx}
                    />
                  ))}
                </div>
              )}
              {eliminado ? (
                <div>🚫 Este mensaje ha sido eliminado</div>
              ) : (
                mensaje.contenido && <div>{mensaje.contenido}</div>
              )}
              {esMio && !eliminado && (
                <div
                  className={[
                    styles.leidoIndicator,
                    leidoPorOtro
                      ? styles.leidoIndicatorLeido
                      : styles.leidoIndicatorMio,
                  ].join(' ')}
                  aria-label={leidoPorOtro ? 'Leído' : 'Enviado'}
                >
                  {leidoPorOtro ? '✓✓' : '✓'}
                </div>
              )}
              {mensaje.esta_editado && !eliminado && (
                <div
                  className={[
                    styles.editIndicator,
                    !esMio ? styles.editIndicatorOtro : '',
                  ].join(' ')}
                >
                  editado
                </div>
              )}
            </div>
            {esMio && !eliminado && (
              <div className={styles.menuWrapper} ref={menuRef}>
                <IconButton
                  variant="ghost"
                  size="sm"
                  className={styles.menuBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen((o) => !o);
                  }}
                  aria-label="Acciones del mensaje"
                >
                  ⋯
                </IconButton>
                {menuOpen && (
                  <div className={styles.menu}>
                    <button
                      type="button"
                      className={styles.menuItem}
                      onClick={() => {
                        setMenuOpen(false);
                        onStartEdit();
                      }}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className={[styles.menuItem, styles.menuItemDanger].join(' ')}
                      onClick={() => {
                        setMenuOpen(false);
                        onDeleteRequest();
                      }}
                    >
                      Borrar
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}