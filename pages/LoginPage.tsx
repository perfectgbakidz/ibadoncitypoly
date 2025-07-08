

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';
import AuthSlider from '../components/auth/AuthSlider';
import Spinner from '../components/common/Spinner';

const Logo = () => (
    <div className="flex flex-col items-center justify-center text-slate-800 mb-4">
        <img src="/logo.jpeg" alt="Ibadan City Polytechnic Logo" className="w-24" />
        <h1 className="text-xl font-bold text-green-800 mt-2">Ibadan City Polytechnic</h1>
    </div>
);

const LoginPage: React.FC = () => {
  const [matric_no, setMatricNo] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && user) {
        navigate(user.role === 'admin' ? '/admin/dashboard' : '/dashboard');
    }
  }, [user, isLoading, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(matric_no, password);
  };
  
  if (isLoading || (!isLoading && user)) {
      return <div className="flex h-screen items-center justify-center bg-slate-100"><Spinner /></div>;
  }

  return (
    <div className="min-h-screen flex bg-slate-100">
      <AuthSlider />
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8">
        <div className="max-w-md w-full bg-white shadow-xl rounded-lg p-6 md:p-8 space-y-6">
            <Logo />
            <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-800">Welcome Back</h2>
                <p className="text-slate-500">Sign in to access the Student Library Portal</p>
            </div>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <Input 
                label="Matric No." 
                id="matric_no" 
                type="text" 
                value={matric_no} 
                onChange={(e) => setMatricNo(e.target.value)} 
                placeholder="Enter your matriculation number"
                required 
              />
              <Input 
                label="Password" 
                id="password" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Enter your password"
                required 
              />
              <div className="text-right text-sm">
                  <Link to="/forgot-password" className="font-medium text-green-600 hover:text-green-500">
                      Forgot your password?
                  </Link>
              </div>
              <div>
                <Button type="submit" className="w-full" isLoading={isLoading}>
                  Sign In
                </Button>
              </div>
            </form>
            <div className="text-center text-sm space-y-2">
                <p className="text-slate-600">
                    Don't have an account?{' '}
                    <Link to="/register" className="font-medium text-green-600 hover:text-green-500">
                        Register here
                    </Link>
                </p>
                <p className="text-slate-600 text-xs">
                    Are you an administrator?{' '}
                    <Link to="/admin/login" className="font-medium text-green-600 hover:text-green-500">
                       Login here
                    </Link>
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;