import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import BookCover from '../components/BookCover';
import { getWishlist, toggleWishlist } from '../utils/wishlist';

export default function BookDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [wishlist, setWishlist] = useState(() => getWishlist());

  async function load() {
    const { data: bookData } = await api.get(`/books/${id}`);
    setBook(bookData);
    try {
      const { data: reviewData } = await api.get(`/reviews/book/${id}`);
      setReviews(reviewData);
    } catch {
      setReviews([]);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function submitReview(e) {
    e.preventDefault();
    setError('');
    try {
      await api.post(`/reviews/book/${id}`, { rating: Number(rating), comment });
      setComment('');
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review');
    }
  }

  async function handleBorrow() {
    setMessage('');
    try {
      await api.post(`/borrow/${id}`);
      setMessage('Book borrowed successfully!');
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to borrow');
    }
  }

  function handleToggleWishlist() {
    setWishlist(toggleWishlist(id));
  }

  if (!book) return <div className="container">Loading...</div>;

  const available = book.availableCopies > 0;
  const favorited = wishlist.includes(String(id));

  return (
    <div className="container">
      <Link to="/books">&larr; Back to books</Link>

      {message && <div className="alert">{message}</div>}

      <div className="card" style={{ marginTop: '1rem' }}>
        <div className="detail-header">
          <div className="detail-main">
            <BookCover imageUrl={book.imageUrl} isbn={book.isbn} title={book.title} className="detail-cover" />
            <div>
              <h2>{book.title}</h2>
              <p className="book-author" style={{ margin: 0 }}>{book.author}</p>
              <div className="book-badges" style={{ marginTop: '0.5rem' }}>
                {book.reviewCount > 0 && (
                  <span className="rating-badge">
                    ★ {Number(book.avgRating).toFixed(1)} <span className="count">({book.reviewCount} review{book.reviewCount === 1 ? '' : 's'})</span>
                  </span>
                )}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className={`badge ${available ? 'badge-success' : 'badge-danger'}`}>
              {book.availableCopies} / {book.totalCopies} available
            </span>
            {user && (
              <>
                <button
                  className="icon-btn icon-btn-primary"
                  disabled={!available}
                  onClick={handleBorrow}
                  title={available ? 'Borrow this book' : 'No copies available'}
                  aria-label="Borrow"
                >
                  📥
                </button>
                <button
                  className="icon-btn"
                  onClick={handleToggleWishlist}
                  title={favorited ? 'Remove from favorites' : 'Add to favorites'}
                  aria-label="Toggle favorite"
                >
                  {favorited ? '♥' : '♡'}
                </button>
              </>
            )}
          </div>
        </div>

        <div className="detail-meta">
          {book.category && <span><strong>Category:</strong> {book.category}</span>}
          <span><strong>Published:</strong> {book.publishedYear || '—'}</span>
          <span><strong>ISBN:</strong> {book.isbn || '—'}</span>
        </div>

        {book.description && <p className="detail-description">{book.description}</p>}
      </div>

      <h3 style={{ marginTop: '1.5rem' }}>Reviews</h3>
      {reviews.length === 0 && <div className="empty-state">No reviews yet.</div>}
      <ul className="review-list">
        {reviews.map((r) => (
          <li key={r.id}>
            <strong>{r.username}</strong>{' '}
            <span className="stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
            <p>{r.comment}</p>
          </li>
        ))}
      </ul>

      {user && (
        <form onSubmit={submitReview} className="card">
          <h4>Leave a review</h4>
          {error && <div className="alert alert-error">{error}</div>}
          <label>Rating</label>
          <select value={rating} onChange={(e) => setRating(e.target.value)}>
            {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} star{n > 1 ? 's' : ''}</option>)}
          </select>
          <label>Comment</label>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} />
          <button type="submit" style={{ marginTop: '0.5rem' }}>Submit Review</button>
        </form>
      )}
    </div>
  );
}
