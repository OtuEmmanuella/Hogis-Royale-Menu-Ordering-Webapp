import React, { useState, useEffect } from 'react';
import { db } from '../Firebase/FirebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { MapPin } from 'lucide-react';
import './BranchSelector.css';

const BranchSelector = ({ selectedBranch, onBranchSelect }) => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const branchesCollection = collection(db, 'branches');
        const branchesSnapshot = await getDocs(branchesCollection);
        const branchesData = branchesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setBranches(branchesData);
      } catch (error) {
        console.error('Error fetching branches:', error);
        setBranches([
          { id: '1', name: 'Hogis Royale And Apartment', address: 'Main Branch, Calabar' },
          { id: '2', name: 'Hogis Luxury Suites', address: 'Secondary Branch, Calabar' },
          { id: '3', name: 'Hogis Exclusive Resorts', address: 'Premium Branch, Calabar' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  }, []);

  if (loading) {
    return (
      <div className="branch-selector-loading">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="branch-selector">
      <div className="branch-selector-header">
        <MapPin className="branch-icon" />
        <h3>Select Branch</h3>
      </div>
      <div className="branch-list">
        {branches.map((branch) => (
          <button
            key={branch.id}
            className={`branch-option ${selectedBranch?.id === branch.id ? 'selected' : ''}`}
            onClick={() => onBranchSelect(branch)}
          >
            <div className="branch-info">
              <span className="branch-name">{branch.name}</span>
              <span className="branch-address">{branch.address}</span>
            </div>
            {selectedBranch?.id === branch.id && (
              <div className="branch-selected-indicator"></div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default BranchSelector;