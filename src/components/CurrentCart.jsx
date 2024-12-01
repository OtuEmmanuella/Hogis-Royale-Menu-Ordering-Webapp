import React from 'react';
import { ShoppingBag } from 'lucide-react';
import emptyBasket from '/empty-bag.svg';

const CurrentCart = ({ cartItems }) => {
  const formatPrice = (price) => {
    return `₦${price.toLocaleString('en-NG', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })}`;
  };

  return (
    <div className="uap-card uap-current-cart">
      <h2 className="uap-card-title">
        <ShoppingBag className="uap-icon" /> Current Cart
      </h2>
      {cartItems.length === 0 ? (
        <div className='uap-empty-state'>
          <img src={emptyBasket} alt="Empty cart" className="uap-empty-illustration" />
          <p className="uap-no-items">Your cart is empty.</p>
        </div>
      ) : (
        <ul className="uap-cart-list">
          {cartItems.map((item) => (
            <li key={item.id} className="uap-cart-item">
              <p className="uap-item-name"><strong>{item.name}</strong></p>
              <p className="uap-item-quantity">Quantity: {item.quantity}</p>
              <p className="uap-item-price">Price: {formatPrice(item.price * item.quantity)}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CurrentCart;
