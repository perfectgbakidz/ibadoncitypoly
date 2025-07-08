
import React, { useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import * as api from '../services/api';
import { useToast } from '../hooks/useToast';
import UserTable from '../components/users/UserTable';
import Spinner from '../components/common/Spinner';

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { addToast } = useToast();

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (error) {
      addToast('Failed to fetch users', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    const filteredData = users.filter(item =>
        item.name.toLowerCase().includes(lowercasedFilter) ||
        item.matric_no.toLowerCase().includes(lowercasedFilter) ||
        item.department.toLowerCase().includes(lowercasedFilter)
    );
    setFilteredUsers(filteredData);
  }, [searchTerm, users]);


  const handleDeleteUser = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.deleteUser(id);
        addToast('User deleted successfully', 'success');
        await fetchUsers();
      } catch (error) {
        addToast('Failed to delete user', 'error');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
         <div className="w-full md:w-1/3">
           <input
             type="text"
             placeholder="Search by name, matric no, department..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
            />
        </div>
        {/* "Add User" and "Edit User" functionality is removed to align with new API */}
      </div>

      {isLoading ? (
        <Spinner />
      ) : (
        <UserTable users={filteredUsers} onDelete={handleDeleteUser} />
      )}
    </div>
  );
};

export default UsersPage;
