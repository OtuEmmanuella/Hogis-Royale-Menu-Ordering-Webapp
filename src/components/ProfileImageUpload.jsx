import React, { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { storage, db, auth } from '../components/Firebase/FirebaseConfig';
import { Camera } from 'lucide-react';

const ProfileImageUpload = ({ userId, currentPhotoURL, onImageUpdate }) => {
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
  
    try {
      setUploading(true);
      const user = auth.currentUser; // Ensure you import and use Firebase Auth
      if (!user || user.uid !== userId) {
        throw new Error('Unauthorized: User ID mismatch');
      }
      
      const storageRef = ref(storage, `profile-images/${userId}`);
      await uploadBytes(storageRef, file);
      const photoURL = await getDownloadURL(storageRef);
  
      await updateDoc(doc(db, 'users', userId), {
        photoURL: photoURL
      });
  
      onImageUpdate(photoURL);
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploading(false);
    }
  };
  

  return (
    <div className="profile-image-container">
      <div className="profile-image-wrapper">
        {currentPhotoURL ? (
          <img src={currentPhotoURL} alt="Profile" className="profile-image" />
        ) : (
          <div className="profile-image-placeholder">
            <Camera className="camera-icon" />
          </div>
        )}
        <label className="upload-button" htmlFor="profile-image-input">
          {uploading ? 'Uploading...' : 'Change Photo'}
        </label>
        <input
          id="profile-image-input"
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
          disabled={uploading}
        />
      </div>
    </div>
  );
};

export default ProfileImageUpload;