import React from 'react';
import { User as UserIcon } from 'lucide-react';
import UserInfo from '@/components/profile/UserInfo';
import { User } from '@/types/entities';

interface ProfileTabProps {
  user: User;
  onUpdate: (updatedUser: Partial<User>) => Promise<void>;
}

const ProfileTab: React.FC<ProfileTabProps> = ({ user, onUpdate }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="flex items-center gap-3 mb-6">
        <UserIcon className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">Thông tin cá nhân</h2>
      </div>
      <UserInfo 
        user={user} 
        onUpdate={onUpdate}
        readOnly={false}
      />
    </div>
  );
};

export default ProfileTab;
