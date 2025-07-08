


import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import * as api from '../services/api';
import { useToast } from '../hooks/useToast';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

const ProfileSettingsPage: React.FC = () => {
    const { user, refreshUser } = useAuth();
    const { addToast } = useToast();

    const [profileData, setProfileData] = useState({ name: '', department: '' });
    const [email, setEmail] = useState('');
    const [passwordData, setPasswordData] = useState({ current_password: '', new_password: '' });
    const [confirmPassword, setConfirmPassword] = useState('');
    const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
    const [picturePreview, setPicturePreview] = useState<string | null>(null);
    
    const [isProfileSubmitting, setIsProfileSubmitting] = useState(false);
    const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);
    const [isPictureSubmitting, setIsPictureSubmitting] = useState(false);

    useEffect(() => {
        if (user) {
            setProfileData({ name: user.name, department: user.department || '' });
            setEmail(user.email);
            setPicturePreview(user.profilePictureUrl || null);
        }
    }, [user]);

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handlePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setProfilePictureFile(file);
            setPicturePreview(URL.createObjectURL(file));
        }
    };

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProfileSubmitting(true);
        try {
            // Only send name and department, as email is not updatable via this endpoint
            await api.updateProfile({ 
                name: profileData.name, 
                department: profileData.department 
            });
            await refreshUser();
            addToast('Profile updated successfully!', 'success');
        } catch (error) {
            addToast((error as Error).message, 'error');
        } finally {
            setIsProfileSubmitting(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.new_password !== confirmPassword) {
            addToast('New passwords do not match.', 'error');
            return;
        }
        setIsPasswordSubmitting(true);
        try {
            await api.changePassword(passwordData);
            addToast('Password changed successfully!', 'success');
            setPasswordData({ current_password: '', new_password: '' });
            setConfirmPassword('');
        } catch (error) {
            addToast((error as Error).message, 'error');
        } finally {
            setIsPasswordSubmitting(false);
        }
    };
    
    const handlePictureSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profilePictureFile) {
            addToast('Please select a picture to upload.', 'info');
            return;
        }
        setIsPictureSubmitting(true);
        const formData = new FormData();
        formData.append('file', profilePictureFile);
        try {
            await api.uploadProfilePicture(formData);
            await refreshUser();
            addToast('Profile picture updated!', 'success');
        } catch (error) {
            addToast((error as Error).message, 'error');
        } finally {
            setIsPictureSubmitting(false);
        }
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            {/* Profile Picture Section */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-slate-800 border-b pb-3 mb-4">Profile Picture</h2>
                <form onSubmit={handlePictureSubmit} className="flex items-center space-x-6">
                    <div className="shrink-0">
                         {picturePreview ? (
                            <img src={picturePreview} alt="Profile preview" className="w-20 h-20 rounded-full object-cover" />
                        ) : (
                            <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center text-slate-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            </div>
                        )}
                    </div>
                    <label className="block">
                        <span className="sr-only">Choose profile photo</span>
                        <input type="file" onChange={handlePictureChange} accept="image/*" className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"/>
                    </label>
                    <Button type="submit" isLoading={isPictureSubmitting} disabled={!profilePictureFile}>Upload</Button>
                </form>
            </div>

            {/* Profile Info Section */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-slate-800 border-b pb-3 mb-4">Personal Information</h2>
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                    <Input label="Name" id="name" name="name" value={profileData.name} onChange={handleProfileChange} required />
                    <Input 
                        label={user?.role === 'admin' ? "Username" : "Matric No."}
                        id="matric_no"
                        name="matric_no"
                        value={user?.matric_no || ''}
                        disabled
                    />
                     <Input 
                        label="Department" 
                        id="department" 
                        name="department" 
                        value={profileData.department} 
                        onChange={handleProfileChange} 
                        required 
                    />
                    <Input label="Email" id="email" name="email" type="email" value={email} disabled />
                    <div className="flex justify-end pt-2">
                        <Button type="submit" isLoading={isProfileSubmitting}>Save Changes</Button>
                    </div>
                </form>
            </div>

            {/* Change Password Section */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-slate-800 border-b pb-3 mb-4">Change Password</h2>
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <Input label="Current Password" id="current_password" name="current_password" type="password" value={passwordData.current_password} onChange={handlePasswordChange} required />
                    <Input label="New Password" id="new_password" name="new_password" type="password" value={passwordData.new_password} onChange={handlePasswordChange} required />
                    <Input label="Confirm New Password" id="confirm_password" name="confirm_password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                     <div className="flex justify-end pt-2">
                        <Button type="submit" variant="secondary" isLoading={isPasswordSubmitting}>Update Password</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfileSettingsPage;