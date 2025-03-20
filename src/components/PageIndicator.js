// components/PageIndicator.js
'use client';
import Link from 'next/link';
import { useNavigation } from './NavigationContext';
import { navItems } from './navItems';

export const PageIndicator = () => {
  const { activePath } = useNavigation();

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4 z-40">
      {navItems.map((item) => (
        <Link key={item.id} href={item.path} className="relative">
          <div className="w-16 h-px bg-white/30">
            <div
              className={`absolute h-px bg-white transition-all duration-500 ${
                activePath === item.path ? "w-full" : "w-0"
              }`}
            />
          </div>
        </Link>
      ))}
    </div>
  );
};