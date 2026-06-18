import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import BookCover from '../components/BookCover';
import { validateBookForm } from '../utils/validation';
import { getWishlist, toggleWishlist } from '../utils/wishlist';

const emptyForm = {
  title: '', author: '', isbn: '', category: '', description: '',
  publishedYear: '', totalCopies: 1, imageUrl: '',
};

export default function Books() {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');

  const [sortBy, setSortBy] = useState('newest');
  const [filterCategory, setFilterCategory] = useState('all');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [wishlist, setWishlist] = useState(() => getWishlist());

  async function loadBooks() {
    const { data } = await api.get('/books', { params: { search } });
    setBooks(data);
  }

  useEffect(() => {
    loadBooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSearch(e) {
    e.preventDefault();
    loadBooks();
  }

  async function handleBorrow(bookId) {
    setMessage('');
    try {
      await api.post(`/borrow/${bookId}`);
      setMessage('Book borrowed successfully!');
      loadBooks();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to borrow');
    }
  }

  function handleToggleWishlist(bookId) {
    setWishlist(toggleWishlist(bookId));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validateBookForm(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      setMessage('Please fix the highlighted fields before saving.');
      return;
    }

    const payload = {
      ...form,
      publishedYear: form.publishedYear ? Number(form.publishedYear) : null,
      totalCopies: Number(form.totalCopies),
      imageUrl: form.imageUrl.trim() || null,
    };
    setMessage('');
    try {
      if (editingId) {
        await api.put(`/books/${editingId}`, payload);
        setMessage('Book updated.');
      } else {
        await api.post('/books', payload);
        setMessage('Book added.');
      }
      setForm(emptyForm);
      setErrors({});
      setEditingId(null);
      loadBooks();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to save book');
    }
  }

  function startEdit(book) {
    setEditingId(book.id);
    setErrors({});
    setForm({
      title: book.title,
      author: book.author,
      isbn: book.isbn || '',
      category: book.category || '',
      description: book.description || '',
      publishedYear: book.publishedYear || '',
      totalCopies: book.totalCopies,
      imageUrl: book.imageUrl || '',
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setErrors({});
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this book?')) return;
    await api.delete(`/books/${id}`);
    loadBooks();
  }

  function setField(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) {
      setErrors((e) => ({ ...e, [field]: undefined }));
    }
  }

  const categories = useMemo(() => {
    const set = new Set();
    books.forEach((b) => b.category && set.add(b.category));
    return Array.from(set).sort();
  }, [books]);

  const visibleBooks = useMemo(() => {
    let list = books.slice();
    if (filterCategory !== 'all') {
      list = list.filter((b) => b.category === filterCategory);
    }
    if (favoritesOnly) {
      list = list.filter((b) => wishlist.includes(String(b.id)));
    }
    switch (sortBy) {
      case 'title':
        list.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'author':
        list.sort((a, b) => a.author.localeCompare(b.author));
        break;
      case 'availability':
        list.sort((a, b) => b.availableCopies - a.availableCopies);
        break;
      case 'rating':
        list.sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0));
        break;
      default:
        break; // 'newest' - keep server order (already id DESC / createdAt DESC)
    }
    return list;
  }, [books, sortBy, filterCategory, favoritesOnly, wishlist]);

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h2>Books</h2>
          <p className="page-subtitle">Browse the catalog and manage borrows</p>
        </div>
      </div>

      {message && <div className="alert">{message}</div>}

      <form onSubmit={handleSearch} className="inline-form">
        <input placeholder="Search by title, author, ISBN" value={search} onChange={(e) => setSearch(e.target.value)} />
        <button type="submit">Search</button>
      </form>

      <div className="toolbar">
        <div className="field-group">
          <label>Sort by</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="newest">Newest</option>
            <option value="title">Title (A-Z)</option>
            <option value="author">Author (A-Z)</option>
            <option value="availability">Availability</option>
            <option value="rating">Top rated</option>
          </select>
        </div>

        <div className="field-group">
          <label>Category</label>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="all">All categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {user && (
          <div className="field-group">
            <label>&nbsp;</label>
            <button
              type="button"
              className={favoritesOnly ? '' : 'btn-secondary'}
              onClick={() => setFavoritesOnly((v) => !v)}
            >
              {favoritesOnly ? '♥ Favorites only' : '♡ Favorites only'}
            </button>
          </div>
        )}

        <div className="spacer" />

        <div className="field-group">
          <label>View</label>
          <div className="view-toggle">
            <button
              type="button"
              className={`icon-btn${viewMode === 'grid' ? ' active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid view"
              aria-label="Grid view"
            >
              ▦
            </button>
            <button
              type="button"
              className={`icon-btn${viewMode === 'list' ? ' active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List view"
              aria-label="List view"
            >
              ☰
            </button>
          </div>
        </div>
      </div>

      {visibleBooks.length === 0 ? (
        <div className="empty-state">No books found. Try a different search or filter.</div>
      ) : (
        <div className={`book-grid${viewMode === 'list' ? ' list-view' : ''}`}>
          {visibleBooks.map((b) => {
            const available = b.availableCopies > 0;
            const favorited = wishlist.includes(String(b.id));
            return (
              <div className="book-card" key={b.id}>
                {user && (
                  <button
                    type="button"
                    className="wishlist-btn"
                    onClick={() => handleToggleWishlist(b.id)}
                    title={favorited ? 'Remove from favorites' : 'Add to favorites'}
                    aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    {favorited ? '♥' : '♡'}
                  </button>
                )}
                <Link to={`/books/${b.id}`}>
                  <BookCover imageUrl={b.imageUrl} isbn={b.isbn} title={b.title} />
                </Link>
                <div className="book-body">
                  <Link to={`/books/${b.id}`}><h3>{b.title}</h3></Link>
                  <p className="book-author">{b.author}</p>
                  <div className="book-badges">
                    {b.category && <span className="badge badge-info">{b.category}</span>}
                    {b.reviewCount > 0 && (
                      <span className="rating-badge">
                        ★ {Number(b.avgRating).toFixed(1)} <span className="count">({b.reviewCount})</span>
                      </span>
                    )}
                    <span className={`badge ${available ? 'badge-success' : 'badge-danger'}`}>
                      {b.availableCopies} / {b.totalCopies} available
                    </span>
                  </div>
                  <div className="book-actions">
                    {user && (
                      <button
                        className="icon-btn icon-btn-primary"
                        disabled={!available}
                        onClick={() => handleBorrow(b.id)}
                        title={available ? 'Borrow this book' : 'No copies available'}
                        aria-label="Borrow"
                      >
                        📥
                      </button>
                    )}
                    {user?.role === 'admin' && (
                      <>
                        <button
                          className="icon-btn"
                          onClick={() => startEdit(b)}
                          title="Edit book"
                          aria-label="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          className="icon-btn icon-btn-danger"
                          onClick={() => handleDelete(b.id)}
                          title="Delete book"
                          aria-label="Delete"
                        >
                          🗑️
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {user?.role === 'admin' && (
        <div className="card" style={{ marginTop: '2rem' }}>
          <h3>{editingId ? 'Edit Book' : 'Add Book'}</h3>
          <form onSubmit={handleSubmit}>
            <label>Title</label>
            <input
              className={errors.title ? 'invalid' : ''}
              value={form.title}
              onChange={(e) => setField('title', e.target.value)}
            />
            {errors.title && <p className="field-error">{errors.title}</p>}

            <label>Author</label>
            <input
              className={errors.author ? 'invalid' : ''}
              value={form.author}
              onChange={(e) => setField('author', e.target.value)}
            />
            {errors.author && <p className="field-error">{errors.author}</p>}

            <label>ISBN</label>
            <input
              className={errors.isbn ? 'invalid' : ''}
              value={form.isbn}
              onChange={(e) => setField('isbn', e.target.value)}
              placeholder="e.g. 9780132350884"
            />
            {errors.isbn && <p className="field-error">{errors.isbn}</p>}

            <label>Category</label>
            <input value={form.category} onChange={(e) => setField('category', e.target.value)} />

            <label>Description</label>
            <textarea value={form.description} onChange={(e) => setField('description', e.target.value)} />

            <label>Published Year</label>
            <input
              type="number"
              className={errors.publishedYear ? 'invalid' : ''}
              value={form.publishedYear}
              onChange={(e) => setField('publishedYear', e.target.value)}
            />
            {errors.publishedYear && <p className="field-error">{errors.publishedYear}</p>}

            <label>Total Copies</label>
            <input
              type="number"
              min="1"
              className={errors.totalCopies ? 'invalid' : ''}
              value={form.totalCopies}
              onChange={(e) => setField('totalCopies', e.target.value)}
            />
            {errors.totalCopies && <p className="field-error">{errors.totalCopies}</p>}

            <label>Cover Image URL</label>
            <input
              className={errors.imageUrl ? 'invalid' : ''}
              value={form.imageUrl}
              onChange={(e) => setField('imageUrl', e.target.value)}
              placeholder="https://example.com/cover.jpg"
            />
            {errors.imageUrl && <p className="field-error">{errors.imageUrl}</p>}
            {form.imageUrl && !errors.imageUrl && (
              <div className="image-preview">
                <img
                  src={form.imageUrl}
                  alt="Cover preview"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            )}

            <div style={{ marginTop: '0.5rem' }}>
              <button type="submit">{editingId ? 'Update' : 'Add'} Book</button>
              {editingId && (
                <button type="button" className="btn-secondary" onClick={cancelEdit}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
