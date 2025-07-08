
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../services/api';
import { LoanWithDetails, Book, Loan } from '../types';
import Spinner from '../components/common/Spinner';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../hooks/useAuth';

const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
};

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


const UserDashboardPage: React.FC = () => {
    const [allMyLoans, setAllMyLoans] = useState<LoanWithDetails[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [historySearchTerm, setHistorySearchTerm] = useState('');

    const { addToast } = useToast();
    const { user } = useAuth();

    const fetchMyLoans = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const [userLoans, allBooks] = await Promise.all([
                api.getLoans(),
                api.getBooks(),
            ]);

            const bookMap = new Map(allBooks.map((book: Book) => [book.id, book.title]));
            
            const detailedLoans = userLoans
                .filter(loan => loan.userId === user.id)
                .map((loan: Loan) => ({
                ...loan,
                bookTitle: bookMap.get(loan.bookId) || 'Unknown Book',
                userName: user.name,
                userMatric: user.matric_no,
            })).sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());
            
            setAllMyLoans(detailedLoans);

        } catch (error) {
            addToast("Failed to fetch your loan data", "error");
        } finally {
            setIsLoading(false);
        }
    }, [addToast, user]);

    useEffect(() => {
        if (user) {
            fetchMyLoans();
        }
    }, [fetchMyLoans, user]);
    
    const { activeLoans, pendingLoans, overdueLoans, dueSoonLoans, loanHistory } = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const endOfDueSoonPeriod = new Date();
        endOfDueSoonPeriod.setDate(today.getDate() + 3);

        const active = allMyLoans.filter(l => l.status === 'approved' && !l.returnDate);
        
        return {
            activeLoans: active,
            pendingLoans: allMyLoans.filter(l => l.status === 'pending'),
            overdueLoans: active.filter(l => l.dueDate && new Date(l.dueDate) < today),
            dueSoonLoans: active.filter(l => {
                if (!l.dueDate) return false;
                const dueDate = new Date(l.dueDate);
                return dueDate >= today && dueDate <= endOfDueSoonPeriod;
            }),
            loanHistory: allMyLoans.filter(l => ['returned', 'rejected'].includes(l.status)),
        }
    }, [allMyLoans]);

    const filteredLoanHistory = useMemo(() => {
         const lowercasedFilter = historySearchTerm.toLowerCase();
         return loanHistory.filter(loan => loan.bookTitle.toLowerCase().includes(lowercasedFilter))
    }, [historySearchTerm, loanHistory]);

    if (isLoading) return <Spinner />;

    return (
        <div className="space-y-6">
            {overdueLoans.length > 0 && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-md" role="alert">
                    <div className="flex">
                        <div className="py-1"><svg className="fill-current h-6 w-6 text-red-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zM11 14v-4a1 1 0 0 0-2 0v4a1 1 0 0 0 2 0zm0-6a1 1 0 1 0-2 0 1 1 0 0 0 2 0z"/></svg></div>
                        <div>
                            <p className="font-bold">Overdue Books Alert!</p>
                            <ul className="list-disc list-inside mt-1">
                                {overdueLoans.map(loan => <li key={loan.id}>{loan.bookTitle} (Due: {formatDate(loan.dueDate)})</li>)}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
            {dueSoonLoans.length > 0 && overdueLoans.length === 0 && (
                 <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-700 p-4 rounded-md shadow-md" role="alert">
                    <div className="flex">
                        <div className="py-1"><svg className="fill-current h-6 w-6 text-amber-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm-1-4v2h2v-2h-2zm0-8v5h2V6h-2z"/></svg></div>
                        <div>
                            <p className="font-bold">Due Soon Reminder</p>
                            <ul className="list-disc list-inside mt-1">
                                {dueSoonLoans.map(loan => <li key={loan.id}>{loan.bookTitle} is due on {formatDate(loan.dueDate)}.</li>)}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold text-slate-800 mb-4">My Active Loans ({activeLoans.length})</h2>
                    {activeLoans.length > 0 ? (
                        <ul className="space-y-2">
                           {activeLoans.map(loan => (
                               <li key={loan.id} className="flex justify-between items-center text-sm">
                                   <span>{loan.bookTitle}</span>
                                   <span className={`font-semibold ${overdueLoans.some(l => l.id === loan.id) ? 'text-red-600' : 'text-slate-500'}`}>Due: {formatDate(loan.dueDate)}</span>
                               </li>
                           ))}
                        </ul>
                    ) : (<p className="text-slate-500">You have not borrowed any books.</p>)}
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold text-slate-800 mb-4">My Pending Requests ({pendingLoans.length})</h2>
                     {pendingLoans.length > 0 ? (
                        <ul className="space-y-2">
                            {pendingLoans.map(loan => (
                                <li key={loan.id} className="flex justify-between items-center text-sm">
                                    <span>{loan.bookTitle}</span>
                                    <span className="text-slate-500">Requested: {formatDate(loan.requestDate)}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                       <>
                        <p className="text-slate-500 mb-4">You have no pending book loan requests.</p>
                        <Link to="/books" className="font-medium text-green-600 hover:text-green-500">
                            Browse and request a book &rarr;
                        </Link>
                       </>
                    )}
                </div>
            </div>

            <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-3 mb-4 gap-2">
                    <h2 className="text-xl font-semibold text-slate-800">My Loan History</h2>
                    <input
                        type="text"
                        placeholder="Search history..."
                        value={historySearchTerm}
                        onChange={(e) => setHistorySearchTerm(e.target.value)}
                        className="w-full md:w-1/3 px-3 py-1.5 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                    />
                </div>
                {filteredLoanHistory.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                             <thead className="bg-slate-50 hidden md:table-header-group">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Book Title</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                                </tr>
                            </thead>
                             <tbody className="bg-white divide-y divide-slate-200 md:divide-y-0">
                                {filteredLoanHistory.map(loan => (
                                    <tr key={loan.id} className="block md:table-row border-b md:border-none p-4 md:p-0">
                                        <td className="px-4 py-2 text-sm text-slate-900 block md:table-cell"><span className="font-bold md:hidden">Book: </span>{loan.bookTitle}</td>
                                        <td className="px-4 py-2 text-sm block md:table-cell"><span className="font-bold md:hidden">Status: </span>{statusPill(loan.status)}</td>
                                        <td className="px-4 py-2 text-sm text-slate-500 block md:table-cell"><span className="font-bold md:hidden">Date: </span>{formatDate(loan.status === 'returned' ? loan.returnDate : loan.requestDate)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ): (
                     <p className="text-slate-500 text-center py-4">No past loan records found.</p>
                )}
            </div>
        </div>
    );
};

export default UserDashboardPage;
