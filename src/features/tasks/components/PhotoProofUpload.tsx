import { useState, useRef } from 'react';
import { FiCamera, FiX, FiUpload, FiCheck } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import toast from 'react-hot-toast';

interface PhotoProofUploadProps {
    onUpload: (file: File, notes?: string) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
    existingProof?: string;
}

export const PhotoProofUpload = ({
    onUpload,
    onCancel,
    isLoading = false,
    existingProof,
}: PhotoProofUploadProps) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(existingProof || null);
    const [notes, setNotes] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
            toast.error('Please select a JPEG, PNG, or WebP image');
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size must be less than 5MB');
            return;
        }

        setSelectedFile(file);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleRemove = () => {
        setSelectedFile(null);
        setPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async () => {
        if (!selectedFile && !existingProof) {
            toast.error('Please select a photo');
            return;
        }

        if (selectedFile) {
            await onUpload(selectedFile, notes || undefined);
        } else {
            // If there's existing proof but no new file, just submit notes
            await onUpload(new File([], ''), notes || undefined);
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Photo Proof *
                </label>
                {preview ? (
                    <div className="relative">
                        <img
                            src={preview}
                            alt="Proof preview"
                            className="w-full h-64 object-cover rounded-lg border-2 border-gray-200"
                        />
                        <button
                            onClick={handleRemove}
                            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                            aria-label="Remove photo"
                        >
                            <FiX size={18} />
                        </button>
                    </div>
                ) : (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-64 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-colors"
                    >
                        <FiCamera size={48} className="text-gray-400 mb-2" />
                        <p className="text-gray-600 font-medium">Click to upload photo</p>
                        <p className="text-sm text-gray-500 mt-1">JPEG, PNG, or WebP (max 5MB)</p>
                    </div>
                )}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleFileSelect}
                    className="hidden"
                />
            </div>

            <div className="w-full">
                <label className="block text-label-md text-on-surface mb-2">
                    Notes (Optional)
                </label>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-4 py-3 text-body-md text-on-surface bg-surface border-2 rounded-xl border-outline focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="Add any additional notes about the completion..."
                    rows={3}
                />
            </div>

            <div className="flex gap-3">
                <Button
                    variant="outlined"
                    onClick={onCancel}
                    disabled={isLoading}
                    fullWidth
                >
                    Cancel
                </Button>
                <Button
                    variant="filled"
                    onClick={handleSubmit}
                    loading={isLoading}
                    disabled={isLoading || (!selectedFile && !existingProof)}
                    startIcon={<FiUpload size={18} />}
                    fullWidth
                >
                    {existingProof ? 'Update Proof' : 'Submit Proof'}
                </Button>
            </div>
        </div>
    );
};

