


import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../BreadCrumbs/breadCrumbs';
import {
  User,
  HelpCircle,
  FileText,
  Info,
  HelpingHand,
  Share2,
  Globe,
  ChevronRight,
  MapPin,
  Phone,
  Mail,
  Shield
} from 'lucide-react';

const UserAccountPage = () => {
  const [language, setLanguage] = useState('English');
  const navigate = useNavigate();


  const menuItems = [
    { icon: <User className="w-6 h-6" />, title: 'Profile', path: '/profile' },
    { icon: <HelpCircle className="w-6 h-6" />, title: 'Help & Support', path: '/support' },
    { icon: <Shield className="w-6 h-6" />, title: 'Privacy Policy', path: '/privacy' },
    { icon: <Info className="w-6 h-6" />, title: 'About Us', path: '/about' },
    { icon: <HelpingHand className="w-6 h-6" />, title: 'FAQ', path: '/faq' },
    { icon: <Share2 className="w-6 h-6" />, title: 'Refer a Friend', path: '/refer' },
   
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-6 shadow-sm">
      <Breadcrumb 
      />
      <h1 className="text-sm font-bold text-gray-900 text-right">My Account</h1>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Menu Items */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {menuItems.map((item, index) => (
            <div
              key={index}
              onClick={() => navigate(item.path)}
              className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center space-x-4">
                <div className="text-gray-600">{item.icon}</div>
                <span className="text-gray-800 font-medium">{item.title}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          ))}
        </div>
     
      </div>
    </div>
  );
};

export default UserAccountPage;
