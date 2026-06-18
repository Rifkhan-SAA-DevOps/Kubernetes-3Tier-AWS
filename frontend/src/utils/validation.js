/** Validates the Add/Edit Book form. Returns an object of field -> error message. */
export function validateBookForm(form) {
  const errors = {};

  if (!form.title || !form.title.trim()) {
    errors.title = 'Title is required';
  }
  if (!form.author || !form.author.trim()) {
    errors.author = 'Author is required';
  }

  if (form.isbn && form.isbn.trim()) {
    const cleaned = form.isbn.replace(/[-\s]/g, '');
    if (!/^(?:\d{9}[\dXx]|\d{13})$/.test(cleaned)) {
      errors.isbn = 'ISBN must be 10 or 13 digits (ISBN-10 may end in X)';
    }
  }

  if (form.publishedYear !== '' && form.publishedYear !== null && form.publishedYear !== undefined) {
    const year = Number(form.publishedYear);
    const currentYear = new Date().getFullYear();
    if (Number.isNaN(year) || year < 1000 || year > currentYear) {
      errors.publishedYear = `Year must be between 1000 and ${currentYear}`;
    }
  }

  const totalCopies = Number(form.totalCopies);
  if (form.totalCopies === '' || Number.isNaN(totalCopies) || totalCopies < 1) {
    errors.totalCopies = 'Total copies must be at least 1';
  }

  if (form.imageUrl && form.imageUrl.trim() && !/^https?:\/\/.+/i.test(form.imageUrl.trim())) {
    errors.imageUrl = 'Image URL must start with http:// or https://';
  }

  return errors;
}
