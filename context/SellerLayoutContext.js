import React, { createContext, useContext } from 'react';

const SellerLayoutContext = createContext(null);

export function SellerLayoutProvider({ children, value }) {
  return <SellerLayoutContext.Provider value={value}>{children}</SellerLayoutContext.Provider>;
}

export function useSellerLayout() {
  const ctx = useContext(SellerLayoutContext);
  if (!ctx) {
    throw new Error('useSellerLayout must be used within SellerLayoutProvider');
  }
  return ctx;
}
