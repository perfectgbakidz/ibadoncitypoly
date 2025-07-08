

import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import { DashboardStats } from '../types';
import StatCard from '../components/dashboard/StatCard';
import Spinner from '../components/common/Spinner';
import { useToast } from '../hooks/useToast';

// Icons for Stat Cards
const BookIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
const BorrowIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const OverdueIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197m0 0A5.975 5.975 0 0112 13a5.975 5.975 0 01-3 5.197M15 21a9 9 0 00-9-9" /></svg>;
const PendingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>;


const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({ totalBooks: 0, borrowedBooks: 0, overdueBooks: 0, totalStudents: 0, returnedBooks: 0, pendingLoans: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const statsData = await api.getDashboardStats();
        setStats(statsData);
      } catch (error) {
        addToast("Failed to fetch dashboard data", "error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [addToast]);

  const BookStatusChart = () => {
    const { totalBooks, borrowedBooks } = stats;
    const availableBooks = totalBooks - borrowedBooks;
    const borrowedPercentage = totalBooks > 0 ? (borrowedBooks / totalBooks) * 100 : 0;
    const availablePercentage = totalBooks > 0 ? (availableBooks / totalBooks) * 100 : 0;
    
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Library Book Status</h3>
            <div className="w-full bg-slate-200 rounded-full h-8 flex overflow-hidden">
                <div 
                    className="bg-amber-500 h-full flex items-center justify-center text-white text-sm font-bold" 
                    style={{ width: `${borrowedPercentage}%` }}
                    title={`On Loan: ${borrowedBooks}`}
                >
                    {borrowedPercentage > 10 && `${Math.round(borrowedPercentage)}%`}
                </div>
                <div 
                    className="bg-green-500 h-full flex items-center justify-center text-white text-sm font-bold" 
                    style={{ width: `${availablePercentage}%` }}
                    title={`Available: ${availableBooks}`}
                >
                     {availablePercentage > 10 && `${Math.round(availablePercentage)}%`}
                </div>
            </div>
            <div className="flex justify-between mt-2 text-sm text-slate-600">
                <span><span className="font-bold text-amber-500">{borrowedBooks}</span> On Loan</span>
                <span><span className="font-bold text-green-500">{availableBooks}</span> Available</span>
            </div>
        </div>
    )
  }

  if (isLoading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Total Books" value={stats.totalBooks} icon={<BookIcon />} color="bg-green-600" />
        <StatCard title="Books on Loan" value={stats.borrowedBooks} icon={<BorrowIcon />} color="bg-amber-500" />
        <StatCard title="Pending Loan Requests" value={stats.pendingLoans} icon={<PendingIcon />} color="bg-blue-500" />
        <StatCard title="Overdue Books" value={stats.overdueBooks} icon={<OverdueIcon />} color="bg-red-600" />
        <StatCard title="Total Students" value={stats.totalStudents} icon={<UsersIcon />} color="bg-green-500" />
      </div>

      <div className="grid grid-cols-1">
          <BookStatusChart />
      </div>
    </div>
  );
};

export default DashboardPage;