

import React, { useState, useEffect, useCallback } from 'react';
import { Book } from '../types';
import * as api from '../services/api';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../hooks/useAuth';
import BookTable from '../components/books/BookTable';
import BookForm from '../components/books/BookForm';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Spinner from '../components/common/Spinner';

const BooksPage: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { addToast } = useToast();
  const { user } = useAuth();

  const isAdmin = user?.role === 'admin';

  const fetchBooks = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.getBooks();
      setBooks(data);
    } catch (error) {
      addToast('Failed to fetch books', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  useEffect(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    const filteredData = books.filter(item =>
        item.title.toLowerCase().includes(lowercasedFilter) ||
        item.author.toLowerCase().includes(lowercasedFilter) ||
        item.isbn.toLowerCase().includes(lowercasedFilter)
    );
    setFilteredBooks(filteredData);
}, [searchTerm, books]);


  const handleOpenModal = (book: Book | null = null) => {
    setEditingBook(book);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBook(null);
  };

  const handleSaveBook = async (bookData: Omit<Book, 'id'> | Book, coverImageFile?: File | null) => {
    setIsSubmitting(true);
    try {
      if ('id' in bookData) {
        await api.updateBook(bookData, coverImageFile);
        addToast('Book updated successfully', 'success');
      } else {
        await api.createBook(bookData as Omit<Book, 'id'>, coverImageFile);
        addToast('Book added successfully', 'success');
      }
      await fetchBooks();
      handleCloseModal();
    } catch (error) {
      addToast((error as Error).message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBook = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await api.deleteBook(id);
        addToast('Book deleted successfully', 'success');
        await fetchBooks();
      } catch (error) {
        addToast('Failed to delete book', 'error');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="w-full md:w-1/3">
           <input
             type="text"
             placeholder="Search by title, author, ISBN..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
            />
        </div>
        {isAdmin && <Button onClick={() => handleOpenModal()} className="w-full md:w-auto">Add New Book</Button>}
      </div>

      {isLoading ? (
        <Spinner />
      ) : (
        <BookTable 
          books={filteredBooks} 
          onEdit={handleOpenModal} 
          onDelete={handleDeleteBook}
          isActionsAllowed={isAdmin}
        />
      )}

      {isAdmin && <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingBook ? 'Edit Book' : 'Add New Book'}
      >
        <BookForm
          book={editingBook}
          onSave={handleSaveBook}
          onCancel={handleCloseModal}
          isLoading={isSubmitting}
        />
      </Modal>}
    </div>
  );
};

export default BooksPage;