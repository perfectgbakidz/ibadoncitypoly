

import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import AuthSlider from '../components/auth/AuthSlider';
import * as api from '../services/api';
import { useToast } from '../hooks/useToast';

const Logo = () => (
    <div className="flex flex-col items-center justify-center text-slate-800 mb-4">
        <img src="/logo.jpeg" alt="Ibadan City Polytechnic Logo" className="w-24" />
        <h1 className="text-xl font-bold text-green-800 mt-2">Ibadan City Polytechnic Library</h1>
    </div>
);

const ResetPasswordPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      addToast('Passwords do not match.', 'error');
      return;
    }
    if (!token) {
      addToast('Invalid or missing reset token. Please request a new link.', 'error');
      return;
    }
    if(password.length < 6){
        addToast('Password must be at least 6 characters long.', 'error');
        return;
    }

    setIsLoading(true);
    try {
      await api.resetPassword(token, password);
      addToast('Password has been reset successfully!', 'success');
      navigate('/login');
    } catch (error) {
      addToast((error as Error).message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-100">
      <AuthSlider />
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-white shadow-xl rounded-lg p-8 space-y-6">
          <Logo />
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-800">Reset Your Password</h2>
            <p className="text-slate-500">Enter a new, secure password for your account.</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="New Password"
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your new password"
              required
            />
            <Input
              label="Confirm New Password"
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your new password"
              required
            />
            <div>
              <Button type="submit" className="w-full" isLoading={isLoading}>
                Reset Password
              </Button>
            </div>
          </form>
          <div className="text-center text-sm">
            <p className="text-slate-600">
                <Link to="/login" className="font-medium text-green-600 hover:text-green-500">
                    Back to Sign in
                </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
