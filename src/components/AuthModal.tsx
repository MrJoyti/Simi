import React, { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  User,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { CuteAvatar, AVATAR_LIST } from '../utils/avatars';
import { UserProfile, UserGender } from '../types/chat';
import { sounds } from '../utils/sound';
import {
  Mail,
  Lock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  LogOut,
  KeyRound,
  Shield,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AuthModalProps {
  onSuccess: (profile: UserProfile) => void;
  unverifiedUser?: User | null;
  onSignOut?: () => void;
  existingProfileMissingGender?: UserProfile | null;
}

const GoogleIcon = () => (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

export const AuthModal: React.FC<AuthModalProps> = ({
  onSuccess,
  unverifiedUser,
  onSignOut,
  existingProfileMissingGender,
}) => {
  const [mode, setMode] = useState<'register' | 'login' | 'forgot' | 'complete_google' | 'complete_missing_gender'>(
    existingProfileMissingGender ? 'complete_missing_gender' : 'register'
  );
  const [selectedGender, setSelectedGender] = useState<UserGender | null>(
    existingProfileMissingGender?.gender || null
  );

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [avatarId, setAvatarId] = useState('bunny');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Google pending state if gender needs to be selected
  const [pendingGoogleData, setPendingGoogleData] = useState<{
    uid: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    emailVerified?: boolean;
  } | null>(null);

  // Email verification state
  const [resendingVerification, setResendingVerification] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  // Directly register the profile into Firestore database with selected gender and theme
  const registerProfileToDatabase = async (
    targetUid: string,
    targetEmail: string,
    isEmailVerified: boolean,
    genderChoice: UserGender,
    customPhotoUrl?: string
  ) => {
    const cleanUsername = (username.trim() || targetEmail.split('@')[0])
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '');

    const isMale = genderChoice === 'male';

    const userProfile: UserProfile = {
      id: targetUid,
      name: name.trim() || (isMale ? 'Commander' : 'Sweetie'),
      username: cleanUsername,
      email: targetEmail.trim(),
      gender: genderChoice,
      emailVerified: isEmailVerified,
      avatarId: isMale ? 'wolf' : avatarId,
      customAvatarUrl: customPhotoUrl,
      bio: isMale ? 'Live on MochiChat ⚡' : 'Happy sweetie chatting live on MochiChat 🌸',
      moodEmoji: isMale ? '⚡' : '🌸',
      moodText: 'Active now',
      theme: isMale ? 'midnight' : 'strawberry',
      chatPattern: isMale ? 'midnight_grid' : 'mochi_dots',
      status: 'online',
      badge: isMale ? '⚡ Midnight Member' : '✨ Verified Member',
      soundEnabled: true,
      createdAt: Date.now(),
      lastSeen: Date.now(),
    };

    // Store in Firestore users collection
    const userDocRef = doc(db, 'users', targetUid);
    await setDoc(userDocRef, userProfile, { merge: true });

    // Store in localStorage for instant persistent session
    try {
      localStorage.setItem('mochichat_active_user_uid', targetUid);
      localStorage.setItem('mochichat_profile_cache', JSON.stringify(userProfile));
    } catch {
      // ignore
    }

    sounds.playReceive();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
    });

    onSuccess(userProfile);
  };

  // Handle Google Sign-In Popup Authentication
  const handleGoogleSignIn = async () => {
    setError(null);
    setInfoMessage(null);
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user profile already exists in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userDocRef);

      if (snap.exists()) {
        const existingProfile = snap.data() as UserProfile;

        // If existing profile is missing gender, prompt gender selection step
        if (!existingProfile.gender) {
          setPendingGoogleData({
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || undefined,
            photoURL: user.photoURL || undefined,
            emailVerified: user.emailVerified ?? true,
          });
          setName(existingProfile.name || user.displayName || '');
          setUsername(existingProfile.username || '');
          setMode('complete_google');
          setLoading(false);
          return;
        }

        const updatedProfile: UserProfile = {
          ...existingProfile,
          status: 'online',
          lastSeen: Date.now(),
        };
        await setDoc(userDocRef, updatedProfile, { merge: true });

        try {
          localStorage.setItem('mochichat_active_user_uid', user.uid);
          localStorage.setItem('mochichat_profile_cache', JSON.stringify(updatedProfile));
        } catch {
          // ignore
        }

        sounds.playSend();
        onSuccess(updatedProfile);
      } else {
        // New Google user: Require gender selection step before saving profile
        setPendingGoogleData({
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || undefined,
          photoURL: user.photoURL || undefined,
          emailVerified: user.emailVerified ?? true,
        });
        setName(user.displayName || user.email?.split('@')[0] || '');
        setUsername((user.email?.split('@')[0] || `user_${user.uid.slice(0, 6)}`).toLowerCase().replace(/[^a-z0-9_]/g, ''));
        setMode('complete_google');
        setLoading(false);
      }
    } catch (err: unknown) {
      const fbErr = err as { code?: string; message?: string };
      let msg = fbErr.message || 'Google Sign-In failed. Please try again.';

      if (fbErr.code === 'auth/popup-closed-by-user') {
        msg = 'Google Sign-In popup was closed before completing.';
      } else if (fbErr.code === 'auth/popup-blocked') {
        msg = 'Sign-in popup was blocked by browser. Please allow popups for this site.';
      } else if (fbErr.code === 'auth/cancelled-popup-request') {
        msg = 'Sign-in popup request was cancelled.';
      } else if (fbErr.code === 'auth/account-exists-with-different-credential') {
        msg = 'An account already exists with the same email address using a different sign-in method.';
      } else if (fbErr.code === 'auth/operation-not-allowed') {
        msg = 'Google Sign-In is not enabled in your Firebase Console project.';
      } else if (fbErr.code === 'auth/unauthorized-domain') {
        msg = 'This domain is not authorized for Google Sign-In in your Firebase Console.';
      }

      setError(msg);
      setLoading(false);
    }
  };

  // Submit complete Google registration after selecting gender
  const handleCompleteGoogleProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGender) {
      setError('Please select your gender to continue.');
      return;
    }
    if (!pendingGoogleData) return;

    setLoading(true);
    setError(null);

    await registerProfileToDatabase(
      pendingGoogleData.uid,
      pendingGoogleData.email,
      pendingGoogleData.emailVerified ?? true,
      selectedGender,
      pendingGoogleData.photoURL
    );
    setLoading(false);
  };

  // Submit completion for existing user missing gender
  const handleCompleteMissingGender = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGender) {
      setError('Please select your gender to continue.');
      return;
    }
    if (!existingProfileMissingGender) return;

    setLoading(true);
    setError(null);

    const isMale = selectedGender === 'male';
    const updated: UserProfile = {
      ...existingProfileMissingGender,
      gender: selectedGender,
      theme: isMale ? 'midnight' : existingProfileMissingGender.theme || 'strawberry',
      chatPattern: isMale ? 'midnight_grid' : existingProfileMissingGender.chatPattern || 'mochi_dots',
    };

    const userDocRef = doc(db, 'users', existingProfileMissingGender.id);
    await setDoc(userDocRef, updated, { merge: true });

    try {
      localStorage.setItem('mochichat_active_user_uid', updated.id);
      localStorage.setItem('mochichat_profile_cache', JSON.stringify(updated));
    } catch {
      // ignore
    }

    sounds.playReceive();
    onSuccess(updated);
    setLoading(false);
  };

  // If user has an unverified session and email verification is active
  if (unverifiedUser && !unverifiedUser.emailVerified) {
    const handleResend = async () => {
      setResendingVerification(true);
      setError(null);
      try {
        await sendEmailVerification(unverifiedUser);
        setVerificationSent(true);
        sounds.playReceive();
      } catch (err: unknown) {
        const errorObj = err as { message?: string };
        setError(errorObj.message || 'Failed to resend verification email.');
      } finally {
        setResendingVerification(false);
      }
    };

    const handleReload = async () => {
      setLoading(true);
      setError(null);
      try {
        await unverifiedUser.reload();
        if (unverifiedUser.emailVerified) {
          sounds.playReceive();
          confetti({
            particleCount: 60,
            spread: 70,
            origin: { y: 0.7 },
          });
          window.location.reload();
        } else {
          setError("Your email isn't verified yet! Please click the link in your email inbox or spam folder.");
        }
      } catch (err: unknown) {
        const errorObj = err as { message?: string };
        setError(errorObj.message || 'Error checking verification status.');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="fixed inset-0 z-50 bg-[#fff5f6]/95 backdrop-blur-md flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-pink-100 flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-3xl bg-pink-100 flex items-center justify-center text-3xl mb-4 shadow-inner">
            💌
          </div>

          <h2 className="text-xl font-bold text-slate-800 tracking-tight">
            Verify Your Email
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            We sent a verification link to <span className="font-semibold text-rose-600">{unverifiedUser.email}</span>. Click the link to complete registration!
          </p>

          {verificationSent && (
            <div className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
              <CheckCircle2 className="w-4 h-4" />
              <span>Verification email sent! Check your inbox & spam.</span>
            </div>
          )}

          {error && (
            <div className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-rose-50 text-rose-700 text-xs font-medium border border-rose-200 text-left">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="w-full mt-6 space-y-2.5">
            <button
              onClick={handleReload}
              disabled={loading}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-xs shadow-md shadow-pink-200 flex items-center justify-center gap-2 hover:opacity-95 transition-all active:scale-98 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>I Have Verified My Email</span>
            </button>

            <button
              onClick={handleResend}
              disabled={resendingVerification}
              className="w-full py-2.5 px-4 rounded-2xl bg-pink-50 hover:bg-pink-100/70 text-pink-700 font-bold text-xs transition-colors disabled:opacity-50"
            >
              {resendingVerification ? 'Sending...' : 'Resend Verification Email'}
            </button>

            {onSignOut && (
              <button
                onClick={onSignOut}
                className="w-full py-2 px-4 rounded-2xl text-slate-400 hover:text-slate-600 text-xs font-semibold transition-colors flex items-center justify-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Use Different Account</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Handle Form Submission for Email/Password & Password Reset
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);

    if (mode === 'register' && !selectedGender) {
      setError('Please select your gender to continue.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'forgot') {
        if (!email.trim()) {
          setError('Please provide your email address.');
          setLoading(false);
          return;
        }
        try {
          await sendPasswordResetEmail(auth, email.trim());
          setInfoMessage('Password reset link sent to your email! Please check your inbox.');
        } catch {
          setInfoMessage('If your email is registered, you will receive a reset link shortly.');
        }
        sounds.playReceive();
        setLoading(false);
        return;
      }

      if (mode === 'register') {
        if (!selectedGender) throw new Error('Please select your gender to continue.');
        if (!name.trim()) throw new Error('Please enter your display name.');
        if (!username.trim()) throw new Error('Please enter a username.');
        if (password.length < 6) throw new Error('Password must be at least 6 characters.');

        // 1. Try Firebase Auth create user
        let userUid: string | null = null;
        let isVerified = false;

        try {
          const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
          userUid = cred.user.uid;
          isVerified = cred.user.emailVerified;
          try {
            await sendEmailVerification(cred.user);
          } catch {
            // ignore
          }
        } catch (authErr: unknown) {
          const fbErr = authErr as { code?: string; message?: string };
          if (
            fbErr.code === 'auth/operation-not-allowed' ||
            fbErr.code === 'auth/admin-restricted-operation' ||
            fbErr.code === 'auth/unauthorized-domain'
          ) {
            userUid = 'usr_' + btoa(email.trim().toLowerCase()).replace(/[^a-zA-Z0-9]/g, '').slice(0, 24);
            isVerified = true;
          } else {
            throw authErr;
          }
        }

        if (userUid && selectedGender) {
          await registerProfileToDatabase(userUid, email.trim(), isVerified, selectedGender);
        }
      } else {
        // Mode: Login
        let userUid: string | null = null;
        try {
          const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
          userUid = cred.user.uid;
        } catch (authErr: unknown) {
          const fbErr = authErr as { code?: string; message?: string };
          if (
            fbErr.code === 'auth/operation-not-allowed' ||
            fbErr.code === 'auth/admin-restricted-operation' ||
            fbErr.code === 'auth/unauthorized-domain'
          ) {
            userUid = 'usr_' + btoa(email.trim().toLowerCase()).replace(/[^a-zA-Z0-9]/g, '').slice(0, 24);
          } else {
            throw authErr;
          }
        }

        if (userUid) {
          sounds.playSend();
          const userDocRef = doc(db, 'users', userUid);
          const snap = await getDoc(userDocRef);

          if (snap.exists()) {
            const profile = snap.data() as UserProfile;
            try {
              localStorage.setItem('mochichat_active_user_uid', userUid);
              localStorage.setItem('mochichat_profile_cache', JSON.stringify(profile));
            } catch {
              // ignore
            }
            onSuccess(profile);
          } else {
            // New user via email fallback without gender: default to female unless selected
            await registerProfileToDatabase(userUid, email.trim(), true, selectedGender || 'female');
          }
        }
      }
    } catch (err: unknown) {
      const errorObj = err as { message?: string; code?: string };
      let msg = errorObj.message || 'An error occurred during authentication.';
      if (errorObj.code === 'auth/email-already-in-use') {
        msg = 'This email is already registered. Please sign in instead!';
      } else if (errorObj.code === 'auth/invalid-credential' || errorObj.code === 'auth/wrong-password') {
        msg = 'Invalid email or password. Please verify your credentials.';
      } else if (errorObj.code === 'auth/user-not-found') {
        msg = 'No account found with this email.';
      } else if (errorObj.code === 'auth/invalid-email') {
        msg = 'Please enter a valid email address.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const isMaleMode = selectedGender === 'male';

  // Render Complete Google Profile Step
  if (mode === 'complete_google') {
    return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto transition-colors duration-300 ${isMaleMode ? 'bg-[#0B0F14]/95 text-slate-100' : 'bg-[#fff5f6]/95 text-slate-800'}`}>
        <div className={`w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border flex flex-col my-auto transition-colors duration-300 ${isMaleMode ? 'bg-[#111821] border-[#1E3A5F] shadow-blue-950/40' : 'bg-white border-pink-100 shadow-pink-200/50'}`}>
          <div className="text-center mb-5">
            <img
              src="/simi-logo.png"
              alt="Simi Logo"
              className="w-16 h-16 rounded-3xl mx-auto mb-2 object-cover shadow-xl ring-4 ring-purple-500/30 animate-pulse"
            />
            <h1 className="text-xl font-extrabold tracking-tight">
              Complete Your Profile
            </h1>
            <p className="text-xs opacity-70 mt-0.5">
              Select your gender to personalize your MochiChat space
            </p>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 p-3 bg-rose-900/30 border border-rose-700/50 rounded-2xl text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleCompleteGoogleProfile} className="space-y-4">
            {/* Gender Selection */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider mb-2 opacity-80">
                Select Your Gender <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setSelectedGender('female');
                    setError(null);
                  }}
                  className={`py-3 px-4 rounded-2xl border font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                    selectedGender === 'female'
                      ? 'bg-pink-100/90 text-rose-700 border-pink-400 ring-2 ring-pink-300 shadow-xs'
                      : isMaleMode
                      ? 'bg-slate-900/80 text-slate-400 border-slate-700 hover:border-slate-500'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-pink-50'
                  }`}
                >
                  <span className="text-base">🌸</span>
                  <span>Female</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setSelectedGender('male');
                    setError(null);
                  }}
                  className={`py-3 px-4 rounded-2xl border font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                    selectedGender === 'male'
                      ? 'bg-blue-950 text-blue-300 border-blue-500 ring-2 ring-blue-400 shadow-blue-900/40'
                      : isMaleMode
                      ? 'bg-slate-900/80 text-slate-400 border-slate-700 hover:border-slate-500'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-pink-50'
                  }`}
                >
                  <span className="text-base">⚡</span>
                  <span>Male</span>
                </button>
              </div>
            </div>

            {/* Display Name & Username */}
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1 opacity-80">
                  Display Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className={`w-full px-3.5 py-2.5 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 transition-all ${
                    isMaleMode
                      ? 'bg-slate-900 border border-slate-700 text-white focus:ring-blue-500'
                      : 'bg-slate-50 border border-slate-200 text-slate-800 focus:ring-pink-300'
                  }`}
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1 opacity-80">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className={`w-full px-3.5 py-2.5 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 transition-all ${
                    isMaleMode
                      ? 'bg-slate-900 border border-slate-700 text-white focus:ring-blue-500'
                      : 'bg-slate-50 border border-slate-200 text-slate-800 focus:ring-pink-300'
                  }`}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !selectedGender}
              className={`w-full py-3 px-4 rounded-2xl font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-transform active:scale-98 disabled:opacity-50 ${
                isMaleMode
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-900/40'
                  : 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-pink-200'
              }`}
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Save & Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Render Complete Missing Gender for existing profile
  if (mode === 'complete_missing_gender') {
    return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto transition-colors duration-300 ${isMaleMode ? 'bg-[#0B0F14]/95 text-slate-100' : 'bg-[#fff5f6]/95 text-slate-800'}`}>
        <div className={`w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border flex flex-col my-auto transition-colors duration-300 ${isMaleMode ? 'bg-[#111821] border-[#1E3A5F]' : 'bg-white border-pink-100'}`}>
          <div className="text-center mb-5">
            <div className={`w-14 h-14 rounded-3xl mx-auto flex items-center justify-center text-2xl text-white shadow-md mb-2 ${isMaleMode ? 'bg-gradient-to-tr from-blue-600 to-indigo-600' : 'bg-gradient-to-tr from-pink-400 to-rose-400'}`}>
              {isMaleMode ? '⚡' : '🌸'}
            </div>
            <h1 className="text-xl font-extrabold tracking-tight">
              One-Time Gender Setup
            </h1>
            <p className="text-xs opacity-70 mt-0.5">
              Select your gender to unlock your customized MochiChat design system
            </p>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 p-3 bg-rose-900/30 border border-rose-700/50 rounded-2xl text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleCompleteMissingGender} className="space-y-5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider mb-2 opacity-80">
                Select Your Gender <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setSelectedGender('female');
                    setError(null);
                  }}
                  className={`py-3.5 px-4 rounded-2xl border font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                    selectedGender === 'female'
                      ? 'bg-pink-100 text-rose-700 border-pink-400 ring-2 ring-pink-300 shadow-xs'
                      : isMaleMode
                      ? 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-500'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-pink-50'
                  }`}
                >
                  <span className="text-lg">🌸</span>
                  <span>Female</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setSelectedGender('male');
                    setError(null);
                  }}
                  className={`py-3.5 px-4 rounded-2xl border font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                    selectedGender === 'male'
                      ? 'bg-blue-950 text-blue-300 border-blue-500 ring-2 ring-blue-400 shadow-blue-900/40'
                      : isMaleMode
                      ? 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-500'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-pink-50'
                  }`}
                >
                  <span className="text-lg">⚡</span>
                  <span>Male</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !selectedGender}
              className={`w-full py-3 px-4 rounded-2xl font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-transform active:scale-98 disabled:opacity-50 ${
                isMaleMode
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-900/40'
                  : 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-pink-200'
              }`}
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Save Experience Theme</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 z-50 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto transition-colors duration-300 ${isMaleMode ? 'bg-[#0B0F14]/95 text-slate-100' : 'bg-[#fff5f6]/95 text-slate-800'}`}>
      <div className={`w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border flex flex-col my-auto transition-all duration-300 ${isMaleMode ? 'bg-[#111821] border-[#1E3A5F] shadow-blue-950/40' : 'bg-white border-pink-100 shadow-pink-200/50'}`}>
        {/* Branding header */}
        <div className="text-center mb-5">
          <img
            src="/simi-logo.png"
            alt="Simi Logo"
            className="w-16 h-16 rounded-3xl mx-auto mb-2 object-cover shadow-xl ring-4 ring-purple-500/30"
          />
          <h1 className="text-xl font-extrabold tracking-tight font-sans">
            Simi
          </h1>
          <p className="text-xs opacity-70 mt-0.5">
            {mode === 'register'
              ? isMaleMode
                ? 'Midnight Forge masculine design active'
                : 'Create your live profile with real database sync'
              : mode === 'login'
              ? 'Welcome back! Sign in to your account'
              : 'Reset your password via email'}
          </p>
        </div>

        {/* Tab Switcher */}
        {mode !== 'forgot' && (
          <div className={`flex p-1 rounded-2xl mb-4 border transition-colors ${isMaleMode ? 'bg-slate-900/90 border-slate-800' : 'bg-pink-50/70 border-pink-100/60'}`}>
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setMode('register');
                setError(null);
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
                mode === 'register'
                  ? isMaleMode
                    ? 'bg-blue-950 text-blue-300 shadow-2xs border border-blue-800/50'
                    : 'bg-white text-rose-600 shadow-2xs'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              Register Profile
            </button>
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setMode('login');
                setError(null);
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
                mode === 'login'
                  ? isMaleMode
                    ? 'bg-blue-950 text-blue-300 shadow-2xs border border-blue-800/50'
                    : 'bg-white text-rose-600 shadow-2xs'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              Sign In
            </button>
          </div>
        )}

        {/* Feedback messages */}
        {error && (
          <div className={`mb-4 flex items-center gap-2 p-3 border rounded-2xl text-xs ${isMaleMode ? 'bg-rose-950/40 border-rose-800/50 text-rose-300' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {infoMessage && (
          <div className={`mb-4 flex items-center gap-2 p-3 border rounded-2xl text-xs ${isMaleMode ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-800'}`}>
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>{infoMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <>
              {/* Gender Selector (Required) */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 opacity-80">
                  Select Your Gender <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setSelectedGender('female');
                      setError(null);
                    }}
                    className={`py-2.5 px-3 rounded-2xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      selectedGender === 'female'
                        ? 'bg-pink-100 text-rose-700 border-pink-400 ring-2 ring-pink-300 shadow-2xs'
                        : isMaleMode
                        ? 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-pink-50'
                    }`}
                  >
                    <span>🌸</span>
                    <span>Female</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setSelectedGender('male');
                      setError(null);
                    }}
                    className={`py-2.5 px-3 rounded-2xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      selectedGender === 'male'
                        ? 'bg-blue-950 text-blue-300 border-blue-500 ring-2 ring-blue-400 shadow-blue-900/40'
                        : isMaleMode
                        ? 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-pink-50'
                    }`}
                  >
                    <span>⚡</span>
                    <span>Male</span>
                  </button>
                </div>
              </div>

              {/* Choose avatar */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 opacity-80">
                  Pick Mascot Avatar
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none">
                  {AVATAR_LIST.filter(av => isMaleMode ? ['wolf', 'dragon', 'falcon', 'bear', 'fox', 'panda', 'penguin'].includes(av.id) : true).map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => {
                        sounds.playClick();
                        setAvatarId(av.id);
                      }}
                      className={`p-1.5 rounded-2xl shrink-0 border transition-all ${
                        avatarId === av.id
                          ? isMaleMode
                            ? 'border-blue-500 bg-blue-950 shadow-xs scale-105 ring-2 ring-blue-400'
                            : 'border-pink-500 bg-pink-100/80 shadow-xs scale-105 ring-2 ring-pink-300'
                          : isMaleMode
                          ? 'border-slate-800 bg-slate-900'
                          : 'border-slate-100 hover:border-pink-200 bg-slate-50'
                      }`}
                      title={av.name}
                    >
                      <CuteAvatar id={av.id} size="sm" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Name & Username Inputs */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1 opacity-80">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder={isMaleMode ? "Alexander" : "Cotton Candy"}
                    className={`w-full px-3 py-2 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 transition-all ${
                      isMaleMode
                        ? 'bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:ring-blue-500'
                        : 'bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:ring-pink-300'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1 opacity-80">
                    Username
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-2 text-xs opacity-50">@</span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      placeholder={isMaleMode ? "alex_forge" : "candy99"}
                      className={`w-full pl-6 pr-3 py-2 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 transition-all ${
                        isMaleMode
                          ? 'bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:ring-blue-500'
                          : 'bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:ring-pink-300'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Email input */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider mb-1 opacity-80">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-2.5 opacity-50" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="user@example.com"
                className={`w-full pl-9 pr-3 py-2 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 transition-all ${
                  isMaleMode
                    ? 'bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:ring-blue-500'
                    : 'bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:ring-pink-300'
                }`}
              />
            </div>
          </div>

          {/* Password input */}
          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold uppercase tracking-wider opacity-80">
                  Password
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setError(null);
                    }}
                    className={`text-[11px] font-semibold hover:underline ${isMaleMode ? 'text-blue-400' : 'text-pink-600'}`}
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-2.5 opacity-50" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  className={`w-full pl-9 pr-3 py-2 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 transition-all ${
                    isMaleMode
                      ? 'bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:ring-blue-500'
                      : 'bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:ring-pink-300'
                  }`}
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-2 py-3 px-4 rounded-2xl font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-transform active:scale-98 disabled:opacity-50 ${
              isMaleMode
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-900/40'
                : 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-pink-200'
            }`}
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : mode === 'register' ? (
              <>
                {isMaleMode ? <Zap className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                <span>{isMaleMode ? 'Create Midnight Account' : 'Register Real Profile'}</span>
              </>
            ) : mode === 'login' ? (
              <>
                <span>Sign In to MochiChat</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                <span>Send Reset Link</span>
              </>
            )}
          </button>
        </form>

        {/* Google Sign-In Option */}
        {mode !== 'forgot' && (
          <>
            <div className="relative my-4 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t ${isMaleMode ? 'border-slate-800' : 'border-slate-200'}`} />
              </div>
              <span className={`relative px-3 text-[11px] font-bold uppercase tracking-wider ${isMaleMode ? 'bg-[#111821] text-slate-400' : 'bg-white text-slate-400'}`}>
                Or Continue With
              </span>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className={`w-full py-2.5 px-4 rounded-2xl font-bold text-xs shadow-2xs flex items-center justify-center gap-2.5 transition-all active:scale-98 disabled:opacity-50 ${
                isMaleMode
                  ? 'bg-slate-900 hover:bg-slate-850 border border-slate-700 text-slate-200'
                  : 'bg-white hover:bg-slate-50 border border-slate-200 hover:border-pink-300 text-slate-700'
              }`}
            >
              <GoogleIcon />
              <span>Sign in with Google</span>
            </button>
          </>
        )}

        {mode === 'forgot' && (
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className="mt-4 text-xs font-bold opacity-70 hover:opacity-100 text-center"
          >
            ← Back to Sign In
          </button>
        )}
      </div>
    </div>
  );
};
