// components/auth/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import Button from '../common/Button';

const ProfilePage = () => {
    const { user, getProfile, updateProfile } = useAuth();
    const [profileData, setProfileData] = useState({
        name: '',
        institutionName: '',
        profile: {
            bio: '',
            website: '',
            contactEmail: '',
            phone: '',
            address: ''
        }
    });
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await getProfile();
                if (response.success) {
                    // Handle the case where profile might not exist
                    setProfileData({
                        name: response.user.name || '',
                        institutionName: response.user.institutionName || '',
                        profile: {
                            bio: response.user.profile?.bio || '',
                            website: response.user.profile?.website || '',
                            contactEmail: response.user.profile?.contactEmail || response.user.email || '',
                            phone: response.user.profile?.phone || '',
                            address: response.user.profile?.address || ''
                        }
                    });
                }
            } catch (error) {
                // Fallback to user data from context if API fails
                if (user) {
                    setProfileData({
                        name: user.name || '',
                        institutionName: user.institutionName || '',
                        profile: {
                            bio: user.profile?.bio || '',
                            website: user.profile?.website || '',
                            contactEmail: user.profile?.contactEmail || user.email || '',
                            phone: user.profile?.phone || '',
                            address: user.profile?.address || ''
                        }
                    });
                }
                toast.error('Failed to fetch profile');
            } finally {
                setFetching(false);
            }
        };

        fetchProfile();
    }, [getProfile, user]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name.startsWith('profile.')) {
            const profileField = name.split('.')[1];
            setProfileData({
                ...profileData,
                profile: {
                    ...profileData.profile,
                    [profileField]: value
                }
            });
        } else {
            setProfileData({
                ...profileData,
                [name]: value
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await updateProfile(profileData);

            if (response.success) {
                toast.success('Profile updated successfully!');
            } else {
                toast.error(response.error || 'Failed to update profile');
            }
        } catch (error) {
            toast.error(error.error || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0D0D0D] via-[#1A1A1A] to-[#121212]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#296CFF] mx-auto"></div>
                    <p className="mt-4 text-[#E0E0E0]">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0D0D0D] via-[#1A1A1A] to-[#121212] py-12 px-4">
            <div className="max-w-3xl mx-auto">
                <div className="bg-[#1A1A1A] rounded-2xl border border-[#2A2A2A] shadow-2xl overflow-hidden">
                    <div className="px-6 py-8 sm:px-10">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-[#E0E0E0]">Institute Profile</h2>
                            <p className="mt-2 text-[#A0A0A0]">Manage your institution's information</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-[#E0E0E0] mb-2">
                                        Full Name
                                    </label>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        value={profileData.name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-[#E0E0E0] placeholder-[#7A7A7A] focus:outline-none focus:ring-2 focus:ring-[#296CFF] focus:border-transparent transition-all"
                                        placeholder="John Doe"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="institutionName" className="block text-sm font-medium text-[#E0E0E0] mb-2">
                                        Institution Name
                                    </label>
                                    <input
                                        id="institutionName"
                                        name="institutionName"
                                        type="text"
                                        value={profileData.institutionName}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-[#E0E0E0] placeholder-[#7A7A7A] focus:outline-none focus:ring-2 focus:ring-[#296CFF] focus:border-transparent transition-all"
                                        placeholder="Your University"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="bio" className="block text-sm font-medium text-[#E0E0E0] mb-2">
                                    Bio
                                </label>
                                <textarea
                                    id="bio"
                                    name="profile.bio"
                                    rows="3"
                                    value={profileData.profile.bio}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-[#E0E0E0] placeholder-[#7A7A7A] focus:outline-none focus:ring-2 focus:ring-[#296CFF] focus:border-transparent transition-all"
                                    placeholder="Tell us about your institution..."
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="website" className="block text-sm font-medium text-[#E0E0E0] mb-2">
                                        Website
                                    </label>
                                    <input
                                        id="website"
                                        name="profile.website"
                                        type="url"
                                        value={profileData.profile.website}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-[#E0E0E0] placeholder-[#7A7A7A] focus:outline-none focus:ring-2 focus:ring-[#296CFF] focus:border-transparent transition-all"
                                        placeholder="https://your-institution.edu"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="contactEmail" className="block text-sm font-medium text-[#E0E0E0] mb-2">
                                        Contact Email
                                    </label>
                                    <input
                                        id="contactEmail"
                                        name="profile.contactEmail"
                                        type="email"
                                        value={profileData.profile.contactEmail}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-[#E0E0E0] placeholder-[#7A7A7A] focus:outline-none focus:ring-2 focus:ring-[#296CFF] focus:border-transparent transition-all"
                                        placeholder="contact@institution.edu"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-[#E0E0E0] mb-2">
                                        Phone Number
                                    </label>
                                    <input
                                        id="phone"
                                        name="profile.phone"
                                        type="tel"
                                        value={profileData.profile.phone}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-[#E0E0E0] placeholder-[#7A7A7A] focus:outline-none focus:ring-2 focus:ring-[#296CFF] focus:border-transparent transition-all"
                                        placeholder="+1 (555) 123-4567"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="address" className="block text-sm font-medium text-[#E0E0E0] mb-2">
                                        Address
                                    </label>
                                    <input
                                        id="address"
                                        name="profile.address"
                                        type="text"
                                        value={profileData.profile.address}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-[#E0E0E0] placeholder-[#7A7A7A] focus:outline-none focus:ring-2 focus:ring-[#296CFF] focus:border-transparent transition-all"
                                        placeholder="123 Institution St, City, Country"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-6">
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="px-8 py-3"
                                >
                                    {loading ? (
                                        <span className="flex items-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Saving...
                                        </span>
                                    ) : (
                                        'Save Changes'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;