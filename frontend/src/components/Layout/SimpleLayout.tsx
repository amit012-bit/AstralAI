/**
 * Simple Layout Component
 * Layout without sidebar for home page and auth pages
 */

import React from 'react';
import Header from './Header';
import Footer from './Footer';
import FloatingChatButton from '../Chat/FloatingChatButton';

interface SimpleLayoutProps {
  children: React.ReactNode;
}

const SimpleLayout: React.FC<SimpleLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <FloatingChatButton />
    </div>
  );
};

export default SimpleLayout;
