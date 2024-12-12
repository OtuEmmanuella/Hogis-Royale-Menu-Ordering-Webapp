import React from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import Breadcrumb from '../BreadCrumbs/breadCrumbs';

const HelpSupport = () => {
  const branches = [
    {
      name: 'Hogis Royale And Apartments',
      address: 'No. 6 Bishop Moynagh Ave, Atekong, State Housing Estate, Calabar 540222, Cross River State',
      phone: '+234707 353 6464',
      email: 'hogisroyaleandapartment@gmail.com',
      hours: 'Always Available 24/7'
    },
    {
      name: 'Hogis Luxury Suites',
      address: 'No. 7 Akim Close State Housing Estate off Ndidem Usang Iso(Marian) Road, Calabar Cross River State',
      phone: '08099903335 / 08099903336',
      email: 'info@hogisluxurysuites.com',
      hours: 'Always Available 24/7'
    },
    {
      name: 'Hogis Exclusive Suites',
      address: 'No. 4 Ifebem Ezima Street E1 Estate off Technical Roundabout, Calabar, Cross River State',
      phone: '+2348109516906',
      email: 'info@hogisluxurysuites.com',
      hours: 'Always Available 24/7'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumb />
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-6">Help & Support</h1>

          <div className="space-y-6">
            {/* Branch Information */}
            <div className="space-y-4">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Our Locations</h2>
              <div className="grid gap-4 sm:gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                {branches.map((branch, index) => (
                  <div 
                    key={index} 
                    className="border border-gray-200 rounded-lg p-3 sm:p-4"
                  >
                    <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-3">
                      {branch.name}
                    </h3>
                    <div className="space-y-2 text-sm sm:text-base text-gray-600">
                      {[
                        { icon: <MapPin />, content: branch.address },
                        { icon: <Phone />, content: branch.phone },
                        { icon: <Mail />, content: branch.email },
                        { icon: <Clock />, content: branch.hours },
                      ].map(({ icon, content }, idx) => (
                        <div key={idx} className="flex items-start space-x-2">
                          {React.cloneElement(icon, { className: "w-4 h-4 sm:w-5 sm:h-5 text-gray-400" })}
                          <span>{content}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpSupport;