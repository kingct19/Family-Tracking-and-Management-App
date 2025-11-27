/**
 * VaultPage Component
 * 
 * Main vault page with PIN/biometric authentication gate
 */

import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { MdLock, MdAdd, MdSecurity, MdSearch, MdFilterList } from 'react-icons/md';
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

    const handleAuthenticated = (pin?: string) => {
        setEncryptionKey(pin || null);
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
                <title>Vault - HaloHub</title>
                <meta name="description" content="Securely store sensitive information" />
            </Helmet>

            <div className="space-y-4 sm:space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 sm:mb-3 flex-wrap">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary-container rounded-xl flex items-center justify-center flex-shrink-0">
                                    <MdLock size={24} className="text-primary" />
                                </div>
                                <h1 className="text-title-lg sm:text-headline-sm font-semibold text-on-surface">Digital Vault</h1>
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-container border border-primary/20 rounded-full">
                                <MdSecurity size={14} className="text-primary" />
                                <span className="text-label-sm font-semibold text-on-primary-container">Encrypted</span>
                            </div>
                        </div>
                        <p className="text-body-sm sm:text-body-md text-on-variant">
                            Secure storage for passwords and sensitive information
                        </p>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                        <Button
                            variant="outlined"
                            onClick={handleLogout}
                            startIcon={<MdLock size={18} />}
                            size="medium"
                            className="touch-target"
                        >
                            <span className="hidden sm:inline">Lock Vault</span>
                            <span className="sm:hidden">Lock</span>
                        </Button>
                        <Button
                            variant="filled"
                            onClick={handleCreateItem}
                            startIcon={<MdAdd size={18} />}
                            size="medium"
                            className="touch-target"
                        >
                            <span className="hidden sm:inline">Add Item</span>
                            <span className="sm:hidden">Add</span>
                        </Button>
                    </div>
                </div>

                {/* Search and Filter */}
                {vaultItems.length > 0 && (
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                        <div className="flex-1 min-w-0">
                            <TextField
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search vault items..."
                                startAdornment={<MdSearch size={18} className="text-on-variant" />}
                                fullWidth
                            />
                        </div>
                        <div className="sm:w-48">
                            <div className="relative">
                                <MdFilterList size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-variant pointer-events-none" />
                                <select
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value as VaultItem['type'] | 'all')}
                                    className="w-full pl-10 pr-4 py-3 bg-surface-variant border border-outline-variant rounded-input text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all touch-target"
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
                    </div>
                )}

                {/* Vault Items Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {[...Array(6)].map((_, i) => (
                            <VaultItemSkeleton key={i} />
                        ))}
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="card p-8 sm:p-12 text-center">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-primary-container rounded-full flex items-center justify-center mx-auto mb-6 shadow-elevation-2">
                            <MdLock size={32} className="sm:w-10 sm:h-10 text-primary" />
                        </div>
                        <h3 className="text-headline-sm sm:text-headline-md font-semibold text-on-surface mb-2 sm:mb-3">
                            {vaultItems.length === 0 ? 'Your vault is empty' : 'No items found'}
                        </h3>
                        <p className="text-body-md sm:text-body-lg text-on-variant mb-6 sm:mb-8 max-w-md mx-auto">
                            {vaultItems.length === 0
                                ? 'Start by adding your first secure item'
                                : 'Try adjusting your search or filter'}
                        </p>
                        {vaultItems.length === 0 && (
                            <Button
                                variant="filled"
                                onClick={handleCreateItem}
                                startIcon={<MdAdd size={18} />}
                                size="medium"
                                className="touch-target"
                            >
                                Add Your First Item
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
