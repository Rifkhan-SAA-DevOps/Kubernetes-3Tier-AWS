/**
 * Seed script: creates a default admin user and a few sample books.
 * Run with: npm run seed
 */
require('dotenv').config();
const { connectDB } = require('./config/db');
const User = require('./models/User');
const Book = require('./models/Book');

const ADMIN_PASSWORD_HASH = '$2b$10$L2BPTA1pOcZSnO8hXiv21u5fA8s56HLzQzxMuBPHCjbki..Ks5vbG'; // "Admin@123"

const sampleBooks = [
  { title: 'Clean Code', author: 'Robert C. Martin', isbn: '9780132350884', category: 'Software Engineering', description: 'A handbook of agile software craftsmanship.', publishedYear: 2008, totalCopies: 5, availableCopies: 5 },
  { title: 'The Pragmatic Programmer', author: 'Andrew Hunt & David Thomas', isbn: '9780201616224', category: 'Software Engineering', description: 'From journeyman to master.', publishedYear: 1999, totalCopies: 3, availableCopies: 3 },
  { title: 'Kubernetes Up & Running', author: 'Kelsey Hightower', isbn: '9781492046530', category: 'DevOps', description: 'Dive into the future of infrastructure.', publishedYear: 2019, totalCopies: 4, availableCopies: 4 },
  { title: 'Designing Data-Intensive Applications', author: 'Martin Kleppmann', isbn: '9781449373320', category: 'Databases', description: 'Big ideas behind reliable, scalable, maintainable systems.', publishedYear: 2017, totalCopies: 2, availableCopies: 2 },
  { title: 'The Phoenix Project', author: 'Gene Kim', isbn: '9780988262591', category: 'DevOps', description: 'A novel about IT, DevOps, and helping your business win.', publishedYear: 2013, totalCopies: 3, availableCopies: 3 },
];

async function seed() {
  await connectDB();

  const existingAdmin = await User.findOne({ username: 'admin' });
  if (!existingAdmin) {
    await User.create({
      username: 'admin',
      email: 'admin@library.local',
      passwordHash: ADMIN_PASSWORD_HASH,
      role: 'admin',
    });
    console.log('Created default admin user (admin / Admin@123)');
  } else {
    console.log('Admin user already exists, skipping');
  }

  for (const bookData of sampleBooks) {
    const existing = await Book.findOne({ isbn: bookData.isbn });
    if (!existing) {
      await Book.create(bookData);
      console.log(`Inserted book: ${bookData.title}`);
    }
  }

  console.log('Seed complete.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
