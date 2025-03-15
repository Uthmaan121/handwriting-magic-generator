
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { AppIcon } from '@/components/icons/AppIcon';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen paper-texture">
      <header className="border-b border-amber-200/30 bg-white/60 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl md:text-2xl font-bold text-ink-blue flex items-center">
            <AppIcon className="h-6 w-6 mr-2 text-ink-blue" />
            Handwriting Magic
          </h1>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6 md:py-10">
        {children}
      </main>
      <footer className="mt-auto py-6 text-center text-sm text-ink-light">
        <div className="container mx-auto px-4">
          <p>Handwriting Magic © {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
};
