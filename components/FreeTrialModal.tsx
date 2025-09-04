
import React, { useState } from 'react';
import { X, User, Mail, LoaderCircle, CheckCircle, Book, MapPin, Calendar } from 'lucide-react';

interface FreeTrialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const roles = ["Student (B.Sc Optometry)", "Student (M.Sc Optometry)", "Student (PhD)", "Practicing Optometrist", "Lecturer/Educator", "Other"];
const regions = ["North India", "South India", "East India", "West India", "Central India", "Northeast India"];
const years = ["1st Year", "2nd Year", "3rd Year", "4th Year / Intern", "Postgraduate"];

const FreeTrialModal: React.FC<FreeTrialModalProps> = ({ isOpen, onClose }) => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('');
    const [yearOfStudy, setYearOfStudy] = useState('');
    const [region, setRegion] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const isStudent = role.toLowerCase().includes('student');
    
    const canSubmit = () => {
        if (!fullName.trim() || !email.trim() || !role || !region) return false;
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return false;
        if (isStudent && !yearOfStudy) return false;
        return true;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit()) {
            setError('Please fill in all required fields with valid information.');
            return;
        }
        
        setError('');
        setIsSubmitting(true);

        const webhookUrl = 'https://discord.com/api/webhooks/1406601893433839627/lKJwxqJtOnuMBfulYNL0gwvFCnMckB8ulfQwHYIWiiIn11YIUxBq_uvjul6mFqUJnfLB';
        
        const embedFields = [
            { name: "👤 Full Name", value: fullName, inline: true },
            { name: "✉️ Email", value: email, inline: true },
            { name: "🎓 Role/Level", value: role, inline: false },
        ];

        if (isStudent) {
            embedFields.push({ name: "🗓️ Year of Study", value: yearOfStudy, inline: true });
        }
        
        embedFields.push({ name: "📍 Region", value: region, inline: true });

        const embedPayload = {
            username: "Focus.AI Waitlist Bot",
            avatar_url: "https://i.imgur.com/8z2aPjT.png",
            embeds: [
                {
                    title: "📬 New Waitlist Signup!",
                    description: "A new user has requested to join the free trial waitlist.",
                    color: 3447003, // A nice blue
                    fields: embedFields,
                    timestamp: new Date().toISOString(),
                    footer: { text: "Focus.AI Waitlist Notification" },
                }
            ]
        };

        try {
            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(embedPayload),
            });
            if (!response.ok) {
                throw new Error('Failed to submit request.');
            }
            setIsSuccess(true);
        } catch (error) {
            console.error("Webhook Error:", error);
            setError("There was an error submitting your request. Please try again later.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setIsSuccess(false);
        setFullName('');
        setEmail('');
        setRole('');
        setYearOfStudy('');
        setRegion('');
        setError('');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-2xl shadow-xl w-full max-w-md border border-gray-700 flex flex-col max-h-[90vh] relative">
                <button onClick={handleClose} className="absolute top-3 right-3 text-gray-400 hover:text-white z-20"><X className="w-6 h-6" /></button>
                
                <div className="flex-1 overflow-y-auto p-6">
                    {isSuccess ? (
                        <div className="text-center py-8">
                            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-white">You're on the list!</h2>
                            <p className="text-gray-300 my-4">Thank you for your interest. We'll send you an email with your trial login details as soon as they're ready.</p>
                            <button onClick={handleClose} className="w-full mt-2 text-white bg-blue-600 hover:bg-blue-500 rounded-lg px-5 py-3 font-bold transition-all">
                                Close
                            </button>
                        </div>
                    ) : (
                        <>
                            <h2 className="text-2xl font-bold text-white text-center">Join the Waitlist for a Free Trial</h2>
                            <p className="text-center text-gray-400 text-sm mt-2 mb-6">Get 7 days of full access to Focus.AI, on us. Tell us a bit about yourself to join.</p>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                                    <input type="text" placeholder="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} required className="w-full bg-gray-700 border border-gray-600 text-white rounded-md py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-blue-500"/>
                                </div>
                                <div className="relative">
                                     <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                                     <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-gray-700 border border-gray-600 text-white rounded-md py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-blue-500"/>
                                </div>
                                
                                <div className="relative">
                                    <Book className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                                    <select value={role} onChange={e => setRole(e.target.value)} required className="w-full bg-gray-700 border border-gray-600 text-white rounded-md py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-blue-500 appearance-none">
                                        <option value="" disabled>Current Role/Study Level</option>
                                        {roles.map(r => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                </div>

                                {isStudent && (
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                                        <select value={yearOfStudy} onChange={e => setYearOfStudy(e.target.value)} required className="w-full bg-gray-700 border border-gray-600 text-white rounded-md py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-blue-500 appearance-none">
                                            <option value="" disabled>Year of Study</option>
                                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                                        </select>
                                    </div>
                                )}
                                
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                                    <select value={region} onChange={e => setRegion(e.target.value)} required className="w-full bg-gray-700 border border-gray-600 text-white rounded-md py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-blue-500 appearance-none">
                                        <option value="" disabled>Region in India</option>
                                        {regions.map(r => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                </div>
                                
                                {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                                <button type="submit" disabled={isSubmitting || !canSubmit()} className="w-full flex items-center justify-center gap-2 text-white bg-blue-700 hover:bg-blue-600 disabled:bg-gray-500 disabled:cursor-not-allowed rounded-lg px-5 py-3 text-base font-bold transition-all">
                                    {isSubmitting ? <LoaderCircle className="animate-spin" size={20}/> : 'Join Waitlist'}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FreeTrialModal;