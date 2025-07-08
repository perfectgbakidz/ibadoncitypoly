
import React from 'react';
import { Link } from 'react-router-dom';
import { User } from '../../types';
import Button from '../common/Button';

interface UserTableProps {
  users: User[];
  onDelete: (id: number) => void;
}

const UserTable: React.FC<UserTableProps> = ({ users, onDelete }) => {
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50 hidden md:table-header-group">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Matric No / Username</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Department</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200 md:divide-y-0">
          {users.map((user) => (
            <tr key={user.id} className="block md:table-row border-b md:border-none p-4 md:p-0">
              <td className="px-6 py-2 md:py-4 whitespace-nowrap text-sm font-medium text-slate-900 block md:table-cell">
                 <span className="font-bold md:hidden">Name: </span>
                 <Link to={`/users/${user.id}`} className="hover:text-green-700 hover:underline">{user.name}</Link>
              </td>
              <td className="px-6 py-2 md:py-4 whitespace-nowrap text-sm text-slate-500 block md:table-cell">
                <span className="font-bold md:hidden">Matric/ID: </span>{user.matric_no}
              </td>
              <td className="px-6 py-2 md:py-4 whitespace-nowrap text-sm text-slate-500 block md:table-cell">
                <span className="font-bold md:hidden">Department: </span>{user.department}
              </td>
              <td className="px-6 py-2 md:py-4 whitespace-nowrap text-sm text-slate-500 block md:table-cell">
                <span className="font-bold md:hidden">Role: </span>
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.role === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
                }`}>
                    {user.role}
                </span>
              </td>
              <td className="px-6 py-2 md:py-4 whitespace-nowrap text-right text-sm font-medium space-x-2 block md:table-cell">
                <Button variant="danger" onClick={() => onDelete(user.id)} className="text-xs px-2 py-1">Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
        </div>
    </div>
  );
};

export default UserTable;
