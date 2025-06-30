import React, { useEffect, useState } from 'react';
import { auth, db } from '../utils/firebase';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { deleteUser, signOut } from 'firebase/auth';

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ open, onClose }) => {
  const user = auth.currentUser;
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (user && open) {
      setLoading(true);
      getDoc(doc(db, 'users', user.uid))
        .then((snap) => {
          setUserInfo(snap.exists() ? snap.data() : null);
        })
        .catch(() => setUserInfo(null))
        .finally(() => setLoading(false));
    }
  }, [user, open]);

  const handleDelete = async () => {
    if (!user) return;
    setDeleting(true);
    setError(null);
    try {
      // Delete Firestore user doc
      await deleteDoc(doc(db, 'users', user.uid));
      // Delete Auth user
      await deleteUser(user);
      // Sign out
      await signOut(auth);
      onClose();
    } catch (err: any) {
      setError('Failed to delete account. Please re-authenticate and try again.');
    } finally {
      setDeleting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md relative">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-indigo-600 text-xl"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-4 text-indigo-700 text-center">Profile</h2>
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : userInfo ? (
          <div className="space-y-2 mb-6">
            <div><span className="font-semibold">Name:</span> {userInfo.firstName} {userInfo.lastName}</div>
            <div><span className="font-semibold">Email:</span> {userInfo.email}</div>
            <div><span className="font-semibold">Phone:</span> {userInfo.phone}</div>
          </div>
        ) : (
          <div className="text-center text-gray-500 mb-6">No profile info found.</div>
        )}
        {error && <div className="text-red-500 text-center mb-4">{error}</div>}
        <button
          className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-lg transition disabled:opacity-60"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? 'Deleting...' : 'Delete Account'}
        </button>
      </div>
    </div>
  );
};

export default ProfileModal; 