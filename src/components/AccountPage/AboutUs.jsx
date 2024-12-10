import React from 'react';
import { Building2, Users, Trophy, Target } from 'lucide-react';
import Breadcrumb from '../BreadCrumbs/breadCrumbs';


const AboutUs = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
      <Breadcrumb />

        <div className="bg-white rounded-xl shadow-sm p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">About Hogis Group</h1>
          
          <div className="grid gap-8">
            <div className="prose prose-blue max-w-none">
              <p className="text-gray-600 leading-relaxed">
                Hogis Group is a premier hospitality and dining establishment committed to delivering
                exceptional experiences through our network of restaurants and venues across Nigeria.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-blue-50 rounded-xl">
                <div className="flex items-center space-x-4 mb-4">
                  <Building2 className="w-6 h-6 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">Our Story</h3>
                </div>
                <p className="text-gray-600">
                  Founded in 2010, we've grown from a single location to multiple branches,
                  each maintaining our commitment to quality and service excellence.
                </p>
              </div>

              <div className="p-6 bg-blue-50 rounded-xl">
                <div className="flex items-center space-x-4 mb-4">
                  <Users className="w-6 h-6 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">Our Team</h3>
                </div>
                <p className="text-gray-600">
                  Our dedicated team of professionals works tirelessly to ensure
                  every guest receives the highest level of service and satisfaction.
                </p>
              </div>

              <div className="p-6 bg-blue-50 rounded-xl">
                <div className="flex items-center space-x-4 mb-4">
                  <Trophy className="w-6 h-6 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">Our Achievements</h3>
                </div>
                <p className="text-gray-600">
                  Multiple award-winning establishments recognized for culinary
                  excellence and outstanding customer service.
                </p>
              </div>

              <div className="p-6 bg-blue-50 rounded-xl">
                <div className="flex items-center space-x-4 mb-4">
                  <Target className="w-6 h-6 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">Our Mission</h3>
                </div>
                <p className="text-gray-600">
                  To create memorable dining experiences through exceptional food,
                  service, and ambiance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;