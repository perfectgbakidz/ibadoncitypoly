
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Book } from '../types';
import * as api from '../services/api';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../hooks/useAuth';
import Spinner from '../components/common/Spinner';
import Button from '../components/common/Button';

const BookDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [book, setBook] = useState<Book | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { addToast } = useToast();
    const { user } = useAuth();
    
    const fetchBook = useCallback(async () => {
        if (!id) return;
        setIsLoading(true);
        try {
            const data = await api.getBookById(Number(id));
            setBook(data);
        } catch (error) {
            addToast('Failed to fetch book details.', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [id, addToast]);

    useEffect(() => {
        fetchBook();
    }, [fetchBook]);
    
    const handleRequestLoan = async () => {
        if (!book) return;
        setIsSubmitting(true);
        try {
            await api.requestBookLoan(book.id);
            addToast(`Loan requested for "${book.title}"!`, 'success');
            await fetchBook(); // Re-fetch to update availability
        } catch (error) {
            addToast((error as Error).message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handlePlaceHold = async () => {
        if (!book) return;
        setIsSubmitting(true);
        try {
            await api.placeHold(book.id);
            addToast(`You've been placed on the waitlist for "${book.title}"!`, 'success');
            await fetchBook(); // Re-fetch for any status change
        } catch (error) {
            addToast((error as Error).message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <Spinner />;
    if (!book) return <div className="text-center p-8">Book not found.</div>;

    const isAvailable = book.availableQuantity > 0;

    return (
        <div className="bg-white p-6 md:p-8 rounded-lg shadow-md max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                    <img 
                        src={book.coverImageUrl || 'https://i.imgur.com/vJ4oXhQ.png'} 
                        alt={`Cover for ${book.title}`} 
                        className="w-full h-auto object-cover rounded-lg shadow-lg"
                    />
                </div>
                <div className="md:col-span-2 space-y-4">
                    <h1 className="text-3xl font-bold text-slate-800">{book.title}</h1>
                    <p className="text-lg text-slate-600">by {book.author}</p>
                    
                    <div className="flex items-center space-x-4 pt-2">
                        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${isAvailable ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                           {isAvailable ? `${book.availableQuantity} Available` : 'Unavailable'}
                        </span>
                        {book.category && <span className="bg-slate-100 text-slate-800 px-3 py-1 text-sm font-semibold rounded-full">{book.category}</span>}
                    </div>

                    <p className="text-slate-700 leading-relaxed pt-4 border-t mt-4">
                        {book.description || 'No description available.'}
                    </p>

                    <div className="text-sm text-slate-500 pt-2">
                        <p><strong>ISBN:</strong> {book.isbn}</p>
                        <p><strong>Total Copies:</strong> {book.quantity}</p>
                    </div>

                    {user?.role === 'student' && (
                        <div className="pt-4 border-t mt-4">
                            {isAvailable ? (
                                <Button onClick={handleRequestLoan} isLoading={isSubmitting}>Request Loan</Button>
                            ) : (
                                <Button onClick={handlePlaceHold} variant="secondary" isLoading={isSubmitting}>Place a Hold</Button>
                            )}
                        </div>
                    )}
                </div>
            </div>
             <div className="mt-8 pt-4 border-t">
                <Link to="/books" className="text-green-600 hover:text-green-500 font-medium">
                    &larr; Back to All Books
                </Link>
            </div>
        </div>
    );
};

export default BookDetailPage;
