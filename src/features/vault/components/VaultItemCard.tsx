/**
 * VaultItemCard Component
 * 
 * Card display for vault items
 */

import { useState } from 'react';
import { FiLock, FiEye, FiEyeOff, FiEdit2, FiTrash2, FiStar, FiCopy, FiCheck } from 'react-icons/fi';
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

    const handleReveal = async () => {
        if (!isVaultSessionValid()) {
            toast.error('Session expired. Please unlock vault again.');
            return;
        }

        if (decryptedContent) {
            setIsRevealed(!isRevealed);
            return;
        }

        setIsDecrypting(true);
        try {
            const content = await decryptVaultItem(item, encryptionKey);
            setDecryptedContent(content);
            setIsRevealed(true);
        } catch (error) {
            console.error('Decryption error:', error);
            toast.error('Failed to decrypt item');
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
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-200">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl">
                        {typeIcons[item.type]}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            {item.title}
                            {item.metadata.favorite && (
                                <FiStar size={16} className="text-yellow-500 fill-yellow-500" />
                            )}
                        </h3>
                        <p className="text-sm text-gray-500 capitalize">{item.type}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onEdit(item, decryptedContent || '')}
                        className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        aria-label="Edit item"
                    >
                        <FiEdit2 size={18} />
                    </button>
                    <button
                        onClick={() => onDelete(item.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        aria-label="Delete item"
                    >
                        <FiTrash2 size={18} />
                    </button>
                </div>
            </div>

            {/* Content Preview */}
            <div className="mb-4">
                {isRevealed && decryptedContent ? (
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <p className="text-sm text-gray-700 font-mono break-all">
                            {decryptedContent}
                        </p>
                    </div>
                ) : (
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 flex items-center gap-2">
                        <FiLock size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-500">
                            {isDecrypting ? 'Decrypting...' : '••••••••••••'}
                        </span>
                    </div>
                )}
            </div>

            {/* Tags */}
            {item.metadata.tags && item.metadata.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {item.metadata.tags.map((tag) => (
                        <span
                            key={tag}
                            className="px-2 py-1 bg-purple-50 text-purple-700 rounded-md text-xs font-medium"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                <button
                    onClick={handleReveal}
                    disabled={isDecrypting}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium disabled:opacity-50"
                >
                    {isRevealed ? (
                        <>
                            <FiEyeOff size={16} />
                            Hide
                        </>
                    ) : (
                        <>
                            <FiEye size={16} />
                            Reveal
                        </>
                    )}
                </button>
                <button
                    onClick={handleCopy}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                    aria-label="Copy content"
                >
                    {copied ? <FiCheck size={16} /> : <FiCopy size={16} />}
                </button>
            </div>

            {/* Metadata */}
            <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                <p>Updated {new Date(item.updatedAt).toLocaleDateString()}</p>
            </div>
        </div>
    );
};

