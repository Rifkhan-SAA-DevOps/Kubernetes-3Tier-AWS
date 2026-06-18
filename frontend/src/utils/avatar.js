// Small helpers for generating consistent user avatars from a name/string.

const AVATAR_COLORS = [
  '#4f46e5', '#7c3aed', '#0ea5e9', '#16a34a',
  '#d97706', '#dc2626', '#0d9488', '#db2777',
];

/**
 * Returns up to 2 uppercase initials for a given name/username.
 */
export function getInitials(name) {
  if (!name) return '?';
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

/**
 * Deterministically picks a color from a small palette based on the
 * characters of the given string, so the same name always gets the same color.
 */
export function getAvatarColor(name) {
  if (!name) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) % AVATAR_COLORS.length;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}
