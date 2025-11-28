/**
 * RewardModal - Create/Edit reward modal for admins
 */

import { useState, useEffect, useRef } from 'react';
import { 
    MdClose, 
    MdStar, 
    MdTaskAlt, 
    MdLocalFireDepartment,
    MdSave,
    MdAdd,
    MdImage,
    MdDelete,
    MdCloudUpload,
} from 'react-icons/md';
import type { Reward, RewardType } from '@/types';
import { uploadRewardImage } from '@/lib/services/storage-service';
import { useHubStore } from '@/lib/store/hub-store';
import { useAuth } from '@/features/auth/hooks/useAuth';
import toast from 'react-hot-toast';

interface RewardModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: {
        title: string;
        description: string;
        icon: string;
        imageURL?: string | null;
        type: RewardType;
        threshold: number;
    }, imageFile?: File | null) => void;
    reward?: Reward | null;
    isLoading?: boolean;
}

// Common emoji options for rewards
const EMOJI_OPTIONS = [
    '🏆', '🎖️', '🥇', '🥈', '🥉', '⭐', '🌟', '✨', 
    '💎', '👑', '🎯', '🚀', '💪', '🔥', '⚡', '🎉',
    '🎁', '💰', '🎮', '📚', '🎨', '🏅', '🎤', '🎸',
    '🎭', '🎪', '🎬', '🎧', '🎹', '🎺', '🎻', '🥁',
];

export const RewardModal = ({
    isOpen,
    onClose,
    onSubmit,
    reward,
    isLoading = false,
}: RewardModalProps) => {
    const { currentHub } = useHubStore();
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [icon, setIcon] = useState('🏆');
    const [imageURL, setImageURL] = useState<string | undefined>(undefined);
    const [type, setType] = useState<RewardType>('xp');
    const [threshold, setThreshold] = useState<number>(100);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load reward data when editing
    useEffect(() => {
        if (reward) {
            setTitle(reward.title);
            setDescription(reward.description);
            setIcon(reward.icon);
            setImageURL(reward.imageURL);
            setImagePreview(reward.imageURL || null);
            setType(reward.type);
            setThreshold(reward.threshold);
        } else {
            // Reset for new reward
            setTitle('');
            setDescription('');
            setIcon('🏆');
            setImageURL(undefined);
            setImagePreview(null);
            setSelectedFile(null);
            setType('xp');
            setThreshold(100);
        }
    }, [reward, isOpen]);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be less than 5MB');
            return;
        }

        // Store file for upload
        setSelectedFile(file);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        // If editing existing reward, upload immediately
        if (reward?.id && currentHub) {
            handleImageUpload(file);
        }
    };

    const handleImageUpload = async (file?: File) => {
        const fileToUpload = file || selectedFile;
        if (!fileToUpload || !currentHub || !user || !reward?.id) {
            return;
        }

        setIsUploading(true);
        try {
            const uploadedURL = await uploadRewardImage(fileToUpload, currentHub.id, reward.id);
            setImageURL(uploadedURL);
            setSelectedFile(null); // Clear file after successful upload
            toast.success('Image uploaded successfully');
        } catch (error: any) {
            console.error('Image upload error:', error);
            toast.error(error.message || 'Failed to upload image');
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemoveImage = () => {
        setImageURL(undefined);
        setImagePreview(null);
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        // Determine final imageURL value:
        // - If there's a preview/file selected: use existing imageURL or will upload after
        // - If image was removed (had URL before, now removed): pass null to clear it
        const hadImageBefore = reward?.imageURL;
        const hasImageNow = imagePreview || imageURL;
        const imageWasRemoved = hadImageBefore && !hasImageNow && !selectedFile;

        onSubmit({
            title: title.trim(),
            description: description.trim(),
            icon,
            imageURL: imageWasRemoved ? null : (imageURL || undefined),
            type,
            threshold,
        }, selectedFile); // Pass file for upload after creation
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/50 bg-gradient-to-r from-amber-50 to-orange-50">
                    <h2 className="text-headline-sm font-bold text-on-surface">
                        {reward ? 'Edit Reward' : 'Create Reward'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-surface-variant text-on-variant transition-colors"
                    >
                        <MdClose size={24} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Icon/Image + Title row */}
                    <div className="flex gap-4">
                        {/* Icon/Image picker */}
                        <div className="relative flex-shrink-0">
                            {imagePreview || imageURL ? (
                                <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-amber-200">
                                    <img 
                                        src={imagePreview || imageURL} 
                                        alt="Reward preview" 
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleRemoveImage}
                                        className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-bl-lg hover:bg-red-600 transition-colors"
                                        aria-label="Remove image"
                                    >
                                        <MdDelete size={14} />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                        className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 border-2 border-amber-200 flex items-center justify-center text-3xl hover:border-amber-400 transition-colors"
                                    >
                                        {icon}
                                    </button>
                                    
                                    {/* Emoji picker dropdown */}
                                    {showEmojiPicker && (
                                        <div className="absolute top-full left-0 mt-2 p-3 bg-white rounded-xl shadow-xl border border-outline-variant z-10 grid grid-cols-8 gap-1 w-72">
                                            {EMOJI_OPTIONS.map((emoji) => (
                                                <button
                                                    key={emoji}
                                                    type="button"
                                                    onClick={() => {
                                                        setIcon(emoji);
                                                        setShowEmojiPicker(false);
                                                    }}
                                                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xl hover:bg-surface-variant transition-colors ${
                                                        icon === emoji ? 'bg-primary/10 ring-2 ring-primary' : ''
                                                    }`}
                                                >
                                                    {emoji}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Title */}
                        <div className="flex-1">
                            <label className="block text-label-md font-medium text-on-surface mb-1.5">
                                Reward Title *
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g., Task Master"
                                className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-white text-on-surface placeholder:text-on-variant/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                required
                            />
                        </div>
                    </div>

                    {/* Image Upload Section */}
                    <div>
                        <label className="block text-label-md font-medium text-on-surface mb-1.5">
                            Reward Image (Optional)
                        </label>
                        <div className="space-y-2">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageSelect}
                                className="hidden"
                            />
                            {!imagePreview && !imageURL && (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-dashed border-outline-variant hover:border-primary/50 bg-surface-variant/30 hover:bg-surface-variant transition-colors flex items-center justify-center gap-2 text-on-variant"
                                >
                                    <MdCloudUpload size={20} />
                                    <span className="font-medium">Upload Image</span>
                                </button>
                            )}
                            {imagePreview && (
                                <div className="relative">
                                    <div className="relative w-full h-32 rounded-xl overflow-hidden border-2 border-outline-variant">
                                        <img 
                                            src={imagePreview} 
                                            alt="Reward preview" 
                                            className="w-full h-full object-cover"
                                        />
                                        {reward && !imageURL && (
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                <button
                                                    type="button"
                                                    onClick={() => selectedFile && handleImageUpload(selectedFile)}
                                                    disabled={isUploading || !selectedFile}
                                                    className="px-4 py-2 rounded-lg bg-primary text-on-primary font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                                >
                                                    {isUploading ? (
                                                        <>
                                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                            Uploading...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <MdCloudUpload size={18} />
                                                            Upload Now
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                        <button
                                            type="button"
                                            onClick={handleRemoveImage}
                                            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                            aria-label="Remove image"
                                        >
                                            <MdDelete size={18} />
                                        </button>
                                    </div>
                                    {!reward && selectedFile && (
                                        <p className="mt-2 text-label-sm text-on-variant">
                                            Image will be uploaded after reward is created
                                        </p>
                                    )}
                                </div>
                            )}
                            <p className="text-label-sm text-on-variant">
                                Upload a custom image for this reward, or use an emoji icon above. Image will replace emoji when set.
                            </p>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-label-md font-medium text-on-surface mb-1.5">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="What does the user get for earning this reward?"
                            rows={2}
                            className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-white text-on-surface placeholder:text-on-variant/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                        />
                    </div>

                    {/* Type selector */}
                    <div>
                        <label className="block text-label-md font-medium text-on-surface mb-2">
                            Reward Type *
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                type="button"
                                onClick={() => setType('xp')}
                                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                                    type === 'xp'
                                        ? 'border-amber-400 bg-amber-50'
                                        : 'border-outline-variant hover:border-amber-200'
                                }`}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                    type === 'xp' ? 'bg-amber-400 text-white' : 'bg-slate-100 text-slate-500'
                                }`}>
                                    <MdStar size={24} />
                                </div>
                                <span className="text-label-md font-medium text-on-surface">XP</span>
                            </button>
                            
                            <button
                                type="button"
                                onClick={() => setType('tasks')}
                                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                                    type === 'tasks'
                                        ? 'border-emerald-400 bg-emerald-50'
                                        : 'border-outline-variant hover:border-emerald-200'
                                }`}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                    type === 'tasks' ? 'bg-emerald-400 text-white' : 'bg-slate-100 text-slate-500'
                                }`}>
                                    <MdTaskAlt size={24} />
                                </div>
                                <span className="text-label-md font-medium text-on-surface">Tasks</span>
                            </button>
                            
                            <button
                                type="button"
                                onClick={() => setType('streak')}
                                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                                    type === 'streak'
                                        ? 'border-orange-400 bg-orange-50'
                                        : 'border-outline-variant hover:border-orange-200'
                                }`}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                    type === 'streak' ? 'bg-orange-400 text-white' : 'bg-slate-100 text-slate-500'
                                }`}>
                                    <MdLocalFireDepartment size={24} />
                                </div>
                                <span className="text-label-md font-medium text-on-surface">Streak</span>
                            </button>
                        </div>
                    </div>

                    {/* Threshold */}
                    <div>
                        <label className="block text-label-md font-medium text-on-surface mb-1.5">
                            Threshold *
                        </label>
                        <div className="flex items-center gap-3">
                            <input
                                type="number"
                                value={threshold}
                                onChange={(e) => setThreshold(Math.max(1, parseInt(e.target.value) || 1))}
                                min={1}
                                className="flex-1 px-4 py-3 rounded-xl border border-outline-variant bg-white text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                required
                            />
                            <span className="text-body-md text-on-variant px-4 py-3 bg-surface-variant rounded-xl font-medium">
                                {type === 'xp' && 'XP'}
                                {type === 'tasks' && 'Tasks'}
                                {type === 'streak' && 'Days'}
                            </span>
                        </div>
                        <p className="mt-1.5 text-label-sm text-on-variant">
                            {type === 'xp' && 'User must reach this amount of total XP to unlock'}
                            {type === 'tasks' && 'User must complete this many tasks to unlock'}
                            {type === 'streak' && 'User must maintain a streak for this many days to unlock'}
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 rounded-xl border border-outline-variant text-on-surface font-semibold hover:bg-surface-variant transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || !title.trim()}
                            className="flex-1 px-6 py-3 rounded-xl bg-primary text-on-primary font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : reward ? (
                                <>
                                    <MdSave size={20} />
                                    Save Changes
                                </>
                            ) : (
                                <>
                                    <MdAdd size={20} />
                                    Create Reward
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

