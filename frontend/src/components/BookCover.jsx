import React, { useState } from 'react';

/**
 * Renders a book cover image. Prefers a custom `imageUrl` (set by an admin
 * on the book record), falls back to the Open Library Covers API (via ISBN),
 * and finally falls back to a gradient placeholder with a book emoji.
 */
export default function BookCover({ imageUrl, isbn, title, className = 'book-cover' }) {
  const [errored, setErrored] = useState(false);
  const [fallbackErrored, setFallbackErrored] = useState(false);
  const cleanIsbn = isbn ? String(isbn).replace(/[^0-9Xx]/g, '') : '';

  const customSrc = imageUrl && !errored ? imageUrl : null;
  const fallbackSrc = !customSrc && cleanIsbn && !fallbackErrored
    ? `https://covers.openlibrary.org/b/isbn/${cleanIsbn}-M.jpg`
    : null;

  const src = customSrc || fallbackSrc;

  if (!src) {
    return (
      <div className={className} role="img" aria-label={title ? `Cover for ${title}` : 'Book cover'}>
        📘
      </div>
    );
  }

  return (
    <div className={className}>
      <img
        src={src}
        alt={title ? `Cover of ${title}` : 'Book cover'}
        loading="lazy"
        onError={() => (customSrc ? setErrored(true) : setFallbackErrored(true))}
      />
    </div>
  );
}
