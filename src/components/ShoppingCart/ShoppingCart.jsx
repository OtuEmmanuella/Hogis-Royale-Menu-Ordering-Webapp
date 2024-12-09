import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Minus, Plus, Trash2, MapPin } from 'lucide-react';
import { toast } from 'react-toastify';
import { useShoppingCart } from './ShoppingCartContext';
import BranchLocationModal from '../Modal/BranchLocationModal';
import LoginModal from '../Modal/Modal';
import emptybag from '/empty-bag.svg';

const branches = [
  { 
    id: '1', 
    name: 'Hogis Royale And Apartment', 
    address: 'Main Branch, Calabar',
    deliveryLocations: {
      'Calabar Municipality': 1500,
      'Calabar South': 2000,
      '8 Miles': 3000,
      'Akpabuyo': 5000,
      'Odukpani': 5000
    }
  },
  { 
    id: '2', 
    name: 'Hogis Luxury Suites', 
    address: 'Secondary Branch, Calabar',
    deliveryLocations: {
      'Calabar Municipality': 1500,
      'Calabar South': 2000,
      '8 Miles': 3000,
      'Akpabuyo': 5000,
      'Odukpani': 5000
    }
  },
  { 
    id: '3', 
    name: 'Hogis Exclusive Resorts', 
    address: 'Premium Branch, Calabar',
    deliveryLocations: {
      'Calabar Municipality': 1500,
      'Calabar South': 2000,
      '8 Miles': 3000,
      'Akpabuyo': 5000,
      'Odukpani': 5000
    }
  }
];

export const ShoppingCartIcon = () => {
  const { cartItems } = useShoppingCart();
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Link to="/cart" className="relative inline-flex items-center p-2 text-gray-700 hover:text-gray-900">
      <ShoppingCart className="w-6 h-6 text-white" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
          {itemCount}
        </span>
      )}
    </Link>
  );
};

export const ShoppingCartPage = () => {
  const { cartItems, incrementQuantity, decrementQuantity, removeItem, updateItemSpecifications, user } = useShoppingCart();
  const navigate = useNavigate();
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [orderType, setOrderType] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showBranchLocationModal, setShowBranchLocationModal] = useState(false);

  const getDeliveryPrice = () => {
    if (orderType !== 'delivery' || !deliveryLocation || !selectedBranch) return 0;
    return selectedBranch.deliveryLocations[deliveryLocation] || 0;
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryPrice = getDeliveryPrice();
  const finalPrice = totalPrice + deliveryPrice;

  const formatPrice = (price) => {
    return `₦${price.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const handleRemoveItem = (cartItemId) => {
    removeItem(cartItemId);
    toast.info('Item removed from cart.');
  };

  const handleCheckout = () => {
    if (!selectedBranch || !orderType || (orderType === 'delivery' && !deliveryLocation)) {
      setShowBranchLocationModal(true);
      return;
    }

    if (!user) {
      setShowLoginModal(true);
      return;
    }

    navigate(`/checkout?branch=${selectedBranch.id}&orderType=${orderType}&deliveryLocation=${encodeURIComponent(deliveryLocation)}&deliveryPrice=${deliveryPrice}`);
  };

  const handleSpecificationsChange = (cartItemId, specifications) => {
    updateItemSpecifications(cartItemId, specifications);
  };

  const handleBranchLocationSelect = (branch, type, location) => {
    setSelectedBranch(branch);
    setOrderType(type);
    setDeliveryLocation(location);
  };

  return (
    <div className="min-h-screen bg-red-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-10">My Cart 🛒</h1>
          <ShoppingCartIcon />
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <img src={emptybag} alt="Empty cart" className="mx-auto h-48 w-auto mb-6" />
            <h3 className="text-xl font-medium text-gray-10 mb-4">Your cart is empty</h3>
            <Link
              to="/menu"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-900 hover:bg-indigo-700"
            >
              Browse Our Menu
            </Link>
          </div>
        ) : (
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-7">
            <div className="bg-white shadow-glow sm:rounded-lg mb-8 rounded-[16px]">
            <ul className="divide-y divide-gray-200">
                  {cartItems.map((item) => (
                    <li key={item.cartItemId} className="p-4 sm:p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="text-lg font-medium text-gray-900">{item.name}</h4>
                          <p className="mt-1 text-sm text-gray-500">{formatPrice(item.price * item.quantity)} ({item.quantity} @ {formatPrice(item.price)} each)</p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center border rounded-lg">
                            <button
                              onClick={() => decrementQuantity(item.cartItemId)}
                              className="p-2 hover:bg-gray-100"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="px-4 py-2 text-gray-900">{item.quantity}</span>
                            <button
                              onClick={() => incrementQuantity(item.cartItemId)}
                              className="p-2 hover:bg-gray-100"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <button
                            onClick={() => handleRemoveItem(item.cartItemId)}
                            className="text-red-500 hover:text-red-700 p-2"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-4">
                        <label htmlFor={`specifications-${item.cartItemId}`} className="block text-sm font-medium text-gray-700">
                          Special Instructions
                        </label>
                        <textarea
                          id={`specifications-${item.cartItemId}`}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          rows={3}
                          placeholder="Add any special instructions for this item"
                          value={item.specifications || ''}
                          onChange={(e) => handleSpecificationsChange(item.cartItemId, e.target.value)}
                        ></textarea>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div> 

            <div className="lg:col-span-5">
              <div className="bg-white shadow sm:rounded-lg p-6 rounded-[16px]">
                <h2 className="text-lg font-medium text-gray-900 mb-6">Order Summary</h2>
                
                <div className="space-y-6">
                  <div>
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
                    <div>
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
                    <div>
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
                            {location} - {formatPrice(price)}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="border-t border-gray-200 pt-4">
                    <dl className="space-y-4">
                      <div className="flex items-center justify-between">
                        <dt className="text-sm text-gray-600">Subtotal</dt>
                        <dd className="text-sm font-medium text-gray-900">{formatPrice(totalPrice)}</dd>
                      </div>
                      {orderType === 'delivery' && (
                        <div className="flex items-center justify-between">
                          <dt className="text-sm text-gray-600">Delivery</dt>
                          <dd className="text-sm font-medium text-gray-900">{formatPrice(deliveryPrice)}</dd>
                        </div>
                      )}
                      <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                        <dt className="text-base font-medium text-gray-900">Total</dt>
                        <dd className="text-base font-medium text-gray-900">{formatPrice(finalPrice)}</dd>
                      </div>
                    </dl>
                  </div>
                   
                  <div>
                    <button
                      onClick={handleCheckout}
                      className="w-full bg-red-900 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Proceed to Checkout
                    </button>
                  </div>
                  <Link
                    to="/menu"
                    className="text-sm text-red-900 hover:text-red-800 flex items-center justify-center mt-4"
                  >
                    ← Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}

      {showBranchLocationModal && (
        <BranchLocationModal
          isOpen={showBranchLocationModal}
          onClose={() => setShowBranchLocationModal(false)}
          branches={branches}
          onSelect={handleBranchLocationSelect}
        />
      )}
    </div>
  );
};

export default ShoppingCartPage;

