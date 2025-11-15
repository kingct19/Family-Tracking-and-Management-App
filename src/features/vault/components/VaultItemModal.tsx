/**
 * VaultItemModal Component
 * 
 * Modal for creating/editing vault items
 */

import { useState, useEffect } from 'react';
import { FiX, FiLock, FiEye, FiEyeOff, FiStar, FiTag } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import type { VaultItem, VaultItemType } from '@/types';

interface VaultItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: {
        type: VaultItemType;
        title: string;
        content: string;
        metadata?: Partial<VaultItem['metadata']>;
    }) => Promise<void>;
    item?: VaultItem | null;
    decryptedContent?: string;
    isLoading?: boolean;
}

const vaultTypes: Array<{ value: VaultItemType; label: string; icon: string }> = [
    { value: 'password', label: 'Password', icon: '🔐' },
    { value: 'note', label: 'Secure Note', icon: '📝' },
    { value: 'card', label: 'Credit Card', icon: '💳' },
    { value: 'identity', label: 'Identity', icon: '🆔' },
    { value: 'document', label: 'Document', icon: '📄' },
];

export const VaultItemModal = ({
    isOpen,
    onClose,
    onSave,
    item,
    decryptedContent,
    isLoading = false,
}: VaultItemModalProps) => {
    const [formData, setFormData] = useState({
        type: 'password' as VaultItemType,
        title: '',
        content: '',
        favorite: false,
        tags: [] as string[],
    });
    const [showContent, setShowContent] = useState(false);
    const [tagInput, setTagInput] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (isOpen) {
            if (item && decryptedContent) {
                setFormData({
                    type: item.type,
                    title: item.title,
                    content: decryptedContent,
                    favorite: item.metadata.favorite,
                    tags: item.metadata.tags || [],
                });
            } else {
                setFormData({
                    type: 'password',
                    title: '',
                    content: '',
                    favorite: false,
                    tags: [],
                });
            }
            setErrors({});
            setShowContent(false);
        }
    }, [isOpen, item, decryptedContent]);

    const handleChange = (field: string, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleAddTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            handleChange('tags', [...formData.tags, tagInput.trim()]);
            setTagInput('');
        }
    };

    const handleRemoveTag = (tag: string) => {
        handleChange('tags', formData.tags.filter((t) => t !== tag));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: Record<string, string> = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        }

        if (!formData.content.trim()) {
            newErrors.content = 'Content is required';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            await onSave({
                type: formData.type,
                title: formData.title.trim(),
                content: formData.content.trim(),
                metadata: {
                    favorite: formData.favorite,
                    tags: formData.tags,
                },
            });
            onClose();
        } catch (error) {
            // Error handling done in parent
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-slide-up"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {item ? 'Edit Vault Item' : 'Create Vault Item'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                        aria-label="Close"
                    >
                        <FiX size={24} className="text-gray-600" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-6">
                        {/* Type */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Type
                            </label>
                            <div className="grid grid-cols-5 gap-2">
                                {vaultTypes.map((type) => (
                                    <button
                                        key={type.value}
                                        type="button"
                                        onClick={() => handleChange('type', type.value)}
                                        className={`p-3 rounded-xl border-2 transition-all ${
                                            formData.type === type.value
                                                ? 'border-purple-500 bg-purple-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <div className="text-2xl mb-1">{type.icon}</div>
                                        <div className="text-xs font-medium text-gray-700">
                                            {type.label}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Title */}
                        <TextField
                            label="Title"
                            value={formData.title}
                            onChange={(e) => handleChange('title', e.target.value)}
                            placeholder="Enter item title"
                            required
                            error={errors.title}
                            fullWidth
                        />

                        {/* Content */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Content
                            </label>
                            <div className="relative">
                                <textarea
                                    value={formData.content}
                                    onChange={(e) => handleChange('content', e.target.value)}
                                    placeholder={
                                        formData.type === 'password'
                                            ? 'Enter password'
                                            : formData.type === 'card'
                                            ? 'Enter card details'
                                            : 'Enter content'
                                    }
                                    rows={formData.type === 'note' ? 8 : 4}
                                    className={`w-full px-4 py-3 pr-12 rounded-xl border-2 transition-colors ${
                                        errors.content
                                            ? 'border-red-300 focus:border-red-500'
                                            : 'border-gray-200 focus:border-purple-500'
                                    } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowContent(!showContent)}
                                    className="absolute right-3 top-3 p-2 text-gray-400 hover:text-gray-600"
                                    aria-label={showContent ? 'Hide content' : 'Show content'}
                                >
                                    {showContent ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                                </button>
                            </div>
                            {errors.content && (
                                <p className="mt-1 text-sm text-red-600">{errors.content}</p>
                            )}
                            <p className="mt-1 text-xs text-gray-500">
                                This content will be encrypted before storage
                            </p>
                        </div>

                        {/* Tags */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Tags
                            </label>
                            <div className="flex gap-2 mb-2">
                                <TextField
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    placeholder="Add tag"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddTag();
                                        }
                                    }}
                                    startAdornment={<FiTag size={16} className="text-gray-400" />}
                                    className="flex-1"
                                />
                                <Button
                                    type="button"
                                    variant="outlined"
                                    onClick={handleAddTag}
                                    disabled={!tagInput.trim()}
                                >
                                    Add
                                </Button>
                            </div>
                            {formData.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {formData.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                                        >
                                            {tag}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveTag(tag)}
                                                className="hover:text-purple-900"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Favorite */}
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="favorite"
                                checked={formData.favorite}
                                onChange={(e) => handleChange('favorite', e.target.checked)}
                                className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <label htmlFor="favorite" className="flex items-center gap-2 cursor-pointer">
                                <FiStar
                                    size={16}
                                    className={formData.favorite ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}
                                />
                                <span className="text-sm font-medium text-gray-700">Mark as favorite</span>
                            </label>
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
                    <Button variant="outlined" onClick={onClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button
                        variant="filled"
                        onClick={handleSubmit}
                        disabled={isLoading}
                        loading={isLoading}
                    >
                        {isLoading ? 'Saving...' : item ? 'Save Changes' : 'Create Item'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

