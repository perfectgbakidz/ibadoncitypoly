

import React, { createContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, AuthContextType, UserRegistration } from '../types';
import * as api from '../services/api';
import { useToast } from '../hooks/useToast';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// A simple JWT expiry checker without full decoding
const isTokenExpired = (token: string): boolean => {
    try {
        const expiry = (JSON.parse(atob(token.split('.')[1]))).exp;
        return (Math.floor((new Date).getTime() / 1000)) >= expiry;
    } catch (e) {
        return true;
    }
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [pendingLoanCount, setPendingLoanCount] = useState(0);
    const navigate = useNavigate();
    const { addToast } = useToast();

    const logout = useCallback(() => {
        setUser(null);
        setPendingLoanCount(0);
        localStorage.removeItem('token');
        navigate('/login');
    }, [navigate]);

    const fetchPendingLoanCount = useCallback(async () => {
        if (user?.role !== 'admin') {
            setPendingLoanCount(0);
            return;
        };
        try {
            const stats = await api.getDashboardStats();
            setPendingLoanCount(stats.pendingLoans);
        } catch (error) {
            console.error("Could not fetch pending loan count");
            setPendingLoanCount(0);
        }
    }, [user?.role]);


    const refreshUser = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (token && !isTokenExpired(token)) {
            try {
                const userDetails = await api.getMe();
                setUser(userDetails);
                if (userDetails.role === 'admin') {
                    await fetchPendingLoanCount();
                }
            } catch (error) {
                addToast('Could not refresh user data.', 'error');
                logout();
            }
        }
    }, [addToast, logout, fetchPendingLoanCount]);

    const handleAuthSuccess = useCallback(async (token: string, successMessage: string) => {
        localStorage.setItem('token', token);
        try {
            const userDetails = await api.getMe();
            setUser(userDetails);
            addToast(successMessage, 'success');
            if (userDetails.role === 'admin') {
                await fetchPendingLoanCount();
                navigate('/admin/dashboard');
            } else {
                navigate('/dashboard');
            }
        } catch (error) {
            addToast('Failed to fetch user details after authentication.', 'error');
            logout();
        }
    }, [addToast, navigate, logout, fetchPendingLoanCount]);


    useEffect(() => {
        const verifyUser = async () => {
            const token = localStorage.getItem('token');
            if (token && !isTokenExpired(token)) {
                try {
                    const userDetails = await api.getMe();
                    setUser(userDetails);
                    if(userDetails.role === 'admin') {
                        await fetchPendingLoanCount();
                    }
                } catch (error) {
                    logout();
                }
            } else if (token) {
                logout(); // Token is expired or invalid
            }
            setIsLoading(false);
        };
        verifyUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [logout]); // fetchPendingLoanCount should not be a dependency here


    const login = useCallback(async (matric_no: string, password: string) => {
        setIsLoading(true);
        try {
            const response = await api.loginUser(matric_no, password);
            await handleAuthSuccess(response.access_token, 'Login successful!');
        } catch (error) {
            addToast((error as Error).message, 'error');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [addToast, handleAuthSuccess]);
    
    const register = useCallback(async (userData: UserRegistration) => {
        setIsLoading(true);
        try {
            const response = await api.registerUser(userData);
            await handleAuthSuccess(response.access_token, 'Registration successful! Logging you in...');
        } catch (error) {
            addToast((error as Error).message, 'error');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [addToast, handleAuthSuccess]);


    return (
        <AuthContext.Provider value={{ user, login, register, logout, refreshUser, isLoading, pendingLoanCount, fetchPendingLoanCount }}>
            {!isLoading && children}
        </AuthContext.Provider>
    );
};