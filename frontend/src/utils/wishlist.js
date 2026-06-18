const KEY = 'lms_wishlist';

/** Returns an array of wishlisted book ids (strings). */
export function getWishlist() {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function isWishlisted(id) {
  return getWishlist().includes(String(id));
}

/** Toggles the given book id in the wishlist and returns the updated array. */
export function toggleWishlist(id) {
  const key = String(id);
  const list = getWishlist();
  const idx = list.indexOf(key);
  if (idx >= 0) {
    list.splice(idx, 1);
  } else {
    list.push(key);
  }
  localStorage.setItem(KEY, JSON.stringify(list));
  return list;
}
