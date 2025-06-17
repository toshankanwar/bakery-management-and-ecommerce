// app/profile/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuthContext } from '@/contexts/AuthContext';
import { db, auth } from '@/firebase/config';
import { 
  doc, 
  getDoc, 
  updateDoc, 
  setDoc 
} from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { toast } from 'react-hot-toast';
import { 
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  PencilSquareIcon,
  CheckIcon,
  XMarkIcon,
  ArrowPathIcon,
  CameraIcon,
  BuildingOfficeIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

const indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 
  'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir',
  'Ladakh', 'Lakshadweep', 'Puducherry'
].sort();

const ProfilePage = () => {
  const { user } = useAuthContext();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: '',
    email: '',
    mobile: '',
    state: '',
    city: '',
    address: '',
    apartment: '',
    pincode: '',
    avatar: '',
    bio: ''
  });
  const [originalData, setOriginalData] = useState({});

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.exists() ? userDoc.data() : {};
        
        const profileInfo = {
          displayName: user.displayName || '',
          email: user.email || '',
          mobile: userData.mobile || '',
          state: userData.state || '',
          city: userData.city || '',
          address: userData.address || '',
          apartment: userData.apartment || '',
          pincode: userData.pincode || '',
          avatar: user.photoURL || '/default-avatar.png',
          bio: userData.bio || ''
        };

        setProfileData(profileInfo);
        setOriginalData(profileInfo);
      } catch (error) {
        console.error('Error fetching profile:', {
          error: error.message,
          timestamp: '2025-06-16 18:51:29',
          user: 'Kala-bot-apk'
        });
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCancel = () => {
    setProfileData(originalData);
    setEditMode(false);
  };

  const validateForm = () => {
    if (!profileData.displayName.trim()) {
      toast.error('Name is required');
      return false;
    }

    if (profileData.mobile && (profileData.mobile.length !== 10 || !/^\d+$/.test(profileData.mobile))) {
      toast.error('Please enter a valid 10-digit mobile number');
      return false;
    }

    if (profileData.pincode && (profileData.pincode.length !== 6 || !/^\d+$/.test(profileData.pincode))) {
      toast.error('Please enter a valid 6-digit PIN code');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSaving(true);
    try {
      // Update auth profile
      if (user.displayName !== profileData.displayName) {
        await updateProfile(auth.currentUser, {
          displayName: profileData.displayName
        });
      }

      // Update firestore profile
      await setDoc(doc(db, 'users', user.uid), {
        mobile: profileData.mobile,
        state: profileData.state,
        city: profileData.city,
        address: profileData.address,
        apartment: profileData.apartment,
        pincode: profileData.pincode,
        bio: profileData.bio,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      setOriginalData(profileData);
      setEditMode(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', {
        error: error.message,
        timestamp: '2025-06-16 18:51:29',
        user: 'Kala-bot-apk'
      });
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm overflow-hidden"
        >
          {/* Profile Header */}
          <div className="relative h-48 bg-gradient-to-r from-green-400 to-blue-500">
            <div className="absolute -bottom-12 left-6 flex items-end space-x-6">
              <div className="relative">
                <div className="h-24 w-24 rounded-full border-4 border-white overflow-hidden bg-white">
                  <Image
                    src={profileData.avatar}
                    alt={profileData.displayName}
                    fill
                    className="object-cover"
                  />
                </div>
                <button className="absolute bottom-0 right-0 p-1 bg-white rounded-full shadow-md text-gray-600 hover:text-gray-900">
                  <CameraIcon className="h-4 w-4" />
                </button>
              </div>
              <div className="pb-4">
                <h1 className="text-2xl font-bold text-white">
                  {profileData.displayName || 'Your Name'}
                </h1>
                <p className="text-green-50">{profileData.email}</p>
              </div>
            </div>
            
            <div className="absolute top-4 right-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setEditMode(!editMode)}
                className="px-4 py-2 bg-white bg-opacity-90 rounded-full shadow-md text-gray-700 hover:text-gray-900 flex items-center space-x-2"
              >
                <PencilSquareIcon className="h-4 w-4" />
                <span>{editMode ? 'Cancel Edit' : 'Edit Profile'}</span>
              </motion.button>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-6 pt-16">
            <form onSubmit={handleSubmit} className="space-y-6">
              <AnimatePresence mode="wait">
                {editMode ? (
                  <motion.div
                    key="edit-form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          name="displayName"
                          value={profileData.displayName}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-gray-900"
                          placeholder="Your full name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Mobile Number
                        </label>
                        <input
                          type="tel"
                          name="mobile"
                          value={profileData.mobile}
                          onChange={handleInputChange}
                          maxLength={10}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-gray-900"
                          placeholder="10-digit mobile number"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          State
                        </label>
                        <select
                          name="state"
                          value={profileData.state}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-gray-900"
                        >
                          <option value="">Select your state</option>
                          {indianStates.map(state => (
                            <option key={state} value={state}>{state}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={profileData.city}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-gray-900"
                          placeholder="Your city"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Street Address
                        </label>
                        <input
                          type="text"
                          name="address"
                          value={profileData.address}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-gray-900"
                          placeholder="Street address"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Apartment, Suite, etc.
                        </label>
                        <input
                          type="text"
                          name="apartment"
                          value={profileData.apartment}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-gray-900"
                          placeholder="Apartment, suite, etc."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          PIN Code
                        </label>
                        <input
                          type="text"
                          name="pincode"
                          value={profileData.pincode}
                          onChange={handleInputChange}
                          maxLength={6}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-gray-900"
                          placeholder="6-digit PIN code"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Bio
                        </label>
                        <textarea
                          name="bio"
                          value={profileData.bio}
                          onChange={handleInputChange}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-gray-900"
                          placeholder="Tell us about yourself"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end space-x-4 pt-4">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleCancel}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={saving}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        {saving ? (
                          <span className="flex items-center">
                            <ArrowPathIcon className="h-4 w-4 animate-spin mr-2" />
                            Saving...
                          </span>
                        ) : (
                          'Save Changes'
                        )}
                      </motion.button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="view-profile"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    {profileData.bio && (
                      <div className="text-gray-600 italic border-l-4 border-green-200 pl-4">
                        {profileData.bio}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <UserIcon className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Full Name</p>
                            <p className="font-medium">{profileData.displayName}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="font-medium">{profileData.email}</p>
                          </div>
                        </div>

                        {profileData.mobile && (
                          <div className="flex items-center space-x-3">
                            <PhoneIcon className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-500">Mobile</p>
                              <p className="font-medium">{profileData.mobile}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        {(profileData.state || profileData.city) && (
                          <div className="flex items-center space-x-3">
                            <GlobeAltIcon className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-500">Location</p>
                              <p className="font-medium">
                                {[profileData.city, profileData.state]
                                  .filter(Boolean)
                                  .join(', ')}
                              </p>
                            </div>
                          </div>
                        )}

                        {profileData.address && (
                          <div className="flex items-start space-x-3">
                            <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-sm text-gray-500">Address</p>
                              <p className="font-medium">
                                {profileData.address}
                                {profileData.apartment && (
                                  <>, {profileData.apartment}</>
                                )}
                              </p>
                              {profileData.pincode && (
                                <p className="text-sm text-gray-500">
                                  PIN: {profileData.pincode}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;