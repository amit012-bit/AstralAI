/**
 * Home Page Component - Solutions Hub Grid Design
 * Grid-based layout matching solutions-hub-main design
 */

import React from 'react';
import Head from 'next/head';
import { SolutionsGrid } from '@/components/SolutionsHub/SolutionsGrid';

const HomePage: React.FC = () => {
  return (
    <>
      <Head>
        <title>AstroVault AI - Healthcare AI Solutions Hub</title>
        <meta name="description" content="Connect healthcare institutions with cutting-edge AI solutions" />
      </Head>
      <SolutionsGrid />
    </>
  );
};

export default HomePage;
