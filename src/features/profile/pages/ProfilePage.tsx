/**
 * ProfilePage Component
 * 
 * User profile editing page
 * - Edit display name
 * - Upload profile photo
 * - Add bio, phone number
 * - View XP and stats
 */

import { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardHeader, CardContent, CardActions } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useUserProfile } from '@/features/auth/hooks/useAuth';
import { updateUserProfile } from '@/features/auth/api/auth-api';
import { uploadFile } from '@/lib/services/storage-service';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import {
    MdPerson,
    MdCameraAlt,
    MdSave,
    MdClose,
    MdEmail,
    MdPhone,
    MdEdit,
    MdStar,
    MdPeople,
    MdCalendarToday,
    MdCheckCircle,
} from 'react-icons/md';
import toast from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const ProfilePage = () => {
    const { user } = useAuth();
    const { data: profile, isLoading } = useUserProfile(user?.id);
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [displayName, setDisplayName] = useState('');
    const [phone, setPhone] = useState('');
    const [bio, setBio] = useState('');
    const [photoURL, setPhotoURL] = useState<string | undefined>(undefined);
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    // If profile doesn't exist, use user data from auth as fallback
    const displayProfile = profile || (user ? {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        xpTotal: user.xpTotal || 0,
        hubs: [], // Hubs are fetched separately, not part of AuthUser
        createdAt: new Date(),
        updatedAt: new Date(),
    } : null);

    // Initialize form when profile loads
    useEffect(() => {
        if (displayProfile) {
            setDisplayName(displayProfile.displayName || '');
            setPhone((displayProfile as any).phone || '');
            setBio((displayProfile as any).bio || '');
            setPhotoURL(displayProfile.photoURL);
        }
    }, [displayProfile]);

    // Track changes
    useEffect(() => {
        if (!displayProfile) return;
        const changed = 
            displayName !== (displayProfile.displayName || '') ||
            phone !== ((displayProfile as any).phone || '') ||
            bio !== ((displayProfile as any).bio || '') ||
            photoURL !== displayProfile.photoURL;
        setHasChanges(changed);
    }, [displayName, phone, bio, photoURL, displayProfile]);

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: async (updates: Partial<any>) => {
            if (!user) throw new Error('User not authenticated');
            const response = await updateUserProfile(user.id, updates);
            if (!response.success) throw new Error(response.error || 'Failed to update profile');
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user', 'profile', user?.id] });
            queryClient.invalidateQueries({ queryKey: ['user'] });
            toast.success('Profile updated successfully');
            setHasChanges(false);
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to update profile');
        },
    });

    const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be less than 5MB');
            return;
        }

        setIsUploadingPhoto(true);
        try {
            const path = `profiles/${user?.id}/${Date.now()}_${file.name}`;
            const url = await uploadFile(file, path);
            
            // Update local state immediately
            setPhotoURL(url);
            
            // Auto-save photo URL to profile immediately
            if (user) {
                const response = await updateUserProfile(user.id, { photoURL: url });
                if (response.success) {
                    // Invalidate queries to refresh profile data
                    queryClient.invalidateQueries({ queryKey: ['user', 'profile', user.id] });
                    queryClient.invalidateQueries({ queryKey: ['user'] });
                    toast.success('Photo uploaded and saved successfully');
                } else {
                    toast.error('Photo uploaded but failed to save');
                }
            }
        } catch (error) {
            toast.error('Failed to upload photo');
            console.error('Photo upload error:', error);
        } finally {
            setIsUploadingPhoto(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleSave = async () => {
        if (!user) return;

        const updates: any = {
            displayName: displayName.trim(),
        };

        if (phone.trim()) {
            updates.phone = phone.trim();
        }

        if (bio.trim()) {
            updates.bio = bio.trim();
        }

        // Only include photoURL if it's different from the current profile photo
        // (photo is auto-saved on upload, so we don't need to save it again)
        if (photoURL && photoURL !== displayProfile?.photoURL) {
            updates.photoURL = photoURL;
        }

        updateMutation.mutate(updates);
    };

    const handleCancel = () => {
        if (displayProfile) {
            setDisplayName(displayProfile.displayName || '');
            setPhone((displayProfile as any).phone || '');
            setBio((displayProfile as any).bio || '');
            setPhotoURL(displayProfile.photoURL);
            setHasChanges(false);
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="large" text="Loading profile..." />
            </div>
        );
    }

    if (!displayProfile || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-body-lg text-on-variant">Please log in to view your profile</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>Profile - HaloHub</title>
                <meta name="description" content="Edit your profile" />
            </Helmet>

            <div className="space-y-4 sm:space-y-6">
                {/* Hero Section with Profile Photo */}
                <div className="relative">
                    {/* Gradient Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-light to-secondary rounded-card -z-10 opacity-10"></div>
                    
                    <div className="card p-5 sm:p-6">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                            {/* Large Profile Photo */}
                            <div className="relative flex-shrink-0">
                                <div className="relative">
                                    {photoURL ? (
                                        <img
                                            src={photoURL}
                                            alt={displayName || 'Profile'}
                                            className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover border-2 border-surface shadow-halo-button"
                                        />
                                    ) : (
                                        <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center border-2 border-surface shadow-halo-button">
                                            <span className="text-title-lg sm:text-headline-sm text-white font-semibold">
                                                {getInitials(displayName || displayProfile?.displayName || user?.email || 'U')}
                                            </span>
                                        </div>
                                    )}
                                    {isUploadingPhoto && (
                                        <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center backdrop-blur-sm">
                                            <LoadingSpinner size="small" />
                                        </div>
                                    )}
                                    {/* Camera Button Overlay */}
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploadingPhoto}
                                        className="absolute bottom-0 right-0 p-2.5 bg-primary hover:bg-primary/90 text-white rounded-full shadow-halo-button transition-all duration-200 hover:scale-110 active:scale-95 touch-target"
                                        aria-label="Change profile photo"
                                    >
                                        <MdCameraAlt size={18} />
                                    </button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePhotoSelect}
                                        className="hidden"
                                    />
                                </div>
                            </div>

                            {/* Profile Info */}
                            <div className="flex-1 text-center sm:text-left w-full">
                                <h1 className="text-title-lg sm:text-headline-sm font-semibold text-on-surface mb-2">
                                    {displayName || displayProfile?.displayName || user?.email || 'User'}
                                </h1>
                                {bio && (
                                    <p className="text-body-md text-on-variant mb-4 max-w-2xl">
                                        {bio}
                                    </p>
                                )}
                                {!bio && (
                                    <p className="text-body-sm text-on-variant mb-4 italic">
                                        No bio yet. Add one to tell others about yourself!
                                    </p>
                                )}
                                
                                {/* Quick Stats */}
                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-4">
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-container rounded-full">
                                        <MdStar size={16} className="text-primary" />
                                        <span className="text-label-md font-semibold text-primary">
                                            {displayProfile.xpTotal || 0} XP
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary-container rounded-full">
                                        <MdPeople size={16} className="text-secondary" />
                                        <span className="text-label-md font-semibold text-secondary">
                                            {displayProfile.hubs?.length || 0} Hubs
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-variant rounded-full">
                                        <MdCalendarToday size={16} className="text-on-variant" />
                                        <span className="text-label-sm font-medium text-on-variant">
                                            Joined {new Date(displayProfile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Profile Information Card */}
                <Card elevation={1}>
                    <CardHeader 
                        title="Profile Information" 
                        action={
                            <div className="flex items-center gap-2">
                                <MdEdit size={20} className="text-on-variant" />
                            </div>
                        }
                    />
                    <CardContent>
                        <div className="space-y-6">
                            <TextField
                                label="Display Name"
                                value={displayName}
                                onChange={(e) => {
                                    setDisplayName(e.target.value);
                                }}
                                placeholder="Enter your display name"
                                required
                                startAdornment={<MdPerson size={20} />}
                            />

                            <TextField
                                label="Email"
                                value={user?.email || ''}
                                disabled
                                helperText="Email cannot be changed"
                                startAdornment={<MdEmail size={20} />}
                            />

                            <TextField
                                label="Phone Number"
                                value={phone}
                                onChange={(e) => {
                                    setPhone(e.target.value);
                                }}
                                placeholder="+1 (555) 123-4567"
                                type="tel"
                                startAdornment={<MdPhone size={20} />}
                            />

                            <div className="flex flex-col">
                                <label htmlFor="bio" className="text-label-md text-on-surface mb-2 flex items-center gap-2">
                                    <MdPerson size={18} />
                                    Bio
                                </label>
                                <textarea
                                    id="bio"
                                    value={bio}
                                    onChange={(e) => {
                                        setBio(e.target.value);
                                    }}
                                    placeholder="Tell us about yourself..."
                                    rows={4}
                                    className="w-full px-4 py-3 text-body-md text-on-surface bg-surface border-2 border-outline-variant rounded-input transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary placeholder:text-on-variant resize-none"
                                />
                                <p className="text-label-sm text-on-variant mt-2">
                                    Share a bit about yourself with your family members
                                </p>
                            </div>
                        </div>
                    </CardContent>
                    <CardActions>
                        <div className="flex gap-3 w-full">
                            <Button
                                variant="filled"
                                onClick={handleSave}
                                disabled={!hasChanges || updateMutation.isPending}
                                startIcon={updateMutation.isPending ? undefined : <MdCheckCircle size={20} />}
                                className="flex-1"
                                loading={updateMutation.isPending}
                            >
                                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={handleCancel}
                                disabled={!hasChanges || updateMutation.isPending}
                                startIcon={<MdClose size={20} />}
                            >
                                Cancel
                            </Button>
                        </div>
                    </CardActions>
                </Card>

                {/* Detailed Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                    {/* XP Card */}
                    <Card elevation={1} className="bg-gradient-to-br from-primary-container to-primary-container/50">
                        <CardContent className="p-5">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2.5 bg-primary rounded-full">
                                    <MdStar size={20} className="text-white" />
                                </div>
                                <div>
                                    <p className="text-label-sm text-on-variant mb-0.5">Total XP</p>
                                    <p className="text-title-md text-primary font-semibold">
                                        {displayProfile.xpTotal || 0}
                                    </p>
                                </div>
                            </div>
                            <p className="text-body-sm text-on-variant">
                                Earned through completing tasks
                            </p>
                        </CardContent>
                    </Card>

                    {/* Hubs Card */}
                    <Card elevation={1} className="bg-gradient-to-br from-secondary-container to-secondary-container/50">
                        <CardContent className="p-5">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2.5 bg-secondary rounded-full">
                                    <MdPeople size={20} className="text-white" />
                                </div>
                                <div>
                                    <p className="text-label-sm text-on-variant mb-0.5">Hubs</p>
                                    <p className="text-title-md text-secondary font-semibold">
                                        {displayProfile.hubs?.length || 0}
                                    </p>
                                </div>
                            </div>
                            <p className="text-body-sm text-on-variant">
                                Family groups you're part of
                            </p>
                        </CardContent>
                    </Card>

                    {/* Member Since Card */}
                    <Card elevation={1}>
                        <CardContent className="p-5">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2.5 bg-primary rounded-full">
                                    <MdCalendarToday size={20} className="text-white" />
                                </div>
                                <div>
                                    <p className="text-label-sm text-on-variant mb-0.5">Member Since</p>
                                    <p className="text-title-sm text-on-surface font-semibold">
                                        {new Date(displayProfile.createdAt).toLocaleDateString('en-US', { 
                                            month: 'short', 
                                            year: 'numeric' 
                                        })}
                                    </p>
                                </div>
                            </div>
                            <p className="text-body-sm text-on-variant">
                                {Math.floor((Date.now() - new Date(displayProfile.createdAt).getTime()) / (1000 * 60 * 60 * 24))} days ago
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
};

export default ProfilePage;

