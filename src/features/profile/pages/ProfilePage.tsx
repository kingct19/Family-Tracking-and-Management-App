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
import { FiUser, FiCamera, FiSave, FiX } from 'react-icons/fi';
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
                <title>Profile - Family Safety App</title>
                <meta name="description" content="Edit your profile" />
            </Helmet>

            <div className="space-y-8">
                <div>
                    <h1 className="text-headline-lg md:text-display-sm font-normal text-on-surface mb-2">
                        Profile
                    </h1>
                    <p className="text-body-lg text-on-variant">
                        Manage your profile information
                    </p>
                </div>

                {/* Profile Photo Section */}
                <Card elevation={1}>
                    <CardHeader title="Profile Photo" />
                    <CardContent>
                        <div className="flex items-center gap-6">
                            <div className="relative">
                                {photoURL ? (
                                    <img
                                        src={photoURL}
                                        alt={displayName || 'Profile'}
                                        className="w-24 h-24 rounded-full object-cover border-2 border-outline-variant"
                                    />
                                ) : (
                                    <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center border-2 border-outline-variant">
                                        <span className="text-headline-md text-on-primary">
                                            {getInitials(displayName || displayProfile?.displayName || user?.email || 'U')}
                                        </span>
                                    </div>
                                )}
                                {isUploadingPhoto && (
                                    <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                                        <LoadingSpinner size="small" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <Button
                                    variant="outlined"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploadingPhoto}
                                    startIcon={<FiCamera />}
                                >
                                    {photoURL ? 'Change Photo' : 'Upload Photo'}
                                </Button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoSelect}
                                    className="hidden"
                                />
                                <p className="text-label-sm text-on-variant mt-2">
                                    JPG, PNG or GIF. Max size 5MB.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Profile Information */}
                <Card elevation={1}>
                    <CardHeader title="Profile Information" />
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
                                startAdornment={<FiUser />}
                            />

                            <TextField
                                label="Email"
                                value={user?.email || ''}
                                disabled
                                helperText="Email cannot be changed"
                            />

                            <TextField
                                label="Phone Number"
                                value={phone}
                                onChange={(e) => {
                                    setPhone(e.target.value);
                                }}
                                placeholder="+1 (555) 123-4567"
                                type="tel"
                            />

                            <div className="flex flex-col">
                                <label htmlFor="bio" className="text-label-md text-on-surface mb-2">
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
                                    className="w-full px-4 py-3 text-body-md text-on-surface bg-surface border-2 border-outline-variant rounded-xl transition-all duration-fast focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary placeholder:text-on-variant resize-none"
                                />
                            </div>
                        </div>
                    </CardContent>
                    <CardActions>
                        <div className="flex gap-3 w-full">
                            <Button
                                variant="filled"
                                onClick={handleSave}
                                disabled={!hasChanges || updateMutation.isPending}
                                startIcon={<FiSave />}
                                className="flex-1"
                            >
                                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={handleCancel}
                                disabled={!hasChanges || updateMutation.isPending}
                                startIcon={<FiX />}
                            >
                                Cancel
                            </Button>
                        </div>
                    </CardActions>
                </Card>

                {/* Stats Section */}
                <Card elevation={1}>
                    <CardHeader title="Statistics" />
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <p className="text-label-sm text-on-variant mb-1">Total XP</p>
                                <p className="text-headline-md text-on-surface font-semibold">
                                    {displayProfile.xpTotal || 0}
                                </p>
                            </div>
                            <div>
                                <p className="text-label-sm text-on-variant mb-1">Hubs</p>
                                <p className="text-headline-md text-on-surface font-semibold">
                                    {displayProfile.hubs?.length || 0}
                                </p>
                            </div>
                            <div>
                                <p className="text-label-sm text-on-variant mb-1">Member Since</p>
                                <p className="text-body-md text-on-surface">
                                    {new Date(displayProfile.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
};

export default ProfilePage;

