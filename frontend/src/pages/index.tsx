/**
 * Home Page Component - Solutions Hub Grid Design
 * Grid-based layout matching solutions-hub-main design with starry animated background
 */

import React from 'react';
import Head from 'next/head';
import { SolutionsGrid } from '@/components/SolutionsHub/SolutionsGrid';
import ParticleRing from '@/components/Background/ParticleRing';

const HomePage: React.FC = () => {
  return (
    <>
      <Head>
        <title>AstroVault AI - Healthcare AI Solutions Hub</title>
        <meta name="description" content="Connect healthcare institutions with cutting-edge AI solutions" />
      </Head>
      <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 min-h-screen">
        {/* ParticleRing Background Animation */}
        <div className="fixed inset-0 z-0">
          <ParticleRing />
        </div>
        
        {/* Background Pattern */}
        <div className="fixed inset-0 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-indigo-600/10 z-0"></div>
        <div className="fixed inset-0 opacity-20 z-0">
          <div className="w-full h-full bg-gradient-to-r from-purple-600/5 to-blue-600/5"></div>
        </div>
        
        {/* Solutions Grid - Content above background */}
        <div className="relative z-10">
          <SolutionsGrid />
        </div>
      </div>
    </>
  );
};

export default HomePage;
