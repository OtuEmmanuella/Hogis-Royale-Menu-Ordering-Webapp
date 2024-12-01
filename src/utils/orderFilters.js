export const filterOrders = (orders, filters) => {
    return orders.filter(order => {
      // Branch filter
      if (filters.branch !== 'all' && order.branchId !== filters.branch) {
        return false;
      }
  
      // Search term filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const nameMatch = order.customerName?.toLowerCase().includes(searchLower);
        const emailMatch = order.email?.toLowerCase().includes(searchLower);
        const phoneMatch = order.phone?.toLowerCase().includes(searchLower);
        
        if (!nameMatch && !emailMatch && !phoneMatch) {
          return false;
        }
      }
  
      // Date range filter
      if (filters.dateRange.start || filters.dateRange.end) {
        const orderDate = new Date(order.createdAt);
        
        if (filters.dateRange.start) {
          const startDate = new Date(filters.dateRange.start);
          startDate.setHours(0, 0, 0, 0);
          if (orderDate < startDate) {
            return false;
          }
        }
  
        if (filters.dateRange.end) {
          const endDate = new Date(filters.dateRange.end);
          endDate.setHours(23, 59, 59, 999);
          if (orderDate > endDate) {
            return false;
          }
        }
      }
  
      return true;
    });
  };