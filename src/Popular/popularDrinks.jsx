import React, { useState } from 'react';
import styles from '../styles/popular-drinks.module.css';
import { useShoppingCart } from '../components/ShoppingCart/ShoppingCartContext';
import { toast } from 'react-toastify';

const popularDrinks = [
  {
    id: '1',
    name: 'Jameson Green',
    image: '/populardrinks/Jameson_green.webp',
    price: 50000,
    volume: '750 ml',
    abv: '10.5% ABV',
    quantity: 1
  },
  {
    id: '2',
    name: 'Chivita Exotic',
    image: '/populardrinks/chivita.png',
    price: 1000,
    volume: '750 ml',
    abv: '9% ABV',
    quantity: 1
  },
  
  {
    id: '3',
    name: 'Jameson Black Barrel',
    image: '/populardrinks/jameson black.png',
    price: 70000,
    volume: '750 ml',
    abv: '9% ABV',
    quantity: 1
  },
  {
    id: '4',
    name: 'Jack Daniels Big',
    image: '/populardrinks/jack daniels.png',
    price: 50000,
    volume: '750 ml',
    abv: '9% ABV',
    quantity: 1
  },
  {
    id: '5',
    name: 'Four Cousins | Red Wine',
    image: '/populardrinks/Four Cousin.png',
    price: 6000,
    volume: '70 cl',
    abv: '40% ABV',
    quantity: 1
  },
  {
    id: '6',
    name: 'Coke',
    image: '/populardrinks/coke.png',
    price: 800,
    volume: '750 ml',
    abv: '9% ABV',
    quantity: 1
  },
  {
    id: '7',
    name: 'Nestle Bottle Water',
    image: '/populardrinks/Nestle water.png',
    price: 1000,
    volume: '750 ml',
    abv: '9% ABV',
    quantity: 1
  },
  {
    id: '8',
    name: 'Pepsi',
    image: '/populardrinks/pepsi.png',
    price: 1000,
  },
];
const SimilarItems = () => {
  const { addToCart } = useShoppingCart();
  const [drinks, setDrinks] = useState(popularDrinks);

  const handleAddToCart = (drink) => {
    addToCart({
      id: drink.id,
      name: drink.name,
      price: drink.price,
      quantity: drink.quantity
    });
    toast.success(`${drink.name} added to cart!`);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Popular Drinks</h1>
      <div className={styles.itemsContainer}>
        <div className={styles.scrollContainer}>
          {drinks.map((drink) => (
            <div key={drink.id} className={styles.item}>
              <img src={drink.image} alt={drink.name} className={styles.image} />
                <div className={styles.name}>{drink.name}</div>
                <div className={styles.price}>₦{drink.price.toLocaleString()}</div>
                <button className={styles.addToCartButton} onClick={() => handleAddToCart(drink)}>
                  Add to Cart
                </button>
              </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SimilarItems;
