// components/NavigationContext.js
'use client';
import { createContext, useContext, useState } from 'react';


const NavigationContext = createContext();

export const NavigationProvider = ({ children }) => {
  const [activePath, setActivePath] = useState('/');
  
  return (
    <NavigationContext.Provider value={{ activePath, setActivePath }}>
      {children}
    </NavigationContext.Provider> 
    

  );
};

export const useNavigation = () => useContext(NavigationContext);