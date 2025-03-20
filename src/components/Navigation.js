// components/Navigation.js
'use client';
import { useState,  useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useNavigation } from './NavigationContext';
import { navItems } from './navItems';
import { PageIndicator } from './PageIndicator';


// Ensure NavigationContext.js exists and exports useNavigation
// Ensure navItems.js exists and exports navItems
// Ensure PageIndicator.js exists and exports PageIndicator

export const Navigation = ({ children }) => {
  const pathname = usePathname();
  const { setActivePath } = useNavigation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
 

  useEffect(() => {
    setActivePath(pathname);
  }, [pathname, setActivePath]);

  const handleMenuToggle = () => {
    setIsMenuOpen((prev) => !prev);
  };

  return (
    <div className="font-sans bg-black text-white min-h-screen overflow-hidden relative">
      <header className="fixed top-0 left-0 w-full bg-black/20 backdrop-blur-md z-40 px-8 py-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <a href="#" className="text-2xl font-light tracking-wider">
            IGNI<span className="font-medium">TION</span>
            <span className="relative -ml-1 inline-block w-2 h-2 rounded-full" />
          </a>
          <button 
            className="relative w-12 h-12 flex items-center justify-center" 
            onClick={handleMenuToggle}
          >
            <div className="absolute inset-0 rounded-full border border-white/20 opacity-80" />
            <div className={`relative w-6 flex flex-col items-center justify-center gap-1.5 transition-all duration-500 ${isMenuOpen ? 'rotate-45' : ''}`}>
              <span className={`block w-full h-px bg-white transform transition-all duration-300 ${isMenuOpen ? 'rotate-90 translate-y-1' : ''}`} />
              <span className={`block h-px bg-white transform transition-all duration-300 ${isMenuOpen ? 'w-full' : 'w-3/4 self-end'}`} />
            </div>
          </button>
        </div>
      </header>

      {isMenuOpen && (
        <div className="fixed inset-0 z-30 flex items-center justify-center transition-all duration-700">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md">
            <div className="absolute inset-0 opacity-10 bg-center bg-no-repeat bg-contain" style={{ backgroundImage: 'url(/api/placeholder/1200/800)' }} />
          </div>

          <div className="absolute top-[10%] right-[15%] w-64 h-64 rounded-full blur-3xl opacity-10 bg-blue-500" />
          <div className="absolute bottom-[20%] left-[10%] w-80 h-80 rounded-full blur-3xl opacity-10 bg-purple-500" />

          <div className="relative z-10 max-w-6xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 px-8">
            {navItems?.map((item) => (
              <div key={item.id} className="menu-item opacity-0 transform translate-y-8">
                <Link
                  href={item.path}
                  className="group w-full text-left p-6 border border-white/10 rounded-lg backdrop-blur-sm hover:bg-white/5 transition-all duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <PageIndicator />
                  <div className={`absolute top-4 right-4 w-2 h-2 rounded-full bg-orange-500 ${pathname === item.path ? 'opacity-100' : 'opacity-0'}`} />
                  {item.label}
                </Link>
              </div>
            ))}
          </div>
        </div>
       

      )}

      {children}
    </div>
  );
};
