import { User as UserIcon, Store, Lock, Bell, Eye } from 'lucide-react';
import { UserRole } from '@/types/entities';

export interface SettingsTab {
  id: string;
  label: string;
  icon: typeof UserIcon;
  show?: (userRole?: UserRole) => boolean;
}

export const SETTINGS_TABS: SettingsTab[] = [
  {
    id: 'profile',
    label: 'Thông tin cá nhân',
    icon: UserIcon,
  },
  {
    id: 'shop',
    label: 'Cửa hàng',
    icon: Store,
    show: (userRole) => userRole === UserRole.SELLER,
  },
  {
    id: 'security',
    label: 'Bảo mật',
    icon: Lock,
  },
  {
    id: 'notifications',
    label: 'Thông báo',
    icon: Bell,
  },
  {
    id: 'privacy',
    label: 'Quyền riêng tư',
    icon: Eye,
  },
];

export const getVisibleTabs = (userRole?: UserRole): SettingsTab[] => {
  return SETTINGS_TABS.filter(tab => !tab.show || tab.show(userRole));
};
