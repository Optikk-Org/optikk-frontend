import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Custom hook to sync tab state with URL query parameters
 * Follows DRY principle - eliminates duplicate tab sync logic across pages
 * 
 * @param {string} defaultTab - The default tab key
 * @param {string} paramName - The query parameter name (default: 'tab')
 * @returns {Object} { activeTab, setActiveTab, onTabChange }
 * 
 * @example
 * const { activeTab, onTabChange } = useTabSync('overview', 'tab');
 * <Tabs activeKey={activeTab} onChange={onTabChange} items={items} />
 */
export function useTabSync(defaultTab, paramName = 'tab') {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get(paramName) || defaultTab);

  useEffect(() => {
    const queryTab = searchParams.get(paramName) || defaultTab;
    if (queryTab !== activeTab) {
      setActiveTab(queryTab);
    }
  }, [searchParams, activeTab, defaultTab, paramName]);

  const onTabChange = (key) => {
    setActiveTab(key);
    const next = new URLSearchParams(searchParams);
    if (key === defaultTab) {
      next.delete(paramName);
    } else {
      next.set(paramName, key);
    }
    setSearchParams(next, { replace: true });
  };

  return { activeTab, setActiveTab, onTabChange };
}

