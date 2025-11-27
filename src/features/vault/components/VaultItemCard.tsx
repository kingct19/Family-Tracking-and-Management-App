/**
 * VaultItemCard Component
 * 
 * Card display for vault items
 */

import { useState } from 'react';
import { MdLock, MdVisibility, MdVisibilityOff, MdEdit, MdDelete, MdStar, MdContentCopy, MdCheck, MdImage, MdOpenInNew } from 'react-icons/md';
import { Card } from '@/components/ui/Card';
import { ImageViewerModal } from './ImageViewerModal';
import type { VaultItem } from '@/types';
import { decryptVaultItem } from '../api/vault-api';
import { isVaultSessionValid } from '@/lib/services/vault-storage';
import toast from 'react-hot-toast';

interface VaultItemCardProps {
    item: VaultItem;
    encryptionKey: string;
    onEdit: (item: VaultItem, decryptedContent: string) => void;
    onDelete: (itemId: string) => void;
}

const typeIcons: Record<VaultItem['type'], string> = {
    password: '🔐',
    note: '📝',
    card: '💳',
    identity: '🆔',
    document: '📄',
};

export const VaultItemCard = ({ item, encryptionKey, onEdit, onDelete }: VaultItemCardProps) => {
    const [decryptedContent, setDecryptedContent] = useState<string | null>(null);
    const [isDecrypting, setIsDecrypting] = useState(false);
    const [isRevealed, setIsRevealed] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);

    const handleReveal = async () => {
        if (!isVaultSessionValid()) {
            toast.error('Session expired. Please unlock vault again.');
            return;
        }

        // If already decrypted, just toggle visibility
        if (decryptedContent !== null) {
            setIsRevealed(!isRevealed);
            return;
        }

        setIsDecrypting(true);
        try {
            const content = await decryptVaultItem(item, encryptionKey);
            setDecryptedContent(content || '(No content)');
            setIsRevealed(true);
        } catch (error: any) {
            console.error('Decryption error:', error);
            toast.error('Failed to decrypt. Try: Lock vault → Unlock → Reveal again');
        } finally {
            setIsDecrypting(false);
        }
    };

    const handleCopy = async () => {
        if (!decryptedContent) {
            await handleReveal();
            return;
        }

        try {
            await navigator.clipboard.writeText(decryptedContent);
            setCopied(true);
            toast.success('Copied to clipboard');
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            toast.error('Failed to copy');
        }
    };

    return (
        <Card elevation={1} className="hover:shadow-elevation-2 transition-all duration-200 p-5 sm:p-6">
            {/* Header Section */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-primary-container to-primary-container/80 rounded-xl flex items-center justify-center text-2xl sm:text-3xl flex-shrink-0 shadow-elevation-1">
                        {typeIcons[item.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-title-md sm:text-title-lg text-on-surface truncate">
                                {item.title}
                            </h3>
                            {item.metadata.favorite && (
                                <MdStar size={18} className="text-secondary flex-shrink-0 fill-secondary" />
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-label-sm text-on-variant capitalize">{item.type}</span>
                            {item.metadata.tags && item.metadata.tags.length > 0 && (
                                <>
                                    <span className="text-on-variant">•</span>
                                    <span className="text-label-sm text-on-variant">{item.metadata.tags.length} tag{item.metadata.tags.length !== 1 ? 's' : ''}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                        onClick={() => onEdit(item, decryptedContent || '')}
                        className="p-2 text-on-variant hover:text-primary hover:bg-primary-container rounded-lg transition-colors touch-target"
                        aria-label="Edit item"
                    >
                        <MdEdit size={20} />
                    </button>
                    <button
                        onClick={() => onDelete(item.id)}
                        className="p-2 text-on-variant hover:text-error hover:bg-error-container rounded-lg transition-colors touch-target"
                        aria-label="Delete item"
                    >
                        <MdDelete size={20} />
                    </button>
                </div>
            </div>

            {/* Uploaded Document - No preview, just action button */}
            {item.metadata.fileURL && (
                <div className="mb-4">
                    <div className="bg-surface-variant rounded-input p-4 border-2 border-outline-variant">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-primary-container rounded-lg flex items-center justify-center flex-shrink-0 shadow-elevation-1">
                                <MdImage size={24} className="text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-body-md font-medium text-on-surface truncate">
                                    {item.metadata.fileName || 'Attached Document'}
                                </p>
                                <p className="text-label-sm text-on-variant">
                                    {item.metadata.fileType?.startsWith('image/') 
                                        ? 'Image File' 
                                        : item.metadata.fileType?.includes('pdf') 
                                            ? 'PDF Document' 
                                            : 'Document'}
                                </p>
                            </div>
                            {item.metadata.fileType?.startsWith('image/') ? (
                                <button
                                    onClick={() => setIsImageModalOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-primary text-on-primary rounded-full hover:bg-primary/90 transition-colors text-label-md font-semibold shadow-elevation-1 touch-target"
                                >
                                    <MdVisibility size={18} />
                                    <span>View Image</span>
                                </button>
                            ) : (
                                <a
                                    href={item.metadata.fileURL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-4 py-2.5 bg-primary text-on-primary rounded-full hover:bg-primary/90 transition-colors text-label-md font-semibold shadow-elevation-1 touch-target"
                                >
                                    <MdOpenInNew size={18} />
                                    <span>Open</span>
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Content Preview - Always show for items with encrypted content */}
            <div className="mb-4">
                {isRevealed && decryptedContent ? (
                    <div className="bg-surface-variant rounded-input p-4 border-2 border-primary/20">
                        <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                                <MdLock size={16} className="text-primary" />
                                <span className="text-label-sm font-medium text-on-variant">Decrypted Content</span>
                            </div>
                        </div>
                        <p className="text-body-md text-on-surface font-mono break-all select-text bg-surface rounded-lg p-3 border border-outline-variant">
                            {decryptedContent}
                        </p>
                    </div>
                ) : (
                    <div className="bg-surface-variant rounded-input p-4 border-2 border-outline-variant">
                        <div className="flex items-center gap-2 mb-2">
                            <MdLock size={16} className="text-on-variant" />
                            <span className="text-label-sm font-medium text-on-variant">Encrypted</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex-1 h-6 bg-outline-variant rounded flex items-center justify-center">
                                <span className="text-body-sm text-on-variant font-mono tracking-wider">
                                    {isDecrypting ? 'Decrypting...' : '••••••••••••'}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Tags */}
            {item.metadata.tags && item.metadata.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {item.metadata.tags.map((tag) => (
                        <span
                            key={tag}
                            className="px-3 py-1.5 bg-primary-container text-on-primary-container rounded-full text-label-sm font-medium border border-primary/20"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-outline-variant">
                <button
                    onClick={handleReveal}
                    disabled={isDecrypting}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary text-on-primary rounded-full hover:bg-primary/90 active:bg-primary/80 transition-colors text-label-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-elevation-1 touch-target"
                >
                    {isRevealed ? (
                        <>
                            <MdVisibilityOff size={18} />
                            <span>Hide</span>
                        </>
                    ) : (
                        <>
                            <MdVisibility size={18} />
                            <span>Reveal</span>
                        </>
                    )}
                </button>
                <button
                    onClick={handleCopy}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-surface-variant text-on-surface rounded-full hover:bg-outline-variant active:bg-outline-variant transition-colors text-label-md font-medium shadow-elevation-1 touch-target min-w-[48px]"
                    aria-label="Copy content"
                >
                    {copied ? (
                        <>
                            <MdCheck size={18} className="text-primary" />
                            <span className="hidden sm:inline">Copied</span>
                        </>
                    ) : (
                        <>
                            <MdContentCopy size={18} />
                            <span className="hidden sm:inline">Copy</span>
                        </>
                    )}
                </button>
            </div>

            {/* Metadata Footer */}
            <div className="mt-4 pt-3 border-t border-outline-variant">
                <div className="flex items-center justify-between">
                    <p className="text-label-sm text-on-variant">
                        Updated {new Date(item.updatedAt).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                        })}
                    </p>
                    {item.accessedAt && (
                        <p className="text-label-sm text-on-variant">
                            Last accessed {new Date(item.accessedAt).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric' 
                            })}
                        </p>
                    )}
                </div>
            </div>

            {/* Image Viewer Modal */}
            {item.metadata.fileURL && item.metadata.fileType?.startsWith('image/') && (
                <ImageViewerModal
                    isOpen={isImageModalOpen}
                    onClose={() => setIsImageModalOpen(false)}
                    imageUrl={item.metadata.fileURL}
                    fileName={item.metadata.fileName}
                    title={item.title}
                />
            )}
        </Card>
    );
};

