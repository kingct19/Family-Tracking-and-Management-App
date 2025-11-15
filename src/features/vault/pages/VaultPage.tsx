/**
 * VaultPage Component
 * 
 * Main vault page with PIN/biometric authentication gate
 */

import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { FiLock, FiPlus, FiShield, FiSearch, FiFilter } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { VaultItemSkeleton } from '@/components/ui/Skeleton';
import { VaultAuthGate } from '../components/VaultAuthGate';
import { VaultItemCard } from '../components/VaultItemCard';
import { VaultItemModal } from '../components/VaultItemModal';
import { useVaultItems, useCreateVaultItem, useUpdateVaultItem, useDeleteVaultItem, useDecryptVaultItem } from '../hooks/useVault';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { isVaultSessionValid, clearVaultSession } from '@/lib/services/vault-storage';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { VaultItem } from '@/types';

const VaultPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [encryptionKey, setEncryptionKey] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<VaultItem | null>(null);
    const [editingDecryptedContent, setEditingDecryptedContent] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<VaultItem['type'] | 'all'>('all');

    const { data: vaultItems = [], isLoading } = useVaultItems();
    const createMutation = useCreateVaultItem();
    const updateMutation = useUpdateVaultItem();
    const deleteMutation = useDeleteVaultItem();
    const { decrypt, setEncryptionKey: setDecryptKey } = useDecryptVaultItem();

    // Check session on mount
    useEffect(() => {
        if (isVaultSessionValid()) {
            setIsAuthenticated(true);
        }
    }, []);

    // Set encryption key when authenticated
    useEffect(() => {
        if (isAuthenticated && encryptionKey) {
            createMutation.setEncryptionKey(encryptionKey);
            updateMutation.setEncryptionKey(encryptionKey);
            setDecryptKey(encryptionKey);
        }
    }, [isAuthenticated, encryptionKey, createMutation, updateMutation, setDecryptKey]);

    // Session timeout check
    useEffect(() => {
        const interval = setInterval(() => {
            if (!isVaultSessionValid() && isAuthenticated) {
                setIsAuthenticated(false);
                setEncryptionKey(null);
                clearVaultSession();
                toast.error('Vault session expired. Please unlock again.');
            }
        }, 60000); // Check every minute

        return () => clearInterval(interval);
    }, [isAuthenticated]);

    const handleAuthenticated = (pin: string) => {
        setEncryptionKey(pin);
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setEncryptionKey(null);
        clearVaultSession();
        toast.success('Vault locked');
    };

    const handleCreateItem = () => {
        setEditingItem(null);
        setEditingDecryptedContent('');
        setIsModalOpen(true);
    };

    const handleEditItem = async (item: VaultItem, currentContent: string) => {
        if (!encryptionKey) {
            toast.error('Encryption key not available');
            return;
        }

        // If content not already decrypted, decrypt it
        let decryptedContent = currentContent;
        if (!decryptedContent) {
            try {
                decryptedContent = await decrypt(item);
            } catch (error) {
                toast.error('Failed to decrypt item');
                return;
            }
        }

        setEditingItem(item);
        setEditingDecryptedContent(decryptedContent);
        setIsModalOpen(true);
    };

    const handleDeleteItem = async (itemId: string) => {
        if (!confirm('Are you sure you want to delete this vault item? This cannot be undone.')) {
            return;
        }

        try {
            await deleteMutation.mutateAsync(itemId);
        } catch (error) {
            // Error handled by hook
        }
    };

    const handleSaveItem = async (data: {
        type: VaultItem['type'];
        title: string;
        content: string;
        metadata?: Partial<VaultItem['metadata']>;
    }) => {
        if (!encryptionKey) {
            toast.error('Encryption key not available');
            return;
        }

        try {
            if (editingItem) {
                await updateMutation.mutateAsync({
                    itemId: editingItem.id,
                    updates: data,
                });
            } else {
                await createMutation.mutateAsync(data);
            }
            setIsModalOpen(false);
            setEditingItem(null);
            setEditingDecryptedContent('');
        } catch (error) {
            // Error handled by hook
        }
    };

    // Filter and search items
    const filteredItems = vaultItems.filter((item) => {
        const matchesSearch = searchQuery === '' || 
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.metadata.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const matchesFilter = filterType === 'all' || item.type === filterType;
        
        return matchesSearch && matchesFilter;
    });

    // Show auth gate if not authenticated
    if (!isAuthenticated || !encryptionKey) {
        return (
            <VaultAuthGate
                onAuthenticated={handleAuthenticated}
                onSetupComplete={() => {
                    // PIN setup complete, already authenticated
                }}
            />
        );
    }

    return (
        <>
            <Helmet>
                <title>Vault - Family Safety App</title>
                <meta name="description" content="Securely store sensitive information" />
            </Helmet>

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                            <h1 className="text-headline-lg md:text-display-sm font-normal text-on-surface">Digital Vault</h1>
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
                                <FiShield size={14} className="text-green-600" />
                                <span className="text-label-sm font-semibold text-green-700">Encrypted</span>
                            </div>
                        </div>
                        <p className="text-body-lg text-on-variant">
                            Secure storage for passwords and sensitive information
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outlined"
                            onClick={handleLogout}
                            startIcon={<FiLock size={18} />}
                            className="btn-base border-2 border-outline-variant text-on-surface hover:bg-surface-variant"
                        >
                            Lock Vault
                        </Button>
                        <Button
                            variant="filled"
                            onClick={handleCreateItem}
                            startIcon={<FiPlus size={18} />}
                            className="btn-base bg-primary text-on-primary hover:bg-primary/90 shadow-elevation-2"
                        >
                            Add Item
                        </Button>
                    </div>
                </div>

                {/* Search and Filter */}
                {vaultItems.length > 0 && (
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <TextField
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search vault items..."
                                startAdornment={<FiSearch size={18} className="text-gray-400" />}
                                fullWidth
                            />
                        </div>
                        <div className="sm:w-48">
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value as VaultItem['type'] | 'all')}
                                className="input-base"
                            >
                                <option value="all">All Types</option>
                                <option value="password">Passwords</option>
                                <option value="note">Notes</option>
                                <option value="card">Cards</option>
                                <option value="identity">Identity</option>
                                <option value="document">Documents</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* Vault Items Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <VaultItemSkeleton key={i} />
                        ))}
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="card p-12 text-center">
                        <div className="w-20 h-20 bg-primary-container rounded-full flex items-center justify-center mx-auto mb-6 shadow-elevation-2">
                            <FiLock size={32} className="text-primary" />
                        </div>
                        <h3 className="text-headline-md font-normal text-on-surface mb-3">
                            {vaultItems.length === 0 ? 'Your vault is empty' : 'No items found'}
                        </h3>
                        <p className="text-body-lg text-on-variant mb-8 max-w-md mx-auto">
                            {vaultItems.length === 0
                                ? 'Start by adding your first secure item'
                                : 'Try adjusting your search or filter'}
                        </p>
                        {vaultItems.length === 0 && (
                            <Button
                                variant="filled"
                                onClick={handleCreateItem}
                                startIcon={<FiPlus size={18} />}
                                className="btn-base bg-primary text-on-primary hover:bg-primary/90 shadow-elevation-2"
                            >
                                Add Your First Item
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredItems.map((item) => (
                            <VaultItemCard
                                key={item.id}
                                item={item}
                                encryptionKey={encryptionKey!}
                                onEdit={handleEditItem}
                                onDelete={handleDeleteItem}
                            />
                        ))}
                    </div>
                )}

                {/* Vault Item Modal */}
                {isModalOpen && (
                    <VaultItemModal
                        isOpen={isModalOpen}
                        onClose={() => {
                            setIsModalOpen(false);
                            setEditingItem(null);
                            setEditingDecryptedContent('');
                        }}
                        onSave={handleSaveItem}
                        item={editingItem}
                        decryptedContent={editingDecryptedContent}
                        isLoading={createMutation.isPending || updateMutation.isPending}
                    />
                )}
            </div>
        </>
    );
};

export default VaultPage;
