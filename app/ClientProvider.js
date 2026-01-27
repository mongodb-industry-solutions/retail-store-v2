"use client";

import { Provider } from "react-redux";
import { useEffect } from "react";
import store from "../redux/store";

export default function ClientProvider({ children }) {
  useEffect(() => {
    // Clear sessionStorage on page refresh (not on navigation)
    const clearSessionOnRefresh = () => {
      // Check if this is a page refresh vs normal navigation
      const navigation = performance.getEntriesByType('navigation')[0];
      
      if (navigation && navigation.type === 'reload') {
        sessionStorage.clear();
      }
    };

    clearSessionOnRefresh();
  }, []);

  return <Provider store={store}>{children}</Provider>
}