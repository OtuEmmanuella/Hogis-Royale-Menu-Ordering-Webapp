import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

// Default export: Full Breadcrumb component
const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4 text-black">
      <Link to="/account" className="hover:text-gray-900">
        Account
      </Link>
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;

        return (
          <React.Fragment key={name}>
            <ChevronRight className="w-4 h-4" />
            {isLast ? (
              <span className="text-gray-900 font-medium text-black">
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </span>
            ) : (
              <Link to={routeTo} className="hover:text-gray-900">
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

// Named export: Helper function to generate breadcrumb segments
export const generateBreadcrumbSegments = (pathname) => {
  const pathnames = pathname.split('/').filter((x) => x);
  return pathnames.map((name, index) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    route: `/${pathnames.slice(0, index + 1).join('/')}`,
    isLast: index === pathnames.length - 1,
  }));
};

export default Breadcrumb;
