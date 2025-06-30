import React, { useState } from 'react';
import { auth, db } from '../utils/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const provider = new GoogleAuthProvider();

const AuthForm: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getFriendlyError = (code: string) => {
    switch (code) {
      case 'auth/email-already-in-use':
        return 'This email is already registered. Please log in or use a different email.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/user-not-found':
        return 'No account found with this email.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later.';
      default:
        return 'An error occurred. Please try again.';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        // Sign up flow: create user, update profile, store phone
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCred.user;
        // Update display name
        await updateProfile(user, {
          displayName: `${firstName} ${lastName}`.trim(),
        });
        // Store phone number in Firestore
        await setDoc(doc(db, 'users', user.uid), {
          firstName,
          lastName,
          phone,
          email: user.email,
          createdAt: new Date().toISOString(),
        });
      }
    } catch (err: any) {
      const code = err.code || '';
      setError(getFriendlyError(code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-800 to-indigo-900">
      <div className="bg-white/90 rounded-2xl shadow-2xl p-10 w-full max-w-md border border-indigo-200">
        <div className="flex flex-col items-center mb-6">
          <img src="https://img.icons8.com/color/96/000000/brain.png" alt="MoodMirror Logo" className="mb-2" />
          <h2 className="text-3xl font-extrabold mb-1 text-center text-indigo-700 drop-shadow">
            {isLogin ? 'Welcome Back!' : 'Join MoodMirror'}
          </h2>
          <p className="text-gray-500 text-center text-sm mb-2">
            {isLogin ? 'Sign in to continue' : 'Create your account'}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isLogin && (
            <>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="First Name"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  className="border border-indigo-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50 w-1/2"
                  required
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  className="border border-indigo-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50 w-1/2"
                  required
                />
              </div>
              <input
                type="tel"
                placeholder="Phone Number"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="border border-indigo-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50"
                required
              />
            </>
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="border border-indigo-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="border border-indigo-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50"
            required
          />
          {error && <div className="text-red-500 text-sm text-center font-medium">{error}</div>}
          <button
            type="submit"
            className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg py-2 font-semibold shadow hover:from-indigo-600 hover:to-purple-600 transition"
            disabled={loading}
          >
            {loading ? 'Please wait...' : isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>
        <div className="flex items-center my-4">
          <div className="flex-grow h-px bg-indigo-200" />
          <span className="mx-3 text-gray-400 text-sm">or</span>
          <div className="flex-grow h-px bg-indigo-200" />
        </div>
        <button
          onClick={handleGoogleSignIn}
          className="flex items-center justify-center w-full gap-2 bg-white border border-gray-300 rounded-lg py-2 font-semibold shadow hover:bg-gray-50 transition text-gray-700"
          disabled={loading}
        >
          <img src="https://img.icons8.com/color/24/000000/google-logo.png" alt="Google" className="inline-block" />
          Continue with Google
        </button>
        <div className="mt-6 text-center">
          <button
            className="text-indigo-600 hover:underline text-sm font-medium"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Login'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthForm; 