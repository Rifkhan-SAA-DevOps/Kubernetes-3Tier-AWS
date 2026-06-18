import React from 'react';
import { getInitials, getAvatarColor } from '../utils/avatar';

export default function Avatar({ name, size = 'md' }) {
  const className = size === 'lg' ? 'avatar avatar-lg' : 'avatar';
  return (
    <span className={className} style={{ background: getAvatarColor(name || '') }} title={name || ''}>
      {getInitials(name)}
    </span>
  );
}
