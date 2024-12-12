import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon } from '@heroicons/react/24/solid';
import Breadcrumb from '../BreadCrumbs/breadCrumbs';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "What are your operating hours?",
      answer: "Our restaurants and other services are always Open 24/7."
    },
    {
      question: "Do you offer delivery services?",
      answer: "Yes, we offer delivery through our mobile app and website. Delivery areas and minimum order values may vary by location."
    },
    {
      question: "How can I make a reservation?",
      answer: "Reservations can be made through our website, mobile app, or by calling your preferred branch directly."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept cash on dine-in or pickup, all major credit cards, and digital payments including mobile money transfers. Additionally, we accept all payment methods offered by Paystack, such as credit cards, bank transfers(Opay), USSD, and mobile wallets."
    },
    {
      question: "Can I track my order?",
      answer: "Yes, you can track your order status via the Order page on our website."
    },
    {
      question: "Can I drop feedback about the order I got or the services rendered?",
      answer: "Yes, you can submit your feedback and reviews through the Feedback page on our website."
    },
    {
      question: "What measures do you have for ensuring order quality?",
      answer: "We follow strict quality control protocols to ensure that every order meets our high standards before it is dispatched to you."
    },
    {
      question: "Who handles your dispatch services?",
      answer: "We partner with reliable dispatch services, including FoodExpress, to ensure timely and safe delivery of your orders."
    },
    {
      question: "What should I do if there is an issue with my order?",
      answer: "If there is an issue with your order, you can contact our customer support team via the Contact Us page, and we will resolve it promptly."
    },
    {
      question: "Are there options for special instructions with my order?",
      answer: "Yes, you can add special instructions for your order during the checkout process to ensure we meet your specific needs."
    },
    {
      question: "Can I cancel or modify my order after placing it?",
      answer: "Order cancellations or modifications can be made within a limited time after placement. Please contact customer support for assistance."
    },
    {
      question: "Do you provide updates on the status of my order?",
      answer: "Yes, you will receive real-time updates on your order status through notifications on our website."
    },
    {
      question: "What if I'm not satisfied with the order quality?",
      answer: "If you're not satisfied with the quality of your order, please reach out to our customer support team for assistance. We value your feedback and strive to improve continuously."
    }
  ];

  const toggleQuestion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
<div className="min-h-screen bg-white to-red-700 py-8 px-4 sm:px-6 lg:px-8">
<div className="max-w-3xl mx-auto">
     <Breadcrumb className="text-white" />
        <h1 className="text-3x font-extrabold text-center text-black mb-8">
          Frequently Asked Questions
        </h1>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden"
            >
              <button
                className="w-full px-6 py-4 text-left flex items-center justify-between focus:outline-none"
                onClick={() => toggleQuestion(index)}
              >
                <span className="font-medium text-gray-900">{faq.question}</span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDownIcon className="w-5 h-5 text-black" />
                </motion.div>
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-6 pb-4 text-gray-600">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQ;

