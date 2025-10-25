/**
 * Next.js Document Component
 * Custom document structure with font optimization and meta tags
 */

import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en" className="scroll-smooth">
      <Head>
        {/* Font Optimization */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        
        {/* Favicon */}
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' fill='%232563eb'/><text x='16' y='22' font-family='Arial' font-size='16' fill='white' text-anchor='middle'>AI</text></svg>" />
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* Theme Color */}
        <meta name="theme-color" content="#2563eb" />
        
        {/* SEO Meta Tags */}
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
        
        {/* Open Graph Meta Tags */}
        <meta property="og:site_name" content="AstralAI" />
        <meta property="og:locale" content="en_US" />
        
        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@aisolutionshub" />
        
        {/* Additional Meta Tags */}
        <meta name="author" content="AstralAI Team" />
        <meta name="keywords" content="AI solutions, artificial intelligence, business automation, machine learning, AI marketplace" />
        
        {/* Security Headers */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        
        {/* Performance Optimizations */}
        <meta httpEquiv="Accept-CH" content="DPR, Viewport-Width, Width" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "AstralAI",
              "description": "The leading marketplace for AI solutions",
              "url": "https://aisolutionshub.com",
              "logo": "https://aisolutionshub.com/logo.png",
              "sameAs": [
                "https://twitter.com/aisolutionshub",
                "https://linkedin.com/company/aisolutionshub",
                "https://github.com/aisolutionshub"
              ],
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+1-555-123-4567",
                "contactType": "customer service",
                "email": "hello@aisolutionshub.com"
              }
            })
          }}
        />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
        
        {/* Performance Monitoring Script */}
        {process.env.NODE_ENV === 'production' && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                // Add your analytics script here
                console.log('AstralAI - Production Mode');
              `
            }}
          />
        )}
      </body>
    </Html>
  );
}
