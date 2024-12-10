import React from 'react';
import { MapPin, Phone, Mail, Clock, MessageCircle } from 'lucide-react';
import Breadcrumb from '../BreadCrumbs/breadCrumbs';

const HelpSupport = () => {
  const branches = [
    {
        name: 'Hogis Royale And Apartments',
        address: '123 Main Street, Lagos',
        phone: '+234 123 456 7890',
        email: 'main@hogis.com',
        hours: 'Always Available 24/7'
      },
      {
        name: 'Hogis Luxury Suites',
        address: '456 Victoria Island, Lagos',
        phone: '+234 098 765 4321',
        email: 'express@hogis.com',
        hours: 'Always Available 24/7'
      },
      {
        name: 'Hogis Exclusive Suites',
        address: '456 Victoria Island, Lagos',
        phone: '+234 098 765 4321',
        email: 'express@hogis.com',
        hours: 'Always Available 24/7'
      }
  ];


  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <Breadcrumb />
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Help & Support</h1>

          <div className="space-y-8">
            {/* Live Chat Section */}
            <div className="bg-blue-50 p-6 rounded-xl">
              <div className="flex items-center space-x-4 mb-4">
                <MessageCircle className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Live Chat Support</h2>
              </div>
              <p className="text-gray-600 mb-4">
                Our customer service team is available 24/7 to assist you.
              </p>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Start Chat
              </button>
            </div>

            {/* Branch Information */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Our Locations</h2>
              {branches.map((branch, index) => (
                <div key={index} className="border border-gray-200 rounded-xl p-6">
                  <h3 className="font-semibold text-lg text-gray-900 mb-4">{branch.name}</h3>
                  <div className="space-y-3 text-gray-600">
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <span>{branch.address}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <span>{branch.phone}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <span>{branch.email}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <span>{branch.hours}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpSupport;