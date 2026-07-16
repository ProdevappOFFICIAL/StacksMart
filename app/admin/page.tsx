"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { ArrowRight, Eye, Plus, X, Store, Globe, AlignLeft, LogOut, Upload, Camera, Flame } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { storeApi, uploadApi } from '@/lib/api';
import { useStacks } from '@/lib/use-stacks';
import { useAuth } from '@/contexts/AuthContext';
import { Loading } from '@/components/ui/loading';

interface StoreData {
    id: string;
    name: string;
    slug: string;
    description?: string;
    revenue: string;
    orders: number;
    products: number;
    status: string;
    icon?: string;
    createdAt: string;
}

export default function AdminPage() {
    const { userData, connectWallet } = useStacks();
    const { token, logout } = useAuth();
    const [isMounted, setIsMounted] = useState(false);
    const [stores, setStores] = useState<StoreData[]>([]);
    const [loading, setLoading] = useState(true);

    // UI States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState("");
    const [loadError, setLoadError] = useState("");
    const [isUploadingIcon, setIsUploadingIcon] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        storeName: '',
        storeSlug: '',
        description: '',
        storeIcon: ''
    });

    const isConnected = !!userData;

    const loadStoresFromAPI = useCallback(async () => {
        setLoading(true);
        setLoadError(''); // Clear any previous errors

        try {
            const userStores = await storeApi.getUserStores();
            setStores(userStores);
        } catch (err) {
            console.error('Failed to load stores:', err);

            // Handle different types of errors
            if (err instanceof Error) {
                if (err.message.includes('Authentication required') || err.message.includes('UNAUTHORIZED')) {
                    setLoadError('Authentication required. The backend API requires you to sign in with your wallet.');
                } else if (err.message.includes('NETWORK_ERROR') || err.message.includes('Cannot connect')) {
                    setLoadError('Cannot connect to the backend server. The API might be down or unreachable.');
                } else if (err.message.includes('ECONNREFUSED')) {
                    setLoadError('Connection refused. The backend server is not running.');
                } else {
                    setLoadError(`API Error: ${err.message}`);
                }
            } else {
                setLoadError('Unknown error occurred while loading stores.');
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const initializeAdmin = async () => {
            setIsMounted(true);
            if (isConnected && isMounted) {
                await loadStoresFromAPI();
            }
        };

        initializeAdmin();
    }, [isConnected, isMounted, loadStoresFromAPI]);

    const handleCreateStore = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);
        setError("");

        try {
            // Validate form data
            if (!formData.storeName.trim()) {
                throw new Error('Store name is required');
            }
            if (!formData.storeSlug.trim()) {
                throw new Error('Store slug is required');
            }

            await storeApi.createStore({
                storeName: formData.storeName,
                storeSlug: formData.storeSlug.toLowerCase().replace(/\s+/g, '-'),
                description: formData.description,
                storeIcon: formData.storeIcon
            });

            handleCloseModal();
            await loadStoresFromAPI(); // Refresh the list
        } catch (err) {
            console.error('Failed to create store:', err);

            if (err instanceof Error) {
                if (err.message.includes('Authentication required') || err.message.includes('UNAUTHORIZED')) {
                    setError('Authentication required. Please make sure you are signed in.');
                } else if (err.message.includes('NETWORK_ERROR')) {
                    setError('Network error. Please check your connection and try again.');
                } else if (err.message.includes('already exists') || err.message.includes('duplicate')) {
                    setError('A store with this name or slug already exists. Please choose a different name.');
                } else {
                    setError(err.message);
                }
            } else {
                setError("Failed to create store. Please try again.");
            }
        } finally {
            setIsCreating(false);
        }
    };

    const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('Image size must be less than 5MB');
            return;
        }

        setIsUploadingIcon(true);
        setError('');

        try {
            console.log('Uploading store icon:', file.name);
            const uploadResult = await uploadApi.uploadStoreIcon(file);
            console.log('Icon uploaded successfully:', uploadResult);

            setFormData({ ...formData, storeIcon: uploadResult.url });
        } catch (err) {
            console.error('Failed to upload icon:', err);
            if (err instanceof Error) {
                setError(`Failed to upload image: ${err.message}`);
            } else {
                setError('Failed to upload image. Please try again.');
            }
        } finally {
            setIsUploadingIcon(false);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setFormData({ storeName: '', storeSlug: '', description: '', storeIcon: '' });
        setError('');
    };

    const getStoreIcon = (store: StoreData) => {
        // Check if icon is a valid URL
        if (store.icon && (store.icon.startsWith('http') || store.icon.startsWith('/'))) {
            return (
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <Image
                        src={store.icon}
                        alt={store.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            // Fallback to initial letter if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                        }}
                    />
                </div>
            );
        }
        return (
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {store.name.charAt(0).toUpperCase()}
            </div>
        );
    };



    // Show wallet connection prompt if not connected
    if (!isConnected) {
        return (
            <div className="flex flex-col h-full min-h-screen w-full bg-gray-50 text-black">
                {/* Top Banner */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-5 px-4 text-center text-xs font-medium">
                    <span className="inline-flex items-center gap-2">
                        <Flame className="w-4 h-4 text-yellow-400" />
                        <span>
                            <strong>Admin Access</strong> Connect your wallet to manage your stores.
                        </span>
                    </span>
                </div>

                {/* Header */}
                <header className="bg-white border-b border-gray-700">
                    <div className="w-full mx-auto px-4 sm:px-8 lg:px-16 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Image src="/Stacks_Store_icon.png" height={60} width={60} className="sm:h-20 sm:w-20" alt="Logo" />
                        </div>
                        <div className="flex items-center gap-2 sm:gap-4">
                            <button
                                onClick={connectWallet}
                                className="px-6 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-500 font-medium"
                            >
                                Connect Wallet
                            </button>
                        </div>
                    </div>
                </header>

                <main className="flex-1 flex items-center justify-center p-8">
                    <div className="text-center bg-white p-8 rounded-xl shadow-lg border border-gray-100 max-w-md w-full">
                        <Store className="mx-auto text-indigo-500 mb-4" size={48} />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect Your Wallet</h2>
                        <p className="text-gray-600 mb-6">You need to connect your Stacks wallet to access the admin dashboard.</p>
                        <button
                            onClick={connectWallet}
                            className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                        >
                            Connect Wallet
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full min-h-screen w-full bg-gray-50 text-black">
            {/* Top Banner */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-5 px-4 text-center text-xs font-medium">
                <span className="inline-flex items-center gap-2">
                    <Flame className="w-4 h-4 text-yellow-400" />
                    <span>
                        <strong>Welcome back!</strong> Ready to manage your stores and grow your business?
                    </span>
                </span>
            </div>

            {/* Header */}
            <header className="bg-white border-b border-gray-700 sticky top-0 z-10">
                <div className="w-full mx-auto px-4 sm:px-8 lg:px-16 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Image src="/Stacks_Store_icon.png" height={60} width={60} className="sm:h-20 sm:w-20" alt="Logo" />
                        <h1 className="font-bold text-xl ml-2 hidden sm:block">My Stores</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm"
                        >
                            <Plus size={18} /> <span className="hidden sm:inline">Create Store</span>
                        </button>
                        <button
                            onClick={logout}
                            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center gap-2 border border-gray-200"
                            title="Logout"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto w-full px-4 py-8">
                {loadError && (
                    <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center justify-between">
                        <div>
                            <p className="font-medium">Error loading stores</p>
                            <p className="text-sm mt-1">{loadError}</p>
                        </div>
                        <button
                            onClick={() => {
                                setLoadError('');
                                loadStoresFromAPI();
                            }}
                            className="text-sm bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded font-medium"
                        >
                            Try again
                        </button>
                    </div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loading />
                    </div>
                ) : stores.length === 0 && !loadError ? (
                    <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-200">
                        <Store className="mx-auto text-gray-400 mb-4" size={48} />
                        <h3 className="text-lg font-medium">No stores yet</h3>
                        <p className="text-gray-500 mb-6">Create your first decentralized storefront to get started.</p>
                        <button onClick={() => setIsModalOpen(true)} className="text-indigo-600 font-bold hover:underline">
                            + Add Store
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {stores.map((store) => (
                            <div key={store.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    {getStoreIcon(store)}
                                    <div>
                                        <h3 className="font-bold text-lg">{store.name}</h3>
                                        <p className="text-sm text-gray-500">stacksmart.com/{store.slug}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Link href={`/${store.slug}`} className="p-2 text-gray-400 hover:text-gray-600"><Eye size={20} /></Link>
                                    <Link href={`/admin/store?store=${store.slug}`} className="bg-gray-100 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                                        Manage
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* CREATE STORE MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-xl font-bold">Launch New Store</h2>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-black">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateStore} className="p-6 space-y-4">
                            {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{error}</div>}

                            {/* Store Icon Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <Camera size={14} /> Store Icon
                                </label>
                                <div className="flex items-center gap-4">
                                    {/* Icon Preview */}
                                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
                                        {formData.storeIcon ? (
                                            <Image
                                                src={formData.storeIcon}
                                                alt="Store icon preview"
                                                width={64}
                                                height={64}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <Store size={24} className="text-gray-400" />
                                        )}
                                    </div>

                                    {/* Upload Button */}
                                    <div className="flex-1">
                                        <input
                                            type="file"
                                            id="store-icon"
                                            accept="image/*"
                                            onChange={handleIconUpload}
                                            className="hidden"
                                        />
                                        <label
                                            htmlFor="store-icon"
                                            className={`inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium cursor-pointer transition-colors ${isUploadingIcon
                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                    : 'bg-white text-gray-700 hover:bg-gray-50'
                                                }`}
                                        >
                                            {isUploadingIcon ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                                                    Uploading...
                                                </>
                                            ) : (
                                                <>
                                                    <Upload size={16} />
                                                    Choose Image
                                                </>
                                            )}
                                        </label>
                                        {formData.storeIcon && (
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, storeIcon: '' })}
                                                className="ml-2 text-sm text-red-600 hover:text-red-800"
                                            >
                                                Remove
                                            </button>
                                        )}
                                        <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB. Recommended: 256x256px</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                    <Store size={14} /> Store Name
                                </label>
                                <input
                                    required
                                    type="text"
                                    placeholder="Blue Chip NFTs"
                                    className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={formData.storeName}
                                    onChange={(e) => {
                                        const name = e.target.value;
                                        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
                                        setFormData({ ...formData, storeName: name, storeSlug: slug });
                                    }}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                    <Globe size={14} /> URL Slug
                                </label>
                                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500">
                                    <span className="bg-gray-50 px-3 text-gray-400 text-sm">/</span>
                                    <input
                                        required
                                        type="text"
                                        placeholder="blue-chip"
                                        className="w-full p-2.5 outline-none"
                                        value={formData.storeSlug}
                                        onChange={(e) => setFormData({ ...formData, storeSlug: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                    <AlignLeft size={14} /> Description
                                </label>
                                <textarea
                                    className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 h-24"
                                    placeholder="Tell the world about your store..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <button
                                disabled={isCreating || isUploadingIcon}
                                type="submit"
                                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isCreating ? "Deploying..." : "Create Store"}
                                <ArrowRight size={18} />
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}