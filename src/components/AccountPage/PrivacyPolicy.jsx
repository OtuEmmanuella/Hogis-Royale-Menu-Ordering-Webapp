"use client"

import React from 'react';
import { Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import Breadcrumb from '../BreadCrumbs/breadCrumbs';

const PrivacyPolicy = () => {
  const policyItems = [
    {
      title: "Information We Collect",
      content: [
        "Personal identification information (Name, email address, phone number, etc.)",
        "Order history and preferences",
        "Payment information (securely processed and stored)",
        "Device and usage information for service improvement",
        "Cookies and similar technologies for enhanced user experience"
      ]
    },
    {
      title: "How We Use Your Information",
      content: [
        "To process your orders and provide personalized customer service",
        "To improve our services, products, and user experience",
        "To send relevant promotional communications (with your explicit consent)",
        "To maintain security, prevent fraud, and protect your account",
        "For legal compliance and to respond to lawful requests from authorities"
      ]
    },
    {
      title: "Data Protection Measures",
      content: [
        "Implementation of state-of-the-art encryption for data transmission",
        "Regular security audits and vulnerability assessments",
        "Strict access controls and employee training on data protection",
        "Continuous monitoring and updating of our security practices"
      ]
    },
    {
      title: "Your Rights and Choices",
      content: [
        "Access, correct, or delete your personal information",
        "Opt-out of marketing communications at any time",
        "Request data portability or restriction of processing",
        "Withdraw consent for specific data processing activities",
      ]
    }
  ];

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-b from-white to-white py-6 px-4 sm:px-6 lg:px-8 text-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-4xl mx-auto">
        <Breadcrumb />
        <motion.div 
          className="mt-6 bg-white rounded-lg shadow-lg overflow-hidden"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="p-6">
            <div className="flex items-center justify-center mb-6">
              <Shield className="w-10 h-10 text-blue-600" />
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 ml-4">Privacy Policy</h1>
            </div>

            <motion.div 
              className="prose prose-lg max-w-none text-gray-700"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h2 className="text-2x font-semibold text-blue-800 mb-4">Hogis Group Privacy Policy</h2>
              <p className="mb-6 text-sm">
                At Hogis Group, we are committed to protecting your privacy and ensuring the security of your personal information. 
                This policy outlines our practices regarding the collection, use, and safeguarding of your data when you engage with our services. 
                We strive for transparency and aim to empower you with control over your information.
              </p>

              {policyItems.map((item, index) => (
                <motion.div key={index} className="mb-6">
                  <motion.h3 
                    className="text-x font-semibold text-blue-700 mb-2"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {item.title}
                  </motion.h3>
                  <ul className="list-disc pl-5 space-y-2">
                    {item.content.map((point, idx) => (
                      <li key={idx}>{point}</li>
                    ))}
                  </ul>
                </motion.div>
              ))}

              <p className="mt-6">
                By using our services, you agree to the terms outlined in this privacy policy. 
                We may update this policy periodically, and we encourage you to review it regularly. 
                If you have any questions or concerns about our privacy practices, please don't hesitate to contact us.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PrivacyPolicy;

