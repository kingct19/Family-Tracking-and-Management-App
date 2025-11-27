/**
 * VaultItemModal Component
 * 
 * Modal for creating/editing vault items
 */

import { useState, useEffect, useRef } from 'react';
import { MdClose, MdLock, MdVisibility, MdVisibilityOff, MdStar, MdLabel, MdUpload, MdImage, MdDelete, MdOpenInNew } from 'react-icons/md';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { uploadVaultDocument } from '@/lib/services/storage-service';
import { useAuth } from '@/features/auth/hooks/useAuth';
import toast from 'react-hot-toast';
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
    const { user } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [formData, setFormData] = useState({
        type: 'password' as VaultItemType,
        title: '',
        content: '',
        favorite: false,
        tags: [] as string[],
        fileURL: '' as string | undefined,
        fileName: '' as string | undefined,
        fileType: '' as string | undefined,
    });
    const [showContent, setShowContent] = useState(false);
    const [tagInput, setTagInput] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            // Check if we're editing an existing item (item exists)
            // decryptedContent can be empty string for file-only items
            if (item) {
                setFormData({
                    type: item.type,
                    title: item.title,
                    content: decryptedContent || '',
                    favorite: item.metadata.favorite,
                    tags: item.metadata.tags || [],
                    fileURL: item.metadata.fileURL,
                    fileName: item.metadata.fileName,
                    fileType: item.metadata.fileType,
                });
                setFilePreview(item.metadata.fileURL || null);
            } else {
                // Creating new item
                setFormData({
                    type: 'password',
                    title: '',
                    content: '',
                    favorite: false,
                    tags: [],
                    fileURL: undefined,
                    fileName: undefined,
                    fileType: undefined,
                });
                setFilePreview(null);
            }
            setErrors({});
            setShowContent(false);
            setUploadedFile(null);
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

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/webp',
            'image/gif',
            'application/pdf',
        ];

        if (!allowedTypes.includes(file.type)) {
            toast.error('File type not supported. Please upload an image (JPEG, PNG, WebP, GIF) or PDF.');
            return;
        }

        // Validate file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
            toast.error('File size must be less than 10MB');
            return;
        }

        setUploadedFile(file);

        // Create preview for images
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFilePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setFilePreview(null);
        }
    };

    const handleFileUpload = async () => {
        if (!uploadedFile || !user) {
            toast.error('Please select a file first');
            return;
        }

        setIsUploading(true);
        try {
            // Use item ID if editing, otherwise generate a temporary ID
            const itemId = item?.id || `temp_${Date.now()}`;
            const fileURL = await uploadVaultDocument(uploadedFile, user.id, itemId);
            
            handleChange('fileURL', fileURL);
            handleChange('fileName', uploadedFile.name);
            handleChange('fileType', uploadedFile.type);
            
            toast.success('File uploaded successfully');
        } catch (error: any) {
            console.error('File upload error:', error);
            toast.error(error.message || 'Failed to upload file');
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemoveFile = () => {
        setUploadedFile(null);
        setFilePreview(null);
        handleChange('fileURL', undefined);
        handleChange('fileName', undefined);
        handleChange('fileType', undefined);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: Record<string, string> = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        }

        // Content is required unless it's card/identity/document with a file uploaded
        const hasFile = formData.fileURL || uploadedFile;
        const requiresContent = !(formData.type === 'card' || formData.type === 'identity' || formData.type === 'document') || !hasFile;
        
        if (requiresContent && !formData.content.trim()) {
            newErrors.content = 'Content is required';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            let finalFileURL = formData.fileURL;
            let finalFileName = formData.fileName;
            let finalFileType = formData.fileType;

            // If there's an uploaded file but not yet uploaded to storage, upload it first
            if (uploadedFile && !formData.fileURL && !isUploading && user) {
                setIsUploading(true);
                try {
                    const itemId = item?.id || `temp_${Date.now()}`;
                    finalFileURL = await uploadVaultDocument(uploadedFile, user.id, itemId);
                    finalFileName = uploadedFile.name;
                    finalFileType = uploadedFile.type;
                    toast.success('File uploaded successfully');
                } catch (uploadError: any) {
                    console.error('File upload error:', uploadError);
                    toast.error(uploadError.message || 'Failed to upload file');
                    setIsUploading(false);
                    return; // Don't save if upload failed
                }
                setIsUploading(false);
            }

            await onSave({
                type: formData.type,
                title: formData.title.trim(),
                content: formData.content.trim(),
                metadata: {
                    favorite: formData.favorite,
                    tags: formData.tags,
                    fileURL: finalFileURL,
                    fileName: finalFileName,
                    fileType: finalFileType,
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
                className="bg-surface rounded-card shadow-elevation-5 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-outline-variant">
                    <h2 className="text-headline-sm sm:text-headline-md font-semibold text-on-surface">
                        {item ? 'Edit Vault Item' : 'Create Vault Item'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-surface-variant transition-colors touch-target"
                        aria-label="Close"
                    >
                        <MdClose size={24} className="text-on-variant" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6">
                    <div className="space-y-4 sm:space-y-6">
                        {/* Type */}
                        <div>
                            <label className="block text-label-md font-medium text-on-surface mb-2">
                                Type
                            </label>
                            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                                {vaultTypes.map((type) => (
                                    <button
                                        key={type.value}
                                        type="button"
                                        onClick={() => handleChange('type', type.value)}
                                        className={`p-3 rounded-xl border-2 transition-all touch-target ${
                                            formData.type === type.value
                                                ? 'border-primary bg-primary-container'
                                                : 'border-outline-variant hover:border-primary hover:bg-surface-variant'
                                        }`}
                                    >
                                        <div className="text-2xl mb-1">{type.icon}</div>
                                        <div className="text-label-sm font-medium text-on-surface">
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

                        {/* File Upload - For card, identity, and document types */}
                        {(formData.type === 'card' || formData.type === 'identity' || formData.type === 'document') && (
                            <div>
                                <label className="block text-label-md font-medium text-on-surface mb-2">
                                    Upload Document
                                    <span className="text-label-sm text-on-variant font-normal ml-2">(Optional)</span>
                                </label>
                                
                                {filePreview || formData.fileURL ? (
                                    <div className="space-y-3">
                                        {(filePreview && filePreview.startsWith('data:image')) || (formData.fileURL && formData.fileType?.startsWith('image/')) ? (
                                            <div className="relative rounded-input border-2 border-primary/20 overflow-hidden">
                                                <img
                                                    src={filePreview && filePreview.startsWith('data:image') ? filePreview : formData.fileURL}
                                                    alt="Document preview"
                                                    className="w-full h-48 sm:h-64 object-contain bg-surface-variant"
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.style.display = 'none';
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveFile}
                                                    className="absolute top-2 right-2 p-2 bg-error text-on-error rounded-full hover:bg-error/90 transition-colors shadow-elevation-2 touch-target"
                                                    aria-label="Remove file"
                                                >
                                                    <MdDelete size={18} />
                                                </button>
                                            </div>
                                        ) : formData.fileURL ? (
                                            <div className="bg-surface-variant rounded-input p-4 border-2 border-outline-variant">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 bg-primary-container rounded-lg flex items-center justify-center flex-shrink-0">
                                                        <MdImage size={24} className="text-primary" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-body-md font-medium text-on-surface truncate">
                                                            {formData.fileName || 'Document'}
                                                        </p>
                                                        <p className="text-label-sm text-on-variant">
                                                            {formData.fileType?.includes('pdf') ? 'PDF Document' : 'File'}
                                                        </p>
                                                    </div>
                                                    <a
                                                        href={formData.fileURL}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 text-primary hover:bg-primary-container rounded-lg transition-colors touch-target"
                                                        aria-label="Open document"
                                                    >
                                                        <MdOpenInNew size={20} />
                                                    </a>
                                                    <button
                                                        type="button"
                                                        onClick={handleRemoveFile}
                                                        className="p-2 text-error hover:bg-error-container rounded-lg transition-colors touch-target"
                                                        aria-label="Remove file"
                                                    >
                                                        <MdDelete size={20} />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : null}
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className="border-2 border-dashed border-outline-variant rounded-input p-6 sm:p-8 text-center cursor-pointer hover:border-primary hover:bg-primary-container/10 transition-colors"
                                        >
                                            <MdUpload size={32} className="text-on-variant mx-auto mb-3" />
                                            <p className="text-body-md font-medium text-on-surface mb-1">
                                                Click to upload document
                                            </p>
                                            <p className="text-label-sm text-on-variant">
                                                Images (JPEG, PNG, WebP, GIF) or PDF (max 10MB)
                                            </p>
                                        </div>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,application/pdf"
                                            onChange={handleFileSelect}
                                            className="hidden"
                                        />
                                        {uploadedFile && (
                                            <div className="flex items-center gap-3 p-3 bg-surface-variant rounded-input border border-outline-variant">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-body-sm font-medium text-on-surface truncate">
                                                        {uploadedFile.name}
                                                    </p>
                                                    <p className="text-label-sm text-on-variant">
                                                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                                                    </p>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="filled"
                                                    size="small"
                                                    onClick={handleFileUpload}
                                                    loading={isUploading}
                                                    disabled={isUploading || !!formData.fileURL}
                                                    startIcon={<MdUpload size={16} />}
                                                >
                                                    {isUploading ? 'Uploading...' : 'Upload'}
                                                </Button>
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveFile}
                                                    className="p-2 text-on-variant hover:text-error hover:bg-error-container rounded-lg transition-colors touch-target"
                                                    aria-label="Remove file"
                                                >
                                                    <MdDelete size={18} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Content */}
                        <div>
                            <label className="block text-label-md font-medium text-on-surface mb-2">
                                {formData.type === 'card' || formData.type === 'identity' || formData.type === 'document'
                                    ? 'Additional Notes'
                                    : 'Content'}
                            </label>
                            <div className="relative">
                                <textarea
                                    value={formData.content}
                                    onChange={(e) => handleChange('content', e.target.value)}
                                    placeholder={
                                        formData.type === 'password'
                                            ? 'Enter password'
                                            : formData.type === 'card'
                                            ? 'Enter card details (number, expiry, CVV, etc.)'
                                            : formData.type === 'identity'
                                            ? 'Enter identity information'
                                            : formData.type === 'document'
                                            ? 'Enter document notes or description'
                                            : 'Enter content'
                                    }
                                    rows={formData.type === 'note' ? 8 : 4}
                                    className={`w-full px-4 py-3 pr-12 rounded-input border-2 transition-colors text-body-md text-on-surface placeholder:text-on-variant ${
                                        errors.content
                                            ? 'border-error focus:border-error'
                                            : 'border-outline-variant focus:border-primary'
                                    } focus:outline-none focus:ring-2 focus:ring-primary bg-surface`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowContent(!showContent)}
                                    className="absolute right-3 top-3 p-2 text-on-variant hover:text-on-surface hover:bg-surface-variant rounded-lg transition-colors touch-target"
                                    aria-label={showContent ? 'Hide content' : 'Show content'}
                                >
                                    {showContent ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
                                </button>
                            </div>
                            {errors.content && (
                                <p className="mt-1 text-label-sm text-error">{errors.content}</p>
                            )}
                            <p className="mt-1 text-label-sm text-on-variant">
                                {formData.type === 'card' || formData.type === 'identity' || formData.type === 'document'
                                    ? 'This information will be encrypted before storage'
                                    : 'This content will be encrypted before storage'}
                            </p>
                        </div>

                        {/* Tags */}
                        <div>
                            <label className="block text-label-md font-medium text-on-surface mb-2">
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
                                    startAdornment={<MdLabel size={16} className="text-on-variant" />}
                                    className="flex-1"
                                />
                                <Button
                                    type="button"
                                    variant="outlined"
                                    onClick={handleAddTag}
                                    disabled={!tagInput.trim()}
                                    size="medium"
                                >
                                    Add
                                </Button>
                            </div>
                            {formData.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {formData.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="inline-flex items-center gap-1 px-3 py-1 bg-primary-container text-on-primary-container rounded-full text-label-sm font-medium"
                                        >
                                            {tag}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveTag(tag)}
                                                className="hover:text-on-primary-container/80 transition-colors touch-target"
                                                aria-label={`Remove tag ${tag}`}
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
                                className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary touch-target"
                            />
                            <label htmlFor="favorite" className="flex items-center gap-2 cursor-pointer">
                                <MdStar
                                    size={16}
                                    className={formData.favorite ? 'text-secondary fill-secondary' : 'text-on-variant'}
                                />
                                <span className="text-body-md font-medium text-on-surface">Mark as favorite</span>
                            </label>
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-4 sm:p-6 border-t border-outline-variant bg-surface-variant">
                    <Button variant="outlined" onClick={onClose} disabled={isLoading} size="medium" className="touch-target">
                        Cancel
                    </Button>
                    <Button
                        variant="filled"
                        onClick={handleSubmit}
                        disabled={isLoading}
                        loading={isLoading}
                        size="medium"
                        className="touch-target"
                    >
                        {isLoading ? 'Saving...' : item ? 'Save Changes' : 'Create Item'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

