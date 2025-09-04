
import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
// FIX: Changed import to a named import because ChatPage does not have a default export.
import { ChatPage } from './components/ChatPage';
import LoadingScreen from './components/LoadingScreen';
import LoginSubscriptionModal from './components/LoginSubscriptionModal';
import FreeTrialModal from './components/FreeTrialModal'; // Import the modal
import { User } from './types';
import { X } from 'lucide-react';

// Announcement Bar Component
const AnnouncementBar = ({ onDismiss, onOpenTrialModal }) => (
  <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-3 text-center text-sm font-semibold relative flex items-center justify-center">
    <span className="hidden sm:inline">✨</span>
    <p className="mx-4">
      Get your free trial for seven days!
      <button onClick={onOpenTrialModal} className="ml-2 underline font-bold hover:text-blue-200 transition">
        Join the waitlist &rarr;
      </button>
    </p>
    <span className="hidden sm:inline">✨</span>
    <button onClick={onDismiss} className="absolute right-4 p-1 hover:bg-white/20 rounded-full">
      <X size={18} />
    </button>
  </div>
);


const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [isTrialModalOpen, setIsTrialModalOpen] = useState(false);
  const [isAnnouncementBarVisible, setIsAnnouncementBarVisible] = useState(false);


  useEffect(() => {
    // Check for announcement bar dismissal status
    try {
        const hasDismissed = localStorage.getItem('focus-ai-dismissed-announcement');
        if (!hasDismissed) {
            setIsAnnouncementBarVisible(true);
        }
    } catch (error) {
        console.error("Could not access local storage for announcement:", error);
    }
    
    // Simulate initial asset loading and check login status
    const timer = setTimeout(() => {
        try {
            const storedUser = localStorage.getItem('focus-ai-user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error("Could not access local storage:", error);
        }
        setIsInitializing(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleLoginSuccess = (loggedInUser: User) => {
    try {
        // For trial users, preserve their original start date on subsequent logins
        const storedUserStr = localStorage.getItem('focus-ai-user');
        if (loggedInUser.tier === 'trial' && storedUserStr) {
            const storedUser = JSON.parse(storedUserStr);
            if (storedUser.username === loggedInUser.username && storedUser.trialStartDate) {
                loggedInUser.trialStartDate = storedUser.trialStartDate;
            }
        }
        localStorage.setItem('focus-ai-user', JSON.stringify(loggedInUser));
        setUser(loggedInUser);
        setIsSubscriptionModalOpen(false); // Close modal on any successful login/subscription
    } catch (error) {
        console.error("Could not set item in local storage:", error);
        // Fallback for private browsing or other restrictions
        setUser(loggedInUser);
    }
  };
  
  const handleLogout = () => {
      try {
        localStorage.removeItem('focus-ai-user');
      } catch (error) {
          console.error("Could not remove item from local storage:", error);
      }
      setUser(null);
  }

  const handleDismissAnnouncement = () => {
    setIsAnnouncementBarVisible(false);
    try {
        localStorage.setItem('focus-ai-dismissed-announcement', 'true');
    } catch (error) {
        console.error("Could not set item in local storage:", error);
    }
  };

  if (isInitializing) {
    return <LoadingScreen />;
  }

  return (
    <>
      {!user && isAnnouncementBarVisible && (
        <AnnouncementBar 
            onDismiss={handleDismissAnnouncement} 
            onOpenTrialModal={() => setIsTrialModalOpen(true)}
        />
      )}
      <FreeTrialModal 
        isOpen={isTrialModalOpen} 
        onClose={() => setIsTrialModalOpen(false)} 
      />
      <LoginSubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
      <div className="bg-gray-900 text-white min-h-screen font-sans antialiased">
          {user ? (
              <ChatPage user={user} onLogout={handleLogout} onSubscribe={() => setIsSubscriptionModalOpen(true)} />
          ) : (
              <LandingPage 
                  onLoginSuccess={handleLoginSuccess} 
                  onSubscribe={() => setIsSubscriptionModalOpen(true)}
                  onOpenTrialModal={() => setIsTrialModalOpen(true)}
              />
          )}
      </div>
    </>
  );
};

export default App;
