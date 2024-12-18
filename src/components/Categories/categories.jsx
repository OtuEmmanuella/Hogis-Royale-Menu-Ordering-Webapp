// import React, { useState, useEffect, useCallback, Suspense } from 'react';
// import { IoGrid, IoList } from "react-icons/io5";
// import { collection, query, orderBy, getDocs } from 'firebase/firestore';
// import categories from '../CategoryIcon/Categoryicon.jsx';
// import { db } from '../Firebase/FirebaseConfig.jsx';
// import { categories as categoryData } from '../DataCategory/Data.json';
// import menuItemsData from '../MenuItemsFallBackData/menuItemsData.json';
// import { DotSpinner } from '@uiball/loaders';


// const CategoryModal = React.lazy(() => import('../Categories/CategoryModal/CategoryModal.jsx'));
// const PUBLIC_URL = '';

// const ITEMS_PER_PAGE = 12;
// const CACHE_EXPIRATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

// const Categories = ({ addToCart }) => {
//   const [isGridView, setIsGridView] = useState(true);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [selectedCategory, setSelectedCategory] = useState(null);
//   const [menuItems, setMenuItems] = useState({});
//   const [categories, setCategories] = useState(categoryData);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const fetchCategoryData = useCallback(async (category) => {
//     try {
//       const itemsCollection = collection(db, 'menu_items');
//       let q = query(itemsCollection, orderBy('name'));

//       const querySnapshot = await getDocs(q);

//       if (querySnapshot.empty) {
//         console.warn(`No documents found for category: ${category}`);
//         const fallbackItems = menuItemsData.filter(item => item.category.toUpperCase() === category.toUpperCase());
//         return { items: fallbackItems };
//       } else {
//         const allItems = querySnapshot.docs.map(doc => ({
//           id: doc.id,
//           ...doc.data()
//         }));

//         // Filter items by category on the client side
//         const firestoreItems = allItems.filter(item => item.category.toUpperCase() === category.toUpperCase());

//         // Fetch fallback items from JSON file
//         const fallbackItems = menuItemsData.filter(item => item.category.toUpperCase() === category.toUpperCase());

//         // Merge Firestore and fallback items
//         const items = [...firestoreItems, ...fallbackItems];

//         return { items };
//       }
//     } catch (error) {
//       console.error("Error fetching category data:", error);
//       const fallbackItems = menuItemsData.filter(item => item.category.toUpperCase() === category.toUpperCase());
//       return { items: fallbackItems };
//     }
//   }, []);

//   const loadCategoryData = useCallback(async (category) => {
//     const cachedData = localStorage.getItem(`menuItems_${category}`);
//     const cachedTimestamp = localStorage.getItem(`menuItems_${category}_timestamp`);

//     if (cachedData && cachedTimestamp) {
//       const parsedData = JSON.parse(cachedData);
//       const timestamp = parseInt(cachedTimestamp, 10);

//       if (Date.now() - timestamp < CACHE_EXPIRATION) {
//         setMenuItems(prevItems => ({ ...prevItems, [category]: parsedData }));
//         setIsLoading(false);
//         return;
//       }
//     }

//     try {
//       const { items } = await fetchCategoryData(category);
//       if (items.length > 0) {
//         setMenuItems(prevItems => ({ ...prevItems, [category]: items }));
//         localStorage.setItem(`menuItems_${category}`, JSON.stringify(items));
//         localStorage.setItem(`menuItems_${category}_timestamp`, Date.now().toString());
//       } else {
//         setError(`No menu items available for ${category}. Please try again later.`);
//       }
//     } catch (error) {
//       console.error(`Error loading data for ${category}:`, error);
//       setError(`Unable to load menu items for ${category}. Please check your internet connection and try again.`);
//     } finally {
//       setIsLoading(false);
//     }
//   }, [fetchCategoryData]);

//   useEffect(() => {
//     if (selectedCategory) {
//       loadCategoryData(selectedCategory);
//     }
//   }, [selectedCategory, loadCategoryData]);

//   useEffect(() => {
//     if (categories.length === 0) {
//       setError("Unable to load categories. Please try again later.");
//     }
//     setIsLoading(false);
//   }, [categories]);

//   const toggleView = useCallback(() => {
//     setIsGridView(prev => !prev);
//     setCurrentPage(1);
//   }, []);

//   const totalPages = Math.ceil(categories.length / ITEMS_PER_PAGE);

//   const getPaginatedData = useCallback(() => {
//     const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
//     const endIndex = startIndex + ITEMS_PER_PAGE;
//     return categories.slice(startIndex, endIndex);
//   }, [currentPage, categories]);

//   const handlePageChange = useCallback((page) => {
//     setCurrentPage(page);
//   }, []);

//   const openModal = useCallback((category) => {
//     const upperCategory = category.toUpperCase();
//     setSelectedCategory(upperCategory);
//   }, []);

//   const closeModal = useCallback(() => {
//     setSelectedCategory(null);
//   }, []);

//   const displayedCategories = isGridView ? getPaginatedData() : categories;

//   if (isLoading) {
//     <div style={{
//       position: 'fixed',
//       top: 0,
//       left: 0,
//       right: 0,
//       bottom: 0,
//       display: 'flex',
//       justifyContent: 'center',
//       alignItems: 'center',
//       backgroundColor: 'rgba(0, 0, 0, 0.5)', // Optional: adds a semi-transparent overlay
//     }}>
//     <DotSpinner size={40} speed={0.9} color="white" />
//     </div>
//   }

//   return (
//     <section className="categories">
//       {error && <div className="error-message">{error}</div>}
//       <div className='categories-info'>
//         <h3>Categories</h3>
//         <button onClick={toggleView} className="view-toggle">
//           {isGridView ? <IoList className='list' /> : <IoGrid />}
//         </button>
//       </div>
//       <div className={`category-container ${isGridView ? 'grid-view' : 'list-view'}`}>
//         {displayedCategories.map((category) => (
//           <div key={category.title} className="category" onClick={() => openModal(category.title)}>
//             <img
//               src={category.image}
//               alt={category.title}
//               className="category-image"
//               onError={(e) => {
//                 console.error(`Error loading image for ${category.title}:`, e.target.src);
//               }}
//             />
//             <span className="category-title">{category.title}</span>
//           </div>
//         ))}
//       </div>
//       {isGridView && (
//         <div className="pagination">
//           {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
//             <button
//               key={page}
//               onClick={() => handlePageChange(page)}
//               className={currentPage === page ? 'active' : ''}
//             >
//               {page}
//             </button>
//           ))}
//         </div>
//       )}
//       <Suspense fallback={<div>Loading...</div>}>
//         {selectedCategory && (
//           <CategoryModal
//             category={selectedCategory}
//             items={menuItems[selectedCategory] || []}
//             onClose={closeModal}
//             addToCart={addToCart}
//           />
//         )}
//       </Suspense>
//     </section>
//   );
// };

// export default Categories;


// import React, { useState, useEffect, useCallback, Suspense } from 'react';
// import { IoGrid, IoList } from "react-icons/io5";
// import { collection, query, orderBy, getDocs } from 'firebase/firestore';
// import { db } from '../Firebase/FirebaseConfig.jsx';
// import { categories as categoryData } from '../DataCategory/Data.json';
// import menuItemsData from '../MenuItemsFallBackData/menuItemsData.json';
// import { DotSpinner } from '@uiball/loaders';
// import '../CategoryIcon/Categoryicon.jsx'

// const CategoryModal = React.lazy(() => import('../Categories/CategoryModal/CategoryModal.jsx'));

// const ITEMS_PER_PAGE = 12;

// const Categories = ({ addToCart }) => {
//   const [isGridView, setIsGridView] = useState(true);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [selectedCategory, setSelectedCategory] = useState(null);
//   const [menuItems, setMenuItems] = useState({});
//   const [categories, setCategories] = useState(categoryData);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const fetchCategoryData = useCallback(async (category) => {
//     try {
//       const itemsCollection = collection(db, 'menu_items');
//       let q = query(itemsCollection, orderBy('name'));

//       const querySnapshot = await getDocs(q);

//       if (querySnapshot.empty) {
//         console.warn(`No documents found for category: ${category}`);
//         const fallbackItems = menuItemsData.filter(item => item.category.toUpperCase() === category.toUpperCase());
//         return { items: fallbackItems };
//       } else {
//         const allItems = querySnapshot.docs.map(doc => ({
//           id: doc.id,
//           ...doc.data()
//         }));

//         // Filter items by category on the client side
//         const firestoreItems = allItems.filter(item => item.category.toUpperCase() === category.toUpperCase());

//         // Return only the Firestore items without fallback
//         return { items: firestoreItems };
//       }
//     } catch (error) {
//       console.error("Error fetching category data:", error);
//       const fallbackItems = menuItemsData.filter(item => item.category.toUpperCase() === category.toUpperCase());
//       return { items: fallbackItems };
//     }
//   }, []);

//   const loadCategoryData = useCallback(async (category) => {
//     setIsLoading(true);
//     try {
//       const { items } = await fetchCategoryData(category);
//       if (items.length > 0) {
//         setMenuItems(prevItems => ({ ...prevItems, [category]: items }));
//       } else {
//         setError(`No menu items available for ${category}. Please try again later.`);
//       }
//     } catch (error) {
//       console.error(`Error loading data for ${category}:`, error);
//       setError(`Unable to load menu items for ${category}. Please check your internet connection and try again.`);
//     } finally {
//       setIsLoading(false);
//     }
//   }, [fetchCategoryData]);

//   useEffect(() => {
//     if (selectedCategory) {
//       loadCategoryData(selectedCategory);
//     }
//   }, [selectedCategory, loadCategoryData]);

//   useEffect(() => {
//     if (categories.length === 0) {
//       setError("Unable to load categories. Please try again later.");
//     }
//     setIsLoading(false);
//   }, [categories]);

//   const toggleView = useCallback(() => {
//     setIsGridView(prev => !prev);
//     setCurrentPage(1);
//   }, []);

//   const totalPages = Math.ceil(categories.length / ITEMS_PER_PAGE);

//   const getPaginatedData = useCallback(() => {
//     const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
//     const endIndex = startIndex + ITEMS_PER_PAGE;
//     return categories.slice(startIndex, endIndex);
//   }, [currentPage, categories]);

//   const handlePageChange = useCallback((page) => {
//     setCurrentPage(page);
//   }, []);

//   const openModal = useCallback((category) => {
//     const upperCategory = category.toUpperCase();
//     setSelectedCategory(upperCategory);
//   }, []);

//   const closeModal = useCallback(() => {
//     setSelectedCategory(null);
//   }, []);

//   const displayedCategories = isGridView ? getPaginatedData() : categories;

//   if (isLoading) {
//     return (
//       <div style={{
//         position: 'fixed',
//         top: 0,
//         left: 0,
//         right: 0,
//         bottom: 0,
//         display: 'flex',
//         justifyContent: 'center',
//         alignItems: 'center',
//         backgroundColor: 'rgba(0, 0, 0, 0.5)',
//       }}>
//         <DotSpinner size={40} speed={0.9} color="white" />
//       </div>
//     );
//   }

//   return (
//     <section className="categories">
//       {error && <div className="error-message">{error}</div>}
//       <div className='categories-info'>
//         <h3>Categories</h3>
//         <button onClick={toggleView} className="view-toggle">
//           {isGridView ? <IoList className='list' /> : <IoGrid />}
//         </button>
//       </div>
//       <div className={`category-container ${isGridView ? 'grid-view' : 'list-view'}`}>
//         {displayedCategories.map((category) => (
//           <div key={category.title} className="category" onClick={() => openModal(category.title)}>
//             <img
//               src={category.image}
//               alt={category.title}
//               className="category-image"
//               onError={(e) => {
//                 console.error(`Error loading image for ${category.title}:`, e.target.src);
//               }}
//             />
//             <span className="category-title">{category.title}</span>
//           </div>
//         ))}
//       </div>
//       {isGridView && (
//         <div className="pagination">
//           {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
//             <button
//               key={page}
//               onClick={() => handlePageChange(page)}
//               className={currentPage === page ? 'active' : ''}
//             >
//               {page}
//             </button>
//           ))}
//         </div>
//       )}
//       <Suspense fallback={<div>Loading...</div>}>
//         {selectedCategory && (
//           <CategoryModal
//             category={selectedCategory}
//             items={menuItems[selectedCategory] || []}
//             onClose={closeModal}
//             addToCart={addToCart}
//           />
//         )}
//       </Suspense>
//     </section>
//   );
// };

// export default Categories;



// import React, { useState, useEffect, useCallback } from 'react';
// import { IoGrid, IoList } from "react-icons/io5";
// import { collection, query, orderBy, getDocs } from 'firebase/firestore';
// import { db } from '../Firebase/FirebaseConfig.jsx';
// import { categories as categoryData } from '../DataCategory/Data.json';
// import menuItemsData from '../MenuItemsFallBackData/menuItemsData.json';
// import { DotSpinner } from '@uiball/loaders';
// import '../CategoryIcon/Categoryicon.jsx';
// import CategoryModal from '../Categories/CategoryModal/CategoryModal.jsx';  // Direct import

// const ITEMS_PER_PAGE = 12;

// const Categories = ({ addToCart }) => {
//   const [isGridView, setIsGridView] = useState(true);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [selectedCategory, setSelectedCategory] = useState(null);
//   const [menuItems, setMenuItems] = useState({});
//   const [categories, setCategories] = useState(categoryData);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const fetchCategoryData = useCallback(async (category) => {
//     try {
//       const itemsCollection = collection(db, 'menu_items');
//       const q = query(itemsCollection, orderBy('name'));
//       const querySnapshot = await getDocs(q);

//       // Handle empty query result
//       if (querySnapshot.empty) {
//         console.warn(`No documents found for category: ${category}`);
//         throw new Error('No Firestore data available');
//       }

//       const allItems = querySnapshot.docs.map(doc => ({
//         id: doc.id,
//         ...doc.data(),
//       }));

//       // Filter Firestore items by category
//       const firestoreItems = allItems.filter(item => item.category.toUpperCase() === category.toUpperCase());

//       if (firestoreItems.length === 0) {
//         console.warn(`No Firestore items match category: ${category}`);
//         throw new Error('No matching Firestore data');
//       }

//       return { items: firestoreItems };
//     } catch (error) {
//       console.error("Error fetching category data:", error);

//       // Return fallback items if there was an error
//       const fallbackItems = menuItemsData.filter(item => item.category.toUpperCase() === category.toUpperCase());
//       return { items: fallbackItems };
//     }
//   }, []);

//   const loadCategoryData = useCallback(async (category) => {
//     setIsLoading(true);
//     setError(null);
//     try {
//       const { items } = await fetchCategoryData(category);
//       setMenuItems(prevItems => ({ ...prevItems, [category]: items }));
//     } catch (error) {
//       console.error(`Error loading data for ${category}:`, error);
//       setError(`Unable to load menu items for ${category}. Please try again.`);
//     } finally {
//       setIsLoading(false);
//     }
//   }, [fetchCategoryData]);

//   useEffect(() => {
//     if (selectedCategory) {
//       loadCategoryData(selectedCategory);
//     }
//   }, [selectedCategory, loadCategoryData]);

//   useEffect(() => {
//     if (categories.length === 0) {
//       setError("Unable to load categories. Please try again later.");
//     }
//     setIsLoading(false);
//   }, [categories]);

//   const toggleView = useCallback(() => {
//     setIsGridView(prev => !prev);
//     setCurrentPage(1);
//   }, []);

//   const totalPages = Math.ceil(categories.length / ITEMS_PER_PAGE);

//   const getPaginatedData = useCallback(() => {
//     const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
//     const endIndex = startIndex + ITEMS_PER_PAGE;
//     return categories.slice(startIndex, endIndex);
//   }, [currentPage, categories]);

//   const handlePageChange = useCallback((page) => {
//     setCurrentPage(page);
//   }, []);

//   const openModal = useCallback((category) => {
//     const upperCategory = category.toUpperCase();
//     setSelectedCategory(upperCategory);
//   }, []);

//   const closeModal = useCallback(() => {
//     setSelectedCategory(null);
//   }, []);

//   const displayedCategories = isGridView ? getPaginatedData() : categories;

//   if (isLoading) {
//     return (
//       <div style={{
//         position: 'fixed',
//         top: 0,
//         left: 0,
//         right: 0,
//         bottom: 0,
//         display: 'flex',
//         justifyContent: 'center',
//         alignItems: 'center',
//         backgroundColor: 'rgba(0, 0, 0, 0.5)',
//       }}>
//         <DotSpinner size={40} speed={0.9} color="white" />
//       </div>
//     );
//   }

//   return (
//     <section className="categories">
//       {error && <div className="error-message">{error}</div>}
//       <div className='categories-info'>
//         <h3>Categories</h3>
//         <button onClick={toggleView} className="view-toggle">
//           {isGridView ? <IoList className='list' /> : <IoGrid />}
//         </button>
//       </div>
//       <div className={`category-container ${isGridView ? 'grid-view' : 'list-view'}`}>
//         {displayedCategories.map((category) => (
//           <div key={category.title} className="category" onClick={() => openModal(category.title)}>
//             <img
//               src={category.image}
//               alt={category.title}
//               className="category-image"
//               onError={(e) => {
//                 console.error(`Error loading image for ${category.title}:`, e.target.src);
//               }}
//             />
//             <span className="category-title">{category.title}</span>
//           </div>
//         ))}
//       </div>
//       {isGridView && (
//         <div className="pagination">
//           {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
//             <button
//               key={page}
//               onClick={() => handlePageChange(page)}
//               className={currentPage === page ? 'active' : ''}
//             >
//               {page}
//             </button>
//           ))}
//         </div>
//       )}
//       {selectedCategory && (
//         <CategoryModal
//           category={selectedCategory}
//           items={menuItems[selectedCategory] || []}
//           onClose={closeModal}
//           addToCart={addToCart}
//         />
//       )}
//     </section>
//   );
// };

// export default Categories;

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { IoGrid, IoList } from "react-icons/io5";
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../Firebase/FirebaseConfig.jsx';
import { categories as categoryData } from '../DataCategory/Data.json';
import menuItemsData from '../MenuItemsFallBackData/menuItemsData.json';
import { DotSpinner } from '@uiball/loaders';
import '../CategoryIcon/Categoryicon.jsx';
import CategoryModal from '../Categories/CategoryModal/CategoryModal.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

const ITEMS_PER_PAGE = 12;

const Categories = ({ addToCart }) => {
  const [isGridView, setIsGridView] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [menuItems, setMenuItems] = useState({});
  const [categories, setCategories] = useState(categoryData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalLoading, setIsModalLoading] = useState(false);
  
  // Ref to track current loading request
  const currentLoadingRef = useRef(null);

  const fetchCategoryData = useCallback(async (category) => {
    try {
      const itemsCollection = collection(db, 'menu_items');
      const q = query(itemsCollection, orderBy('name'));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.warn(`No documents found for category: ${category}`);
        throw new Error('No Firestore data available');
      }

      const allItems = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      const firestoreItems = allItems.filter(item => item.category.toUpperCase() === category.toUpperCase());

      if (firestoreItems.length === 0) {
        console.warn(`No Firestore items match category: ${category}`);
        throw new Error('No matching Firestore data');
      }

      return { items: firestoreItems };
    } catch (error) {
      console.error("Error fetching category data:", error);
      const fallbackItems = menuItemsData.filter(item => item.category.toUpperCase() === category.toUpperCase());
      return { items: fallbackItems };
    }
  }, []);

  const loadCategoryData = useCallback(async (category) => {
    // Cancel previous loading request if it exists
    if (currentLoadingRef.current) {
      currentLoadingRef.current.cancel = true;
    }

    // Create a new loading request tracker
    const loadingRequest = { cancel: false };
    currentLoadingRef.current = loadingRequest;

    setIsModalLoading(true);
    setError(null);

    try {
      const { items } = await fetchCategoryData(category);
      
      // Only update if this request hasn't been cancelled
      if (!loadingRequest.cancel) {
        setMenuItems(prevItems => ({ ...prevItems, [category]: items }));
        setIsModalLoading(false);
      }
    } catch (error) {
      // Only show error if this request hasn't been cancelled
      if (!loadingRequest.cancel) {
        console.error(`Error loading data for ${category}:`, error);
        toast.error(`Unable to load menu items for ${category}. Please try again.`);
        setError(`Unable to load menu items for ${category}. Please try again.`);
        setIsModalLoading(false);
      }
    }
  }, [fetchCategoryData]);

  useEffect(() => {
    if (selectedCategory) {
      loadCategoryData(selectedCategory);
    }
  }, [selectedCategory, loadCategoryData]);

  useEffect(() => {
    if (categories.length === 0) {
      setError("Unable to load categories. Please try again later.");
    }
    setIsLoading(false);
  }, [categories]);

  const toggleView = useCallback(() => {
    setIsGridView(prev => !prev);
    setCurrentPage(1);
  }, []);

  const totalPages = Math.ceil(categories.length / ITEMS_PER_PAGE);

  const getPaginatedData = useCallback(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return categories.slice(startIndex, endIndex);
  }, [currentPage, categories]);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  const openModal = useCallback((category) => {
    const upperCategory = category.toUpperCase();
    setSelectedCategory(upperCategory);
  }, []);

  const closeModal = useCallback(() => {
    setSelectedCategory(null);
  }, []);

  const displayedCategories = isGridView ? getPaginatedData() : categories;

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 }
  };

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.5
  };

  if (isLoading) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 9999
      }}>
        <DotSpinner size={40} speed={0.9} color="white" />
      </div>
    );
  }

  return (
    <section className="categories">
      {error && <div className="error-message">{error}</div>}
      <div className='categories-info'>
        <h3>Categories</h3>
        <button onClick={toggleView} className="view-toggle">
          {isGridView ? <IoList className='list' /> : <IoGrid />}
        </button>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
          className={`category-container ${isGridView ? 'grid-view' : 'list-view'}`}
        >
          {displayedCategories.map((category) => (
            <motion.div
              key={category.title}
              className="category"
              onClick={() => openModal(category.title)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <img
                src={category.image}
                alt={category.title}
                className="category-image"
                onError={(e) => {
                  console.error(`Error loading image for ${category.title}:`, e.target.src);
                }}
              />
              <span className="category-title">{category.title}</span>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
      {isGridView && (
        <div className="pagination">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <motion.button
              key={page}
              onClick={() => handlePageChange(page)}
              className={currentPage === page ? 'active' : ''}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {page}
            </motion.button>
          ))}
        </div>
      )}
      {selectedCategory && (
        <CategoryModal
          category={selectedCategory}
          items={menuItems[selectedCategory] || []}
          onClose={closeModal}
          addToCart={addToCart}
          isLoading={isModalLoading}
        />
      )}
      {isModalLoading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 9999
        }}>
          <DotSpinner size={40} speed={0.9} color="white" />
        </div>
      )}
    </section>
  );
};

export default Categories;




