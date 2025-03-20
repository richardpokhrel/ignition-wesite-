// components/Layout.js
"use client";
import { useState } from 'react';
import { NavigationProvider } from './NavigationContext';
import { CustomCursor } from './customCursor';
import { Navigation } from './Navigation';
import { PageIndicator } from './PageIndicator';

export const Layout = ({ children }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <NavigationProvider>
      <div className="font-sans bg-black text-white min-h-screen overflow-hidden relative">
        <CustomCursor isHovered={isHovered} />
        <Navigation setHoverState={setIsHovered} />
        <main className="pt-20">{children}</main>
        <PageIndicator />
      </div>
    </NavigationProvider>
  );
};
