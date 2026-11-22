// src/components/ui/Skeleton/Skeleton.jsx
import React from 'react';
import styles from './Skeleton.module.css';

export function Skeleton({ width = '100%', height = '1rem', radius = 8, className = '', style }) {
  return (
    <span
      className={[styles.skeleton, className].filter(Boolean).join(' ')}
      style={{ width, height, borderRadius: radius, ...style }}
      aria-hidden="true"
    />
  );
}