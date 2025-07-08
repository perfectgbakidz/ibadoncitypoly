
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Book, Loan, LoanWithDetails, User } from '../types';
import * as api from '../services/api';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';

// Helper to format date strings
const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
};

// --- STUDENT VIEW ---
const StudentBorrowReturnPage = () => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [allBooks, setAllBooks] = useState<Book[]>([]);
    const [myLoans, setMyLoans] = useState<LoanWithDetails[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedBookIdToRequest, setSelectedBookIdToRequest] = useState('');
    const [selectedBookIdToReturn, setSelectedBookIdToReturn] = useState('');

    const fetchData = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const [booksData, loansData] = await Promise.all([api.getBooks(), api.getLoans()]);
            setAllBooks(booksData);
            const bookMap = new Map(booksData.map(book => [book.id, book.title]));
            const detailedLoans = loansData
                .filter(loan => loan.userId === user.id)
                .map(loan => ({
                    ...loan,
                    bookTitle: bookMap.get(loan.bookId) || 'Unknown Book',
                    userName: user.name,
                    userMatric: user.matric_no,
                }));
            setMyLoans(detailedLoans);
        } catch (error) {
            addToast('Failed to load data', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [addToast, user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    const handleRequestLoan = async () => {
        if (!selectedBookIdToRequest) {
            addToast('Please select a book to request', 'info');
            return;
        }
        setIsSubmitting(true);
        try {
            await api.requestBookLoan(parseInt(selectedBookIdToRequest));
            addToast('Book loan requested successfully!', 'success');
            setSelectedBookIdToRequest('');
            await fetchData();
        } catch (error) {
            addToast((error as Error).message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReturn = async () => {
        if (!selectedBookIdToReturn) {
            addToast('Please select a book to return', 'info');
            return;
        }
        setIsSubmitting(true);
        try {
            const response = await api.returnBook(parseInt(selectedBookIdToReturn));
            let successMessage = response.detail;
            if (response.fine && response.fine > 0) {
                successMessage += ` A fine of ${response.fine} has been applied.`;
            }
            addToast(successMessage, 'success');
            setSelectedBookIdToReturn('');
            await fetchData();
        } catch (error) {
            addToast((error as Error).message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDownloadCard = (loan: LoanWithDetails) => {
        const cardContent = `
            ------------------------------------
            IBADAN CITY POLYTECHNIC LIBRARY
            LOAN APPROVAL CARD
            ------------------------------------
            Student: ${loan.userName} (${loan.userMatric})
            Book: ${loan.bookTitle}
            Approved On: ${formatDate(loan.approvalDate)}
            Due Date: ${formatDate(loan.dueDate)}
            ------------------------------------
            Please present this card at the library desk.
        `;
        const blob = new Blob([cardContent.replace(/            /g, '')], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `loan-card-${loan.id}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        addToast("Approval card downloaded.", "success");
    };

    const myLoanedBookIds = useMemo(() => new Set(myLoans.filter(l => l.status === 'pending' || l.status === 'approved').map(l => l.bookId)), [myLoans]);
    const availableBooksToRequest = useMemo(() => allBooks.filter(book => book.availableQuantity > 0 && !myLoanedBookIds.has(book.id)), [allBooks, myLoanedBookIds]);
    const booksToReturn = useMemo(() => myLoans.filter(loan => loan.status === 'approved' && !loan.returnDate), [myLoans]);

    if (isLoading) return <Spinner />;
    
    const statusPill = (status: Loan['status']) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800',
            returned: 'bg-blue-100 text-blue-800',
            'on-hold': 'bg-indigo-100 text-indigo-800',
        };
        return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status]}`}>{status}</span>;
    }

    return (
        <div className="space-y-8">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
                    <h2 className="text-xl font-semibold text-slate-800 border-b pb-2">Request a Book Loan</h2>
                    <div>
                        <label htmlFor="book-select-borrow" className="block text-sm font-medium text-slate-700">Select Book</label>
                        <select id="book-select-borrow" value={selectedBookIdToRequest} onChange={e => setSelectedBookIdToRequest(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md">
                            <option value="">-- Choose a book --</option>
                            {availableBooksToRequest.map(book => <option key={book.id} value={book.id}>{book.title} ({book.author})</option>)}
                        </select>
                    </div>
                    <div className="pt-2">
                        <Button onClick={handleRequestLoan} isLoading={isSubmitting} disabled={!selectedBookIdToRequest}>Request Loan</Button>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
                    <h2 className="text-xl font-semibold text-slate-800 border-b pb-2">Return a Book</h2>
                     <div>
                        <label htmlFor="loan-select" className="block text-sm font-medium text-slate-700">Select a Book to Return</label>
                        <select id="loan-select" value={selectedBookIdToReturn} onChange={e => setSelectedBookIdToReturn(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md">
                            <option value="">-- Choose one of your borrowed books --</option>
                            {booksToReturn.map(loan => <option key={loan.id} value={loan.bookId}>{loan.bookTitle}</option>)}
                        </select>
                    </div>
                     <div className="pt-2">
                        <Button onClick={handleReturn} isLoading={isSubmitting} disabled={!selectedBookIdToReturn} variant="secondary">Return Book</Button>
                    </div>
                </div>
            </div>

            <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-slate-800 border-b pb-3 mb-4">My Loan History & Status</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50 hidden md:table-header-group">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Book Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Request Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Due Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                         <tbody className="bg-white divide-y divide-slate-200 md:divide-y-0">
                            {myLoans.map(loan => (
                                <tr key={loan.id} className="block md:table-row border-b md:border-none p-4 md:p-0">
                                    <td className="px-6 py-2 md:py-4 whitespace-nowrap text-sm font-medium text-slate-900 block md:table-cell"><span className="font-bold md:hidden">Book: </span>{loan.bookTitle}</td>
                                    <td className="px-6 py-2 md:py-4 whitespace-nowrap text-sm text-slate-500 block md:table-cell"><span className="font-bold md:hidden">Requested: </span>{formatDate(loan.requestDate)}</td>
                                    <td className="px-6 py-2 md:py-4 whitespace-nowrap text-sm text-slate-500 block md:table-cell"><span className="font-bold md:hidden">Status: </span>{statusPill(loan.status)}</td>
                                    <td className="px-6 py-2 md:py-4 whitespace-nowrap text-sm text-slate-500 block md:table-cell"><span className="font-bold md:hidden">Due: </span>{formatDate(loan.dueDate)}</td>
                                    <td className="px-6 py-2 md:py-4 whitespace-nowrap text-sm font-medium block md:table-cell">
                                        {loan.status === 'approved' && !loan.returnDate && (
                                             <Button variant="secondary" onClick={() => handleDownloadCard(loan)} className="text-xs px-2 py-1">Download Card</Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}


// --- ADMIN VIEW ---
const AdminLoanManagementPage = () => {
    const { addToast } = useToast();
    const { fetchPendingLoanCount } = useAuth();
    const [allLoans, setAllLoans] = useState<LoanWithDetails[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pending');
    
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [booksData, loansData, usersData] = await Promise.all([api.getBooks(), api.getLoans(), api.getUsers()]);
            const bookMap = new Map(booksData.map(book => [book.id, book.title]));
            const userMap = new Map(usersData.map(user => [user.id, { name: user.name, matric: user.matric_no }]));
            
            const detailedLoans = loansData.map(loan => ({
                ...loan,
                bookTitle: bookMap.get(loan.bookId) || 'Unknown Book',
                userName: userMap.get(loan.userId)?.name || 'Unknown User',
                userMatric: userMap.get(loan.userId)?.matric || 'N/A'
            }));
            setAllLoans(detailedLoans.sort((a,b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime()));
        } catch (error) {
            addToast('Failed to load loan management data', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [addToast]);
    
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleApprove = async (loanId: number) => {
        try {
            await api.approveLoan(loanId);
            addToast("Loan approved!", "success");
            await Promise.all([fetchData(), fetchPendingLoanCount()]);
        } catch (error) {
            addToast((error as Error).message, 'error');
        }
    };
    
    const handleReject = async (loanId: number) => {
         if (window.confirm('Are you sure you want to reject this loan request?')) {
            try {
                await api.rejectLoan(loanId);
                addToast("Loan rejected.", "success");
                await Promise.all([fetchData(), fetchPendingLoanCount()]);
            } catch (error) {
                addToast((error as Error).message, 'error');
            }
        }
    };

    const pendingLoans = useMemo(() => allLoans.filter(l => l.status === 'pending'), [allLoans]);
    const activeLoans = useMemo(() => allLoans.filter(l => l.status === 'approved' && !l.returnDate), [allLoans]);
    const loanHistory = useMemo(() => allLoans.filter(l => ['returned', 'rejected'].includes(l.status)), [allLoans]);
    const today = new Date();
    today.setHours(0,0,0,0);

    const tabButtonClasses = (tabName: string) => `px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === tabName ? 'bg-green-700 text-white' : 'text-slate-600 hover:bg-slate-200'}`;

    if(isLoading) return <Spinner/>

    const renderTable = (loans: LoanWithDetails[]) => (
         <div className="overflow-x-auto bg-white shadow-md rounded-lg">
            <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50 hidden md:table-header-group">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Student</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Book Title</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Request Date</th>
                        {activeTab !== 'pending' && <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Due/Action Date</th>}
                         {activeTab === 'pending' && <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200 md:divide-y-0">
                    {loans.map(loan => {
                        const isOverdue = loan.dueDate && new Date(loan.dueDate) < today;
                        return (
                            <tr key={loan.id} className={`block md:table-row border-b md:border-none p-4 md:p-0 ${isOverdue ? 'bg-red-50' : ''}`}>
                                <td className="px-6 py-2 md:py-4 whitespace-nowrap text-sm font-medium text-slate-900 block md:table-cell"><span className="font-bold md:hidden">Student: </span>{loan.userName} ({loan.userMatric})</td>
                                <td className="px-6 py-2 md:py-4 whitespace-nowrap text-sm text-slate-500 block md:table-cell"><span className="font-bold md:hidden">Book: </span>{loan.bookTitle}</td>
                                <td className="px-6 py-2 md:py-4 whitespace-nowrap text-sm text-slate-500 block md:table-cell"><span className="font-bold md:hidden">Requested: </span>{formatDate(loan.requestDate)}</td>
                                {activeTab !== 'pending' && <td className={`px-6 py-2 md:py-4 whitespace-nowrap text-sm block md:table-cell ${isOverdue ? 'font-bold text-red-600' : 'text-slate-500'}`}>{isOverdue ? `OVERDUE: ${formatDate(loan.dueDate)}` : (loan.status === 'returned' ? `Returned: ${formatDate(loan.returnDate)}` : `Due: ${formatDate(loan.dueDate)}`)}</td>}
                                {activeTab === 'pending' && (
                                    <td className="px-6 py-2 md:py-4 whitespace-nowrap text-right text-sm font-medium space-x-2 block md:table-cell">
                                        <Button variant="primary" onClick={() => handleApprove(loan.id)} className="text-xs px-2 py-1">Approve</Button>
                                        <Button variant="danger" onClick={() => handleReject(loan.id)} className="text-xs px-2 py-1">Reject</Button>
                                    </td>
                                )}
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    );
    
    const CurrentView = () => {
        switch(activeTab){
            case 'pending': return renderTable(pendingLoans);
            case 'active': return renderTable(activeLoans);
            case 'history': return renderTable(loanHistory);
            default: return null;
        }
    }

    return (
        <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h2 className="text-xl font-bold text-slate-800">Loan Management</h2>
                 <div className="flex flex-wrap space-x-2">
                    <button onClick={() => setActiveTab('pending')} className={tabButtonClasses('pending')}>Pending ({pendingLoans.length})</button>
                    <button onClick={() => setActiveTab('active')} className={tabButtonClasses('active')}>Active ({activeLoans.length})</button>
                    <button onClick={() => setActiveTab('history')} className={tabButtonClasses('history')}>History</button>
                </div>
            </div>
            <CurrentView/>
        </div>
    )
}


// --- MAIN PAGE COMPONENT ---
const BorrowReturnPage: React.FC = () => {
    const { user } = useAuth();
    if (!user) return <Spinner />;

    return user.role === 'admin' ? <AdminLoanManagementPage /> : <StudentBorrowReturnPage />;
};

export default BorrowReturnPage;
