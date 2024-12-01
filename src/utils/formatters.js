export const formatPrice = (price) => {
    return `₦${price.toLocaleString('en-NG', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })}`;
  };
  
  export const calculateMembershipDuration = (createdAt) => {
    if (!createdAt) return 'N/A';
    const now = new Date();
    const creationDate = new Date(createdAt.toDate());
    const diffTime = Math.abs(now - creationDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffYears = Math.floor(diffDays / 365);
    const diffMonths = Math.floor((diffDays % 365) / 30);
    const diffRemainingDays = diffDays % 30;
  
    let duration = '';
    if (diffYears > 0) duration += `${diffYears} year${diffYears > 1 ? 's' : ''} `;
    if (diffMonths > 0) duration += `${diffMonths} month${diffMonths > 1 ? 's' : ''} `;
    if (diffRemainingDays > 0) duration += `${diffRemainingDays} day${diffRemainingDays > 1 ? 's' : ''}`;
  
    return duration.trim();
  };