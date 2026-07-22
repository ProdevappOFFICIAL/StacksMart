'use client'
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Plus, Minus, X, Wallet, Mail, ArrowLeft, Loader2, ShoppingCart } from 'lucide-react';
import { useCart, CartItem } from '@/hooks/useCart';
import { useStacksWallet } from '@/hooks/useStacksWallet';
import { storeApi } from '@/lib/api';
import Image from 'next/image';

interface CheckoutData {
    orderId: string;
    orderNumber: string;
    amount: string;
    currency: string;
    txId: string;
    product: {
        id: string;
        name: string;
        price: string;
    };
    store: {
        id: string;
        name: string;
    };
}

interface PaymentStatus {
    orderId: string;
    orderNumber: string;
    status: "pending" | "completed" | "failed";
    amount: string;
    currency: string;
    paymentURL: string;
    expiresAt: string;
    transactionSignature?: string | null;
    items: Array<{
        product: {
            id: string;
            name: string;
            price: string;
        };
        quantity: number;
        price: string;
    }>;
    createdAt: string;
    updatedAt: string;
}

type CheckoutStep = 'form' | 'processing' | 'payment' | 'verifying' | 'success' | 'failed';

export default function CheckoutPage() {
    const params = useParams();
    const router = useRouter();
    const storeSlug = params.storeSlug as string;

    const { cart, getStoreItems, updateQuantity, removeFromCart, clearCart } = useCart();
    const { isConnected, walletAddress, connectWallet, disconnectWallet, isConnecting, error: walletError } = useStacksWallet({ autoConnect: false });

    // Form state
    const [customerEmail, setCustomerEmail] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [storeData, setStoreData] = useState<{ id: string; name: string; owner: { walletAddress: string } } | null>(null);
    const [items, setItems] = useState<CartItem[]>([]);
    const [isCartLoaded, setIsCartLoaded] = useState(false);

    // Checkout flow state
    const [currentStep, setCurrentStep] = useState<CheckoutStep>('form');
    const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
    const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);

    // Polling refs
    const statusPollingRef = useRef<NodeJS.Timeout | null>(null);
    const countdownRef = useRef<NodeJS.Timeout | null>(null);

    // Get items for this store
    useEffect(() => {
        const storeItems = getStoreItems(storeSlug);
        setItems(storeItems);
        setIsCartLoaded(true);
        console.log('Store items for checkout:', storeItems);
    }, [storeSlug, getStoreItems, cart]);

    // Load store data
    useEffect(() => {
        const loadStoreData = async () => {
            try {
                const store = await storeApi.getStoreBySlug(storeSlug);
                setStoreData(store);
            } catch (err) {
                console.error('Failed to load store data:', err);
                setError('Failed to load store information');
            }
        };

        loadStoreData();
    }, [storeSlug]);

    // Redirect if no items (only after cart is loaded)
    useEffect(() => {
        if (isCartLoaded && items.length === 0) {
            console.log('No items in cart, redirecting to store page');
            router.push(`/${storeSlug}`);
        }
    }, [items.length, router, storeSlug, isCartLoaded]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (statusPollingRef.current) {
                clearInterval(statusPollingRef.current);
            }
            if (countdownRef.current) {
                clearInterval(countdownRef.current);
            }
        };
    }, []);

    const itemsTotal = items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
    const total = itemsTotal;

    const formatCurrency = (amount: number, currency: string = 'STX') => {
        const base = `${amount.toFixed(2)} ${currency}`;
        if (currency === 'STX') {
            const naira = (amount * 227.81).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            return (
                <span className="inline-flex items-center gap-1">
                    {base}
                    <span className="text-gray-500 text-xs font-normal">(~₦{naira})</span>
                </span>
            );
        }
        return base;
    };

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleRetryPayment = () => {
        setCurrentStep('form');
        setCheckoutData(null);
        setPaymentStatus(null);
        setError(null);
        if (statusPollingRef.current) {
            clearInterval(statusPollingRef.current);
            statusPollingRef.current = null;
        }
        if (countdownRef.current) {
            clearInterval(countdownRef.current);
        }
    };

    ;

    const handlePlaceOrder = async () => {
        // Reset error state
        setError(null);

        // Validation checks
        if (!storeData || !storeData.owner?.walletAddress) {
            setError('Store configuration error: missing wallet address');
            return;
        }

        if (!isConnected || !walletAddress) {
            setError('Please connect your wallet to continue');
            return;
        }

        if (items.length === 0) {
            setError('No items in cart');
            return;
        }

        if (!customerEmail.trim()) {
            setError('Please enter your email address');
            return;
        }

        if (!validateEmail(customerEmail.trim())) {
            setError('Please enter a valid email address');
            return;
        }

        setCurrentStep('processing');

        try {
            // For now, we'll handle single item checkout
            // In a real implementation, you might want to create separate orders for each item
            const firstItem = items[0];

            // 1. Prepare Stacks transaction
            const amountInMicroStx = Math.floor(parseFloat(firstItem.price) * firstItem.quantity * 1000000).toString();
            const tempOrderRef = `Order-${Date.now()}`;

            console.log('Starting direct Stacks payment flow...');

            let txId = '';
            try {
                const { request } = await import('@stacks/connect');
                const response = await request('stx_transferStx', {
                    recipient: storeData.owner.walletAddress,
                    amount: amountInMicroStx,
                    memo: tempOrderRef,
                    network: 'testnet' // Hardcoded based on plan
                });

                const txResponse = response as { txid?: string; txId?: string };
                console.log('Transaction ID:', txResponse.txid || txResponse.txId);
                txId = txResponse.txid || txResponse.txId || '';
            } catch (err) {
                console.error('Stacks payment error:', err);
                setError(err instanceof Error ? err.message : 'Failed to complete Stacks payment');
                setCurrentStep('failed');
                return;
            }

            // 2. Create the order in the backend as PENDING with the txId
            try {
                const order = await storeApi.createOrder(storeData.id, {
                    productId: firstItem.id,
                    quantity: firstItem.quantity,
                    customerWallet: walletAddress,
                    customerEmail: customerEmail.trim(),
                    currency: (firstItem.currency as "STX" | "USDCX") || 'STX',
                    paymentTxHash: txId
                });

                setCheckoutData({
                    orderId: order.id,
                    orderNumber: order.orderId,
                    amount: order.amount,
                    currency: order.currency,
                    txId: order.paymentTxHash,
                    product: {
                        id: firstItem.id,
                        name: firstItem.name,
                        price: firstItem.price
                    },
                    store: {
                        id: storeData.id,
                        name: storeData.name
                    }
                });

                // Move to verifying step
                setCurrentStep('verifying');
            } catch (err) {
                console.error('Failed to create order in backend:', err);
                setError('Payment submitted but failed to create order. Please contact support with TxID: ' + txId);
                setCurrentStep('failed');
            }

        } catch (err) {
            console.error('Checkout error:', err);
            let errorMessage = 'Failed to create checkout session';

            if (err instanceof Error) {
                errorMessage = err.message;
            }

            setError(errorMessage);
            setCurrentStep('form');
        }
    };

    // Show loading state while cart or store data is loading
    if (!isCartLoaded || (!storeData && !error)) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
                    <p className="text-gray-600">
                        {!isCartLoaded ? 'Loading cart...' : 'Loading store information...'}
                    </p>
                </div>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-sm font-semibold text-gray-900 mb-2">No items in cart</h2>
                    <p className="text-gray-600 mb-4">Add some items to your cart before checking out</p>
                    <button
                        onClick={() => router.push(`/${storeSlug}`)}
                        className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                        Continue Shopping
                    </button>
                </div>
            </div>
        );
    }

    // Render functions for each step
    const renderProcessing = () => (
        <main className="p-4 space-y-6 pb-24 flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Processing Payment in Wallet</h2>
                <p className="text-gray-600">Please approve the transaction in your Stacks wallet...</p>
            </div>
        </main>
    );

    const handleVerifyOrder = async () => {
        if (!checkoutData || !storeData) return;
        setIsVerifying(true);
        try {
            const res = await storeApi.verifyOrder(storeData.id, checkoutData.orderId);
            if (res.status === 'completed') {
                clearCart();
                setCurrentStep('success');
                setTimeout(() => {
                    router.push(`/${storeSlug}/success?orderId=${checkoutData.orderId}&orderNumber=${checkoutData.orderNumber}`);
                }, 2000);
            } else if (res.status === 'failed') {
                setError('Payment failed or was aborted on-chain.');
                setCurrentStep('failed');
            } else {
                // Still pending
                alert('Transaction is still pending on the blockchain. Please try again in a few moments.');
            }
        } catch (err) {
            console.error('Verification error:', err);
            alert('Error verifying payment. Please try again.');
        } finally {
            setIsVerifying(false);
        }
    };

    const renderVerifyingStep = () => (
        <main className="p-4 space-y-6 pb-24">
            <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Verifying your payment</h2>
                <p className="text-gray-600 mb-6">
                    Your transaction has been submitted. It may take a few minutes to confirm on the blockchain.
                </p>

                {checkoutData && (
                    <div className="bg-gray-50 rounded-lg p-4 space-y-4 mb-6">
                        <div className="text-center">
                            <div className="text-sm text-gray-600">
                                Order: {checkoutData.orderNumber}
                            </div>
                            <div className="text-xs text-gray-500 mt-1 break-all">
                                TxID: {checkoutData.txId}
                            </div>
                        </div>
                    </div>
                )}

                <button
                    onClick={handleVerifyOrder}
                    disabled={isVerifying}
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    {isVerifying ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Checking...
                        </>
                    ) : 'Check Status'}
                </button>
            </div>
        </main>
    );

    const renderSuccess = () => (
        <main className="p-4 space-y-6 pb-24 flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Payment Successful!</h2>
                <p className="text-gray-600 mb-4">
                    Your payment has been confirmed. Redirecting to success page...
                </p>
                {paymentStatus && (
                    <div className="text-sm text-gray-500">
                        Order: {paymentStatus.orderNumber}
                    </div>
                )}
            </div>
        </main>
    );

    const renderFailed = () => (
        <main className="p-4 space-y-6 pb-24">
            <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <X className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Payment Failed</h2>
                <p className="text-gray-600 mb-6">
                    {error || 'Your payment could not be processed. Please try again.'}
                </p>

                <div className="space-y-3">
                    <button
                        onClick={handleRetryPayment}
                        className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
                    >
                        Try Again
                    </button>
                    <button
                        onClick={() => router.push(`/${storeSlug}`)}
                        className="w-full h-12 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-lg transition-colors"
                    >
                        Back to Store
                    </button>
                </div>
            </div>
        </main>
    );

    const renderCheckoutForm = () => (
        <main className="p-4 space-y-6 pb-24">
            {/* Error Display */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800 text-xs">{error}</p>
                </div>
            )}

            {/* Wallet Connection Section */}
            <section className="space-y-4">
                <h2 className="text-xs font-medium text-gray-900">Wallet Connection</h2>

                {!isConnected ? (
                    <div className="border border-gray-300 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-3">
                            <Wallet className="w-5 h-5 text-gray-600" />
                            <span className="text-xs font-medium text-gray-900">Connect Wallet</span>
                        </div>
                        <p className="text-xs text-gray-600 mb-3">
                            Connect your Stacks wallet to complete the purchase
                        </p>
                        <button
                            onClick={connectWallet}
                            disabled={isConnecting}
                            className="w-full h-11 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            {isConnecting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Connecting...
                                </>
                            ) : (
                                <>
                                    <Wallet className="w-4 h-4" />
                                    Connect Stacks Wallet
                                </>
                            )}
                        </button>
                        {walletError && (
                            <p className="text-red-600 text-xs mt-2">{walletError}</p>
                        )}
                    </div>
                ) : (
                    <div className="border border-green-300 bg-green-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Wallet className="w-5 h-5 text-green-600" />
                                <div>
                                    <span className="text-xs font-medium text-green-900">Wallet Connected</span>
                                    <p className="text-xs text-green-700 font-mono">
                                        {walletAddress?.slice(0, 8)}...{walletAddress?.slice(-8)}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={disconnectWallet}
                                className="px-3 py-1.5 bg-green-100 text-green-700 hover:bg-green-200 text-xs font-medium rounded transition-colors"
                            >
                                Disconnect
                            </button>
                        </div>
                    </div>
                )}
            </section>

            {/* Customer Email Section */}
            <section className="space-y-4">
                <h2 className="text-xs font-medium text-gray-900">Customer Information</h2>

                <div className="space-y-2">
                    <label htmlFor="email" className="text-xs text-gray-700">
                        Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            id="email"
                            type="email"
                            value={customerEmail}
                            onChange={(e) => {
                                setCustomerEmail(e.target.value);
                                // Clear error when user starts typing
                                if (error && error.includes('email')) {
                                    setError(null);
                                }
                            }}
                            placeholder="your@email.com"
                            className={`w-full h-11 pl-10 pr-3 border rounded-lg focus:ring-2 focus:border-transparent transition-colors ${error && error.includes('email')
                                ? 'border-red-300 focus:ring-red-500'
                                : 'border-gray-300 focus:ring-purple-500'
                                }`}
                            required
                        />
                    </div>
                    <p className="text-xs text-gray-500">
                        We&apos;ll send your purchase confirmation and download links to this email
                    </p>
                </div>
            </section>

            {/* Items Section */}
            <section className="space-y-4">
                <h2 className="text-xs font-medium text-gray-900">Order Items</h2>

                <div className="space-y-3">
                    {items.map((item) => (
                        <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <div className="text-xs font-medium text-gray-900">{item.name}</div>
                                    <div className="text-xs font-semibold text-purple-600 mt-0.5">
                                        {formatCurrency(parseFloat(item.price), item.currency)}
                                    </div>
                                    {item.image && (
                                        <Image
                                            src={item.image}
                                            alt={item.name}
                                            width={64}
                                            height={64}
                                            className="w-16 h-16 object-cover rounded mt-2"
                                        />
                                    )}
                                </div>
                                <button
                                    onClick={() => removeFromCart(item.id)}
                                    className="h-8 w-8 -mt-1 -mr-1 rounded-full hover:bg-gray-100 transition-colors flex items-center justify-center"
                                >
                                    <X className="w-4 h-4 text-gray-600" />
                                </button>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    disabled={item.quantity <= 1}
                                    className="h-8 w-8 border border-gray-300 rounded hover:bg-gray-50 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <span className="text-xs font-medium text-gray-900 w-8 text-center">
                                    {item.quantity}
                                </span>
                                <button
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    className="h-8 w-8 border border-gray-300 rounded hover:bg-gray-50 transition-colors flex items-center justify-center"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Order Summary */}
            <section className="space-y-3 pt-2">
                <h2 className="text-xs font-medium text-gray-900">Order Summary</h2>

                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-600">
                            Items ({items.reduce((sum, item) => sum + item.quantity, 0)})
                        </span>
                        <span className="text-gray-900 font-medium">
                            {formatCurrency(itemsTotal, items[0]?.currency || 'STX')}
                        </span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Platform Fee</span>
                        <span className="text-gray-900 font-medium">{formatCurrency(0, 'STX')}</span>
                    </div>
                    <div className="flex justify-between text-xs pt-2 border-t border-gray-200">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="text-gray-900 font-medium">
                            {formatCurrency(itemsTotal, items[0]?.currency || 'STX')}
                        </span>
                    </div>
                </div>
            </section>

            {/* Total */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex justify-between items-center">
                    <span className="text-base font-semibold text-gray-900">Total</span>
                    <span className="text-lg font-bold text-purple-600">
                        {formatCurrency(total, items[0]?.currency || 'SOL')}
                    </span>
                </div>
            </div>
        </main>
    );

    // Render different steps based on current step
    const renderStepContent = () => {
        switch (currentStep) {
            case 'form':
                return renderCheckoutForm();
            case 'processing':
                return renderProcessing();
            case 'verifying':
                return renderVerifyingStep();
            case 'success':
                return renderSuccess();
            case 'failed':
                return renderFailed();
            default:
                return renderCheckoutForm();
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 text-black">
            <div className="max-w-md mx-auto bg-white min-h-screen border border-gray-400">
                {/* Header */}
                <header className="flex items-center justify-between p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => currentStep === 'form' ? router.back() : handleRetryPayment()}
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <div>
                            <div className="text-xs text-gray-500">
                                {currentStep === 'form' && 'Checkout'}
                                {currentStep === 'processing' && 'Processing'}
                                {currentStep === 'verifying' && 'Verifying'}
                                {currentStep === 'payment' && 'Payment'}
                                {currentStep === 'success' && 'Success'}
                                {currentStep === 'failed' && 'Failed'}
                            </div>
                            <div className="text-sm font-bold text-gray-900">
                                {storeData?.name || 'Store'}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Step Content */}
                {renderStepContent()}

                {/* Footer Button - Only show on form step */}
                {currentStep === 'form' && (
                    <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-gray-300 border-t border-gray-200">
                        <button
                            onClick={handlePlaceOrder}
                            disabled={!isConnected || !customerEmail.trim()}
                            className="w-full h-12 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            Place Order & Pay {formatCurrency(total, items[0]?.currency || 'STX')}
                        </button>

                        {!isConnected && (
                            <p className="text-xs text-gray-500 text-center mt-2">
                                Connect your wallet to continue
                            </p>
                        )}

                        {isConnected && !customerEmail.trim() && (
                            <p className="text-xs text-gray-500 text-center mt-2">
                                Enter your email address to continue
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}