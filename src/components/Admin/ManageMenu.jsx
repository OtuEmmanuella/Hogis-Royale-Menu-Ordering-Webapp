import React, { useState, useEffect, useCallback } from 'react';
import { db, storage, auth } from '../Firebase/FirebaseConfig';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { useAuthState } from 'react-firebase-hooks/auth';
import Papa from 'papaparse';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ManageMenu = () => {
  const [user, loading, error] = useAuthState(auth);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [newMenuItem, setNewMenuItem] = useState({
    category: '',
    name: '',
    price: '',
  });
  const [editItemId, setEditItemId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);

  const fetchMenuItems = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'menu_items'));
      const menuItemsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMenuItems(menuItemsData);

      const uniqueCategories = [...new Set(menuItemsData.map(item => item.category))];
      setCategories(uniqueCategories.map(category => ({ id: category, title: category })));
    } catch (error) {
      toast.error('Failed to fetch menu items. Please try again later.');
    }
  }, []);

  useEffect(() => {
    if (user) {
      setIsLoading(true);
      fetchMenuItems()
        .then(() => {
          setIsLoading(false);
        })
        .catch(() => {
          setIsLoading(false);
        });
    } else {
      setMenuItems([]);
      setCategories([]);
      setIsLoading(false);
    }
  }, [user, fetchMenuItems]);

  const handleAddMenuItem = async (e) => {
    e.preventDefault();
    try {
      if (editItemId) {
        const menuItemRef = doc(db, 'menu_items', editItemId);
        await updateDoc(menuItemRef, newMenuItem);
        toast.success('Menu item updated successfully!');
      } else {
        await addDoc(collection(db, 'menu_items'), newMenuItem);
        toast.success('New menu item added successfully!');
      }
      fetchMenuItems();
      setNewMenuItem({ category: '', name: '', price: '' });
      setEditItemId(null);
    } catch (error) {
      toast.error('Failed to add/update menu item. Please try again.');
    }
  };

  const handleEditMenuItem = (item) => {
    setEditItemId(item.id);
    setNewMenuItem({
      category: item.category,
      name: item.name,
      price: item.price,
    });
  };

  const handleDeleteMenuItem = async (itemId, imageUrl) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: 'Do you really want to delete this menu item?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
      });

      if (result.isConfirmed) {
        await deleteDoc(doc(db, 'menu_items', itemId));
        if (imageUrl) {
          const imageRef = ref(storage, imageUrl);
          await deleteObject(imageRef);
        }
        fetchMenuItems();
        toast.success('Menu item deleted successfully!');
      }
    } catch (error) {
      toast.error('Failed to delete menu item. Please try again.');
    }
  };

  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        complete: async (results) => {
          try {
            setIsLoading(true);
            for (const item of results.data) {
              if (item.category && item.name && item.price) {
                await addDoc(collection(db, 'menu_items'), {
                  category: item.category.trim(),
                  name: item.name.trim(),
                  price: parseFloat(item.price) || 0,
                });
              }
            }
            toast.success('CSV data imported successfully!');
            fetchMenuItems();
          } catch (error) {
            toast.error('Failed to import CSV data. Please try again.');
          } finally {
            setIsLoading(false);
          }
        },
      });
    }
  };

  const filteredMenuItems = menuItems.filter(item =>
    item?.name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedCategory === 'All' || item.category === selectedCategory)
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredMenuItems.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const formatPrice = (price) => {
    return price.toLocaleString('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (error) return <div className="flex justify-center items-center h-screen">Error: {error.message}</div>;
  if (!user) return <div className="flex justify-center items-center h-screen">Please log in to manage menu items.</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Manage Menu</h1>

      <div className="mb-8 flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Search menu items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="All">All Categories</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>{category.title}</option>
          ))}
        </select>
        <label className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md cursor-pointer hover:bg-blue-600 transition duration-300">
          <span>Upload CSV</span>
          <input type="file" accept=".csv" onChange={handleCSVUpload} className="hidden" />
        </label>
      </div>

      <form onSubmit={handleAddMenuItem} className="mb-8 bg-white shadow-md rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Category"
            value={newMenuItem.category}
            onChange={(e) => setNewMenuItem({...newMenuItem, category: e.target.value})}
            required
            className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Name"
            value={newMenuItem.name}
            onChange={(e) => setNewMenuItem({...newMenuItem, name: e.target.value})}
            required
            className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            placeholder="Price"
            value={newMenuItem.price}
            onChange={(e) => setNewMenuItem({...newMenuItem, price: e.target.value})}
            required
            className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button type="submit" className="mt-4 w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition duration-300">
          {editItemId ? 'Update Menu Item' : 'Add Menu Item'}
        </button>
      </form>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">Loading menu items...</div>
      ) : currentItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {currentItems.map(item => (
            <div key={item.id} className="bg-white shadow-md rounded-lg p-6 transition duration-300 hover:shadow-lg">
              <h3 className="text-xl font-semibold mb-2 text-black">{item.name}</h3>
              <p className="text-gray-600 mb-2">Price: {formatPrice(parseFloat(item.price))}</p>
              <p className="text-gray-600 mb-4">Category: {item.category}</p>
              <div className="flex justify-between">
                <button onClick={() => handleEditMenuItem(item)} className="bg-blue-500 text-white py-1 px-3 rounded-md hover:bg-blue-600 transition duration-300">Edit</button>
                <button onClick={() => handleDeleteMenuItem(item.id, item.imageUrl)} className="bg-red-500 text-white py-1 px-3 rounded-md hover:bg-red-600 transition duration-300">Delete</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-600">No menu items found. Try adjusting your search or category filter.</div>
      )}

      <div className="mt-8 flex justify-center">
        {filteredMenuItems.length > itemsPerPage && (
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            {Array.from({ length: Math.ceil(filteredMenuItems.length / itemsPerPage) }).map((_, index) => (
              <button
                key={index}
                onClick={() => paginate(index + 1)}
                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                  currentPage === index + 1
                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </nav>
        )}
      </div>
    </div>
  );
};

export default ManageMenu;