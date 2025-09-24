
import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, User as UserIcon, Lock, ArrowRight, LoaderCircle, UploadCloud, ShieldAlert, ArrowLeft } from 'lucide-react';
import { User } from '../types';

interface LoginSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

const LoginSubscriptionModal: React.FC<LoginSubscriptionModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
    const [activeTab, setActiveTab] = useState<'subscribe' | 'login'>('subscribe');

    // Login State
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    // Subscription State
    const [paymentStep, setPaymentStep] = useState<'pay' | 'upload'>('pay');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [referralCode, setReferralCode] = useState('');
    const [isOptoBharatMember, setIsOptoBharatMember] = useState(false);
    const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
    const [fileError, setFileError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const basePrice = 499;
    const discountedPrice = 199;
    const discount = basePrice - discountedPrice;
    const couponCode = 'OPTOBHARAT60';
    const hasDiscount = referralCode.trim().toUpperCase() === couponCode;
    const finalPrice = hasDiscount ? discountedPrice : basePrice;
    
    const upiLink = `upi://pay?pa=iamsirenjeev@oksbi&pn=Focus%20AI&am=${finalPrice}.00&cu=INR&tn=Focus%20AI%20Subscription%20(1%20Year)`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(upiLink)}&qzone=1`;

    useEffect(() => {
        if (!isOpen) {
            setError('');
            setUsername('');
            setPassword('');
            setFullName('');
            setEmail('');
            setReferralCode('');
            setIsOptoBharatMember(false);
            setPaymentScreenshot(null);
            setFileError('');
            setPaymentStep('pay');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (username === 'Janarthan' && password === 'Jana@0098') {
            const proUser: User = { username: 'Janarthan', tier: 'pro' };
            onLoginSuccess(proUser);
        } else if (username === 'Braseetha@VkMDU' && password === 'Br@seeth@VKMDU') {
            const trialUser: User = { username: 'trialuser', tier: 'trial', trialStartDate: Date.now() };
            onLoginSuccess(trialUser);
        } else if (username === 'Shivashangari' && password === 'ShivaSangari$AI24') {
            const proUser: User = { username: 'Shivashangari', tier: 'pro' };
            onLoginSuccess(proUser);
        } else if (username === 'Hariharan@VK' && password === 'Hariharan202327VK') {
            const proUser: User = { username: 'Megadharshini', tier: 'pro' };
            onLoginSuccess(proUser);
        } else {
            setError('Invalid credentials. Please try again.');
        }
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 8 * 1024 * 1024) { // 8MB limit for Discord
                setFileError("File is too large. Max size is 8MB.");
                setPaymentScreenshot(null);
            } else {
                setPaymentScreenshot(file);
                setFileError('');
            }
        }
    };

    const handleSubmitSubscription = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!paymentScreenshot) {
            setFileError('Please upload a payment screenshot to submit.');
            return;
        }
        
        setFileError('');
        setIsSubmitting(true);
        
        const webhookUrl = 'https://discord.com/api/webhooks/1406601890145243280/_oeG7CKTxIBzQmMs5f7oatitKUxk_xmSDjrqmUScaESBM3H5MzQoDeVzOSCn6iQKlwPa';
        
        const embedPayload = {
            username: "Focus.AI Subscriptions",
            avatar_url: "https://i.imgur.com/8z2aPjT.png",
            embeds: [
                {
                    title: "New Subscription Initiated!",
                    description: hasDiscount ? "✨ **Referred by OPTOBHARAT!** ✨" : "Standard Subscription.",
                    color: hasDiscount ? 3066993 : 5814783, // Green for discount, blue otherwise
                    fields: [
                        { name: "Full Name", value: fullName, inline: true },
                        { name: "Email", value: email, inline: true },
                        { name: "OPTOBHARAT Member", value: isOptoBharatMember ? "Yes" : "No", inline: true },
                        { name: "Coupon Used", value: hasDiscount ? `\`${couponCode}\`` : "None", inline: true },
                        { name: "Final Price", value: `₹${finalPrice.toFixed(2)}`, inline: true },
                    ],
                    timestamp: new Date().toISOString(),
                    footer: { text: "Focus.AI Notification" },
                    image: {
                        url: `attachment://${paymentScreenshot.name}`
                    }
                }
            ]
        };
        
        const formData = new FormData();
        formData.append('payload_json', JSON.stringify(embedPayload));
        formData.append('file1', paymentScreenshot, paymentScreenshot.name);

        try {
            await fetch(webhookUrl, {
                method: 'POST',
                body: formData,
            });
            alert("Your application has been submitted successfully! We will verify your payment and grant you access via email within 24 hours.");
            onClose();
        } catch (error) {
            console.error("Webhook Error:", error);
            alert("There was an error submitting your application. Please try again or contact support.");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const canProceedToUpload = fullName.trim() !== '' && email.trim() !== '' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-2xl shadow-xl w-full max-w-md border border-gray-700 flex flex-col max-h-[90vh] relative overflow-hidden">
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white z-20"><X className="w-6 h-6" /></button>
                
                <div className="p-2 bg-gray-900/50 flex-shrink-0">
                    <div className="flex bg-gray-700/80 rounded-lg p-1 space-x-1">
                        <button onClick={() => setActiveTab('subscribe')} className={`w-full text-center px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${activeTab === 'subscribe' ? 'bg-blue-600 text-white shadow' : 'text-gray-300 hover:bg-gray-600/50'}`}>Subscribe</button>
                        <button onClick={() => setActiveTab('login')} className={`w-full text-center px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${activeTab === 'login' ? 'bg-blue-600 text-white shadow' : 'text-gray-300 hover:bg-gray-600/50'}`}>Login</button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {activeTab === 'subscribe' && (
                        <div className="p-6 space-y-4">
                            {paymentStep === 'pay' && (
                                <>
                                    <h2 className="text-2xl font-bold text-white text-center">Unlock Full Access</h2>
                                    <p className="text-center text-gray-400 text-sm">Join now to get unlimited access to all study tools.</p>
                                    
                                    {/* Form Fields */}
                                    <div className="space-y-3">
                                        <input type="text" placeholder="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} required className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2.5 focus:ring-2 focus:ring-blue-500" />
                                        <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2.5 focus:ring-2 focus:ring-blue-500" />
                                        <label className="flex items-center space-x-2 text-gray-200 p-2 rounded-lg border-2 border-gray-600 cursor-pointer hover:border-blue-500">
                                            <input type="checkbox" checked={isOptoBharatMember} onChange={() => setIsOptoBharatMember(!isOptoBharatMember)} className="h-4 w-4 rounded border-gray-500 bg-gray-700 text-blue-600 focus:ring-blue-500 shrink-0"/>
                                            <span className="text-sm font-medium">I am an OPTOBHARAT member</span>
                                        </label>
                                        {isOptoBharatMember && (
                                            <div className="flex items-start gap-2 text-xs bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 rounded-md p-2">
                                                <ShieldAlert className="w-4 h-4 mt-0.5 flex-shrink-0"/>
                                                <span>Warning: We cross-check OPTOBHARAT membership status, so be aware that you must be a valid member to claim the discount.</span>
                                            </div>
                                        )}
                                        <input type="text" placeholder="Enter Coupon Code" value={referralCode} onChange={(e) => setReferralCode(e.target.value)} className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2.5 focus:ring-2 focus:ring-blue-500" />
                                    </div>

                                    {/* Pricing breakdown */}
                                    <div className="bg-gray-900/50 rounded-lg p-4 space-y-2 text-sm border border-gray-700/50">
                                        <div className="flex justify-between text-gray-300"><span>Base Price</span><span>₹{basePrice.toFixed(2)}</span></div>
                                        <div className={`flex justify-between text-green-400 transition-opacity duration-300 ${hasDiscount ? 'opacity-100' : 'opacity-0'}`}><span>Coupon Applied ({couponCode})</span><span>- ₹{discount.toFixed(2)}</span></div>
                                        <div className="border-t border-gray-600 my-2"></div>
                                        <div className="flex justify-between font-bold text-white text-base"><span>Total (1 Year)</span><span>₹{finalPrice.toFixed(2)}</span></div>
                                    </div>

                                    {/* Payment Section */}
                                    <div className="bg-gray-900/50 rounded-lg p-4 space-y-3">
                                        <h3 className="text-lg font-semibold text-white text-center">Step 1: Complete Payment</h3>
                                        <div className="flex justify-center">
                                            <img src={qrCodeUrl} alt="UPI QR Code" className="rounded-lg bg-white p-1" />
                                        </div>
                                        <p className="text-center text-gray-400 text-xs">Scan the QR code with any UPI app</p>
                                        <a href={upiLink} target="_blank" rel="noopener noreferrer" className="block w-full text-center text-white bg-green-600 hover:bg-green-500 rounded-lg py-2.5 font-bold transition-all">
                                            Or Pay ₹{finalPrice.toFixed(2)} via UPI App
                                        </a>
                                    </div>
                                    
                                    <button 
                                        type="button"
                                        onClick={() => setPaymentStep('upload')} 
                                        disabled={!canProceedToUpload}
                                        className="w-full flex items-center justify-center gap-2 text-white bg-blue-600 hover:bg-blue-500 disabled:bg-gray-500 disabled:cursor-not-allowed rounded-lg px-5 py-3 text-base font-bold transition-all"
                                    >
                                        Step 2: Upload Screenshot
                                        <ArrowRight size={20} />
                                    </button>
                                    {!canProceedToUpload && <p className="text-xs text-center text-gray-500">Please fill in your name and a valid email to proceed.</p>}
                                </>
                            )}
                            
                            {paymentStep === 'upload' && (
                                <form onSubmit={handleSubmitSubscription} className="space-y-4">
                                    <h2 className="text-2xl font-bold text-white text-center">Almost There!</h2>
                                    <p className="text-center text-gray-400 text-sm">Please upload your payment screenshot to complete your subscription.</p>

                                    <div className="bg-gray-900/50 rounded-lg p-4 my-4 space-y-3">
                                        <h3 className="text-lg font-semibold text-white text-center">Final Step: Submit Proof</h3>
                                        <div>
                                            <label htmlFor="payment-screenshot" className="block text-sm font-medium text-gray-300 mb-2">
                                                Upload Payment Screenshot <span className="text-red-400">*</span>
                                            </label>
                                            <div className="flex items-center gap-3 p-2 rounded-lg border-2 border-dashed border-gray-600">
                                                <label htmlFor="payment-screenshot" className="cursor-pointer bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-3 rounded-md text-sm inline-flex items-center gap-2">
                                                    <UploadCloud size={16}/> Choose File
                                                </label>
                                                <input id="payment-screenshot" type="file" className="hidden" accept="image/png, image/jpeg, image/jpg" onChange={handleFileChange} />
                                                <span className="text-gray-400 text-sm truncate flex-1">{paymentScreenshot ? paymentScreenshot.name : 'No file chosen'}</span>
                                            </div>
                                            {fileError && <p className="text-red-400 text-xs mt-1">{fileError}</p>}
                                        </div>
                                    </div>
                                    
                                    <div className="flex gap-3 mt-4">
                                        <button type="button" onClick={() => setPaymentStep('pay')} className="w-1/3 flex items-center justify-center gap-2 text-white bg-gray-600 hover:bg-gray-500 rounded-lg px-5 py-3 font-bold transition-all">
                                            <ArrowLeft size={20} /> Back
                                        </button>
                                        <button type="submit" disabled={isSubmitting || !paymentScreenshot} className="w-2/3 flex items-center justify-center gap-2 text-white bg-green-600 hover:bg-green-500 disabled:bg-gray-500 disabled:cursor-not-allowed rounded-lg px-5 py-3 text-base font-bold transition-all">
                                            {isSubmitting ? <LoaderCircle className="animate-spin" size={20}/> : 'Submit Application'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}
                    
                    {activeTab === 'login' && (
                        <div className="p-6">
                            <h2 className="text-2xl font-bold text-white text-center">Welcome Back!</h2>
                            <p className="text-center text-gray-400 text-sm mb-6">Log in to access your account.</p>
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div className="relative">
                                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                                    <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required className="w-full bg-gray-700 border border-gray-600 text-white rounded-md py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-blue-500"/>
                                </div>
                                <div className="relative">
                                     <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                                     <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-gray-700 border border-gray-600 text-white rounded-md py-2.5 pl-10 pr-10 focus:ring-2 focus:ring-blue-500"/>
                                     <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                                        {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
                                     </button>
                                </div>
                                {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                                <button type="submit" className="w-full text-white bg-blue-700 hover:bg-blue-600 rounded-lg px-5 py-3 font-bold transition-all">
                                    Login
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LoginSubscriptionModal;
