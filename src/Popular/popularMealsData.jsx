import React, { useState } from 'react';
import styles from '../styles/PopularMeals.module.css';
import { useShoppingCart } from '../components/ShoppingCart/ShoppingCartContext'; 
import { toast } from 'react-toastify'; 


const HeartIcon = ({ filled }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill={filled ? '#ef4444' : 'none'}
    stroke={filled ? '#ef4444' : '#000000'}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
  </svg>
);

export const popularRestaurants = [
    {
      id: '1',
      name: 'Peri Peri Jollof Delight',
      image: '/popularmeals/popular 1.jpg',
      rating: 4.8,
      reviews: '300+',
      price: '21000',
      buy: 'Add to Cart',
      tags: ['SNAP'],
      isFavorite: false
    },
   
    {
      id: '2',
      name: "Royale Chef's Special Basmati Bliss",
      image: '/popularmeals/popular 4.jpg',
      rating: 4.9,
      reviews: '500+',
      price: '15000',
      buy: 'Add to Cart',
      isFavorite: false
    },
    {
      id: '3',
      name: 'Loaded Veggie-Beef Fries',
      image: '/popularmeals/popular 5.jpg',
      rating: 4.7,
      reviews: '1000+', 
      price: '17000',
      buy: 'Add to Cart',
      isFavorite: false
    },
    {
      id: '4',
      name: 'Classic Caesar Delight',
      image: '/popularmeals/popular 2.jpg',
      rating: 4.8,
      reviews: '900+',
     price: '7500',
      buy: 'Add to Cart',
      isFavorite: true
    },
   
    {
      id: '5',
      name: 'Royale Grill Fiesta',
      image: '/popularmeals/popular 6.jpg',
      rating: 4.9,
      reviews: '1000+',
      price: '100000',
      buy: 'Add to Cart',
      isFavorite: false
    }
  ];
  
  const PopularMeals = () => {
    const { addToCart } = useShoppingCart(); // Get addToCart method from context
    const [restaurants, setRestaurants] = useState(popularRestaurants);
  
    const toggleFavorite = (id) => {
      setRestaurants(prevRestaurants =>
        prevRestaurants.map(restaurant =>
          restaurant.id === id
            ? { ...restaurant, isFavorite: !restaurant.isFavorite }
            : restaurant
        )
      );
    };

    const handleAddToCart = (restaurant) => {
    // Prepare the item to be added to cart
    const cartItem = {
      id: restaurant.id,
      name: restaurant.name,
      price: parseFloat(restaurant.price.replace(/,/g, '')), // Convert price to number
      image: restaurant.image
    };

    // Add item to cart
    addToCart(cartItem);

    // Show a toast notification
    toast.success(`${restaurant.name} added to cart!`, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };
  
    return (
      <section className={styles.container}>
        <h2 className={styles.title}>Popular Meals</h2>
        <div className={styles.slider}>
          {restaurants.map(restaurant => (
            <article key={restaurant.id} className={styles.card}>
              <div className={styles.imageContainer}>
                <img
                  src={restaurant.image}
                  alt={restaurant.name}
                  className={styles.image}
                />
                  <div 
                  className={styles.buy} 
                  onClick={() => handleAddToCart(restaurant)}
                >
                  {restaurant.buy}
                </div>
                <button
                  className={styles.favorite}
                  onClick={() => toggleFavorite(restaurant.id)}
                  aria-label={`${restaurant.isFavorite ? 'Remove from' : 'Add to'} favorites`}
                >
                  <HeartIcon filled={restaurant.isFavorite} />
                </button>
              </div>
              <div className={styles.content}>
                <div>
                  <h3 className={styles.name}>{restaurant.name}</h3>
                  <div className={styles.rating}>
                    <span className={styles.star}>★</span>
                    <span>{restaurant.rating}</span>
                    <span className={styles.reviews}>({restaurant.reviews})</span>
                  </div>
                </div>
                <p className={styles.price}>₦{Number(restaurant.price).toLocaleString()}</p>


      
              </div>
            </article>
          ))}
        </div>
      </section>
    );
  };
  
  export default PopularMeals;