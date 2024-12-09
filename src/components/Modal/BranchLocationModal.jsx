import React, { useState } from 'react';
import { MapPin } from 'lucide-react';

const BranchLocationModal = ({ isOpen, onClose, branches, onSelect }) => {
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [orderType, setOrderType] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (selectedBranch && orderType && (orderType !== 'delivery' || deliveryLocation)) {
      onSelect(selectedBranch, orderType, deliveryLocation);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <h2 className="text-xl font-bold mb-4 text-[#020d19]">Select Branch and Order Details</h2>
        
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4" />
            Select Branch
          </label>
          <select
            value={selectedBranch?.id || ''}
            onChange={(e) => {
              const branch = branches.find(b => b.id === e.target.value);
              setSelectedBranch(branch);
              setOrderType('');
              setDeliveryLocation('');
            }}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">Choose a branch</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
        </div>

        {selectedBranch && (
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Order Type
            </label>
            <select
              value={orderType}
              onChange={(e) => {
                setOrderType(e.target.value);
                setDeliveryLocation('');
              }}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="">Select order type</option>
              <option value="dine-in">Dine-In (Eat at Branch)</option>
              <option value="pickup">Takeout - Pickup</option>
              <option value="delivery">Takeout - Delivery</option>
            </select>
          </div>
        )}

        {orderType === 'delivery' && selectedBranch && (
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Delivery Location
            </label>
            <select
              value={deliveryLocation}
              onChange={(e) => setDeliveryLocation(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="">Select delivery location</option>
              {Object.entries(selectedBranch.deliveryLocations).map(([location, price]) => (
                <option key={location} value={location}>
                  {location} - ₦{price.toLocaleString()}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            disabled={!selectedBranch || !orderType || (orderType === 'delivery' && !deliveryLocation)}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default BranchLocationModal;
