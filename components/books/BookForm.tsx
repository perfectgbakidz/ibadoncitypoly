

import React, { useState, useEffect } from 'react';
import { Book } from '../../types';
import Input from '../common/Input';
import Button from '../common/Button';

interface BookFormProps {
  book?: Book | null;
  onSave: (book: Omit<Book, 'id'> | Book, coverImageFile?: File | null) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const BookForm: React.FC<BookFormProps> = ({ book, onSave, onCancel, isLoading }) => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    quantity: 1,
    description: '',
    category: '',
    coverImageUrl: '',
  });

  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        quantity: book.quantity,
        description: book.description || '',
        category: book.category || '',
        coverImageUrl: book.coverImageUrl || '',
      });
      setPreviewUrl(book.coverImageUrl || null);
      setCoverImageFile(null);
    } else {
        setFormData({ title: '', author: '', isbn: '', quantity: 1, description: '', category: '', coverImageUrl: '' });
        setPreviewUrl(null);
        setCoverImageFile(null);
    }
  }, [book]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'quantity' ? parseInt(value) || 0 : value }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          setCoverImageFile(file);
          setPreviewUrl(URL.createObjectURL(file));
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (book) {
      onSave({ 
        ...book, 
        ...formData,
      }, coverImageFile);
    } else {
      onSave({
        ...formData,
        availableQuantity: formData.quantity, 
      }, coverImageFile);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input label="Title" id="title" name="title" value={formData.title} onChange={handleChange} required />
      <Input label="Author" id="author" name="author" value={formData.author} onChange={handleChange} required />
      <Input label="ISBN" id="isbn" name="isbn" value={formData.isbn} onChange={handleChange} required />
      <Input label="Quantity" id="quantity" name="quantity" type="number" min="1" value={formData.quantity} onChange={handleChange} required />
      <Input label="Category" id="category" name="category" value={formData.category} onChange={handleChange} placeholder="e.g., Programming, Science" />
      
      <div>
        <label htmlFor="coverImageFile" className="block text-sm font-medium text-slate-700">Cover Image</label>
        <div className="mt-2 flex items-center space-x-4">
            <div className="shrink-0">
                <img 
                    className="h-20 w-16 object-cover rounded-md" 
                    src={previewUrl || 'https://i.imgur.com/vJ4oXhQ.png'} 
                    alt="Current cover" 
                />
            </div>
            <label className="block">
                <span className="sr-only">Choose cover photo</span>
                <input 
                    type="file"
                    id="coverImageFile"
                    name="coverImageFile"
                    onChange={handleFileChange}
                    accept="image/png, image/jpeg, image/webp"
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                />
            </label>
        </div>
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-slate-700">Description</label>
        <div className="mt-1">
          <textarea
            id="description"
            name="description"
            rows={3}
            className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
            value={formData.description}
            onChange={handleChange}
            placeholder="A brief summary of the book..."
          />
        </div>
      </div>
      <div className="flex justify-end space-x-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" isLoading={isLoading}>{book ? 'Update Book' : 'Add Book'}</Button>
      </div>
    </form>
  );
};

export default BookForm;
