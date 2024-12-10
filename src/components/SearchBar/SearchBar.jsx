import React, { useState, useEffect } from 'react';
import { FiSearch } from 'react-icons/fi';
import { IoClose, IoFastFoodOutline, IoCartOutline } from 'react-icons/io5';
import { toast } from 'react-toastify';
import styles from './SearchBar.module.css';
import menuItemsData from '../MenuItemsFallBackData/menuItemsData.json';
import { categories as categoryData } from '../DataCategory/Data.json';
import { useShoppingCart } from '../ShoppingCart/ShoppingCartContext';

const formatPrice = (price) => {
  return price.toLocaleString('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

const FilterModal = ({ isOpen, onClose, filters, setFilters }) => {
  const handleFilterChange = (filter) => {
    setFilters((prev) => ({ ...prev, [filter]: !prev[filter] }));
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>Filter Options</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <IoClose size={24} />
          </button>
        </div>
        <div className={styles.filterOptions}>
          {Object.entries(filters).map(([key, value]) => (
            <div key={key} className={styles.filterOption}>
              <input
                className={styles.checkbox}
                type="checkbox"
                id={key}
                checked={value}
                onChange={() => handleFilterChange(key)}
              />
              <label htmlFor={key}>
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </label>
            </div>
          ))}
        </div>
        <button className={styles.applyBtn} onClick={onClose}>
          Apply Filters
        </button>
      </div>
    </div>
  );
};

const SearchResultsModal = ({ items, categories, onClose }) => {
  const { addToCart } = useShoppingCart();

  const handleAddToCart = (item) => {
    addToCart(item);
    toast.success(`${item.name} added to cart!`);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()}
      >
        <IoClose className={styles.closeIcon} onClick={onClose} />
        <h2 className={styles.categoriesName}>Search Results</h2>
        {(categories.length > 0 || items.length > 0) ? (
          <>
            {categories.length > 0 && (
              <div>
                <h3 className={styles.categoriesName}>Categories</h3>
                <ul>
                  {categories.map((category, index) => (
                    <li key={`category-${index}`}>
                      <span className={styles.itemName}>{category.title}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {items.length > 0 && (
              <div>
                <h3 className={styles.categoriesName}>Menu Items</h3>
                <ul>
                  {items.map((item, index) => (
                    <li 
                      key={`item-${index}`} 
                      className={styles.searchResultItem}
                      onClick={() => handleAddToCart(item)}
                    >
                      <span className={styles.itemName}>{item.name}</span>
                      <span className={styles.itemPrice}>
                        {formatPrice(parseFloat(item.price))}
                      </span>
                      <IoCartOutline
                        className={styles.addToCartIcon}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(item);
                        }}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : (
          <p>No items or categories found.</p>
        )}
      </div>
    </div>
  );
};

const SearchBar = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    vegetarian: false,
    vegan: false,
    glutenFree: false,
    dairyFree: false,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [allMenuItems, setAllMenuItems] = useState([]);

  useEffect(() => {
    setAllMenuItems(menuItemsData);
  }, []);

  const filterMenuItems = (searchTerm) => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    return allMenuItems.filter(
      (item) =>
        item.name.toLowerCase().includes(lowerSearchTerm) ||
        (item.category && item.category.toLowerCase().includes(lowerSearchTerm))
    );
  };

  const filterCategories = (searchTerm) => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    return categoryData.filter((category) =>
      category.title.toLowerCase().includes(lowerSearchTerm)
    );
  };

  const handleSearch = (e) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);

    if (newSearchTerm.length > 0) {
      const filteredMenuItems = filterMenuItems(newSearchTerm);
      const filteredCategoryItems = filterCategories(newSearchTerm);
      setFilteredItems(filteredMenuItems);
      setFilteredCategories(filteredCategoryItems);
      setIsModalOpen(true);
    } else {
      setFilteredItems([]);
      setFilteredCategories([]);
      setIsModalOpen(false);
    }
  };

  return (
    <div className={styles.searchContainer}>
      <form
        onSubmit={(e) => e.preventDefault()}
        className={styles.searchBar}
      >
        <div className={styles.searchIcon}>
          <FiSearch size={20} />
        </div>
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearch}
        />
        <button
          type="button"
          className={`${styles.filterBtn} ${styles.pulsating}`}
          onClick={() => setIsFilterOpen(true)}
        >
          <IoFastFoodOutline size={20} />
        </button>
      </form>

      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        setFilters={setFilters}
      />

      {isModalOpen && (
        <SearchResultsModal
          items={filteredItems}
          categories={filteredCategories}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default SearchBar;