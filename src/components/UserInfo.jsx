import React from 'react';
import { User } from 'lucide-react';
import ProfileImageUpload from './ProfileImageUpload';

const UserInfo = ({ user, isAdmin, onImageUpdate }) => {
  const calculateMembershipDuration = (createdAt) => {
    if (!createdAt) return 'N/A';
    const now = new Date();
    const creationDate = new Date(createdAt.toDate());
    const diffTime = Math.abs(now - creationDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffYears = Math.floor(diffDays / 365);
    const diffMonths = Math.floor((diffDays % 365) / 30);
    const diffRemainingDays = diffDays % 30;

    let duration = '';
    if (diffYears > 0) duration += `${diffYears} year${diffYears > 1 ? 's' : ''} `;
    if (diffMonths > 0) duration += `${diffMonths} month${diffMonths > 1 ? 's' : ''} `;
    if (diffRemainingDays > 0) duration += `${diffRemainingDays} day${diffRemainingDays > 1 ? 's' : ''}`;

    return duration.trim();
  };

  return (
    <div className="uap-card uap-user-info">
      <h2 className="uap-card-title">
        <User className="uap-icon" /> User Information
      </h2>
      <ProfileImageUpload
        userId={user.id}
        currentPhotoURL={user.photoURL}
        onImageUpdate={onImageUpdate}
      />
      <div className="uap-info-content">
        <p><strong>Name:</strong> {isAdmin ? 'Admin' : `${user.firstName} ${user.lastName}`}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> {isAdmin ? 'Administrator' : 'User'}</p>
        {!isAdmin && (
          <>
            <p><strong>Member since:</strong> {user.createdAt ? new Date(user.createdAt.toDate()).toLocaleDateString() : 'N/A'}</p>
            <p><strong>Membership duration:</strong> {calculateMembershipDuration(user.createdAt)}</p>
          </>
        )}
      </div>
    </div>
  );
};

export default UserInfo;