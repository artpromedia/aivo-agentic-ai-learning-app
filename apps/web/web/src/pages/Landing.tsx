import React from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Hero } from '../components/landing/Hero';
import { SocialProof } from '../components/landing/SocialProof';
import { Features } from '../components/landing/Features';
import { AivoPadSection } from '../components/landing/AivoPadSection';
import { Personas } from '../components/landing/Personas';
import { HowItWorks } from '../components/landing/HowItWorks';
import { AIModelProcess } from '../components/landing/AIModelProcess';
import { AICapabilities } from '../components/landing/AICapabilities';
import { ComparisonTable } from '../components/landing/ComparisonTable';
import { Pricing } from '../components/landing/Pricing';
import { Privacy } from '../components/landing/Privacy';
import { Integrations } from '../components/landing/Integrations';
import { FinalCTA } from '../components/landing/FinalCTA';

/**
 * Main Landing Page for AIVO - Personal AI Learning Platform
 * 
 * This page showcases the personal AI model approach for neurodiverse learners.
 * 
 * Sections (in order):
 * 1. Header - Sticky navigation with dropdowns
 * 2. Hero - Main value proposition with trust indicators
 * 3. Social Proof - Stats (removed district logos)
 * 4. Features - 6 key platform features
 * 5. Aivo Pad Section - Hardware showcase
 * 6. Personas - Tabbed interface for different user types
 * 7. How It Works - 3-step onboarding process
 * 7. AI Model Process - From IEP to Personal AI Model in Minutes
 * 8. AI Capabilities - What Your Child's AI Model Can Do
 * 9. Comparison Table - Traditional Learning vs. Personal AI Model
 * 10. Pricing - Simple, Transparent Pricing
 * 11. Privacy - Your Child's AI Model is Private, Secure, and Yours
 * 12. Integrations - Partner platform logos
 * 13. Final CTA - Trial signup push
 * 14. Footer - Comprehensive site navigation
 */
export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main>
        <Hero />
        <SocialProof />
        <Features />
        <AivoPadSection />
        <Personas />
        <HowItWorks />
        <AIModelProcess />
        <AICapabilities />
        <ComparisonTable />
        <Pricing />
        <Privacy />
        <Integrations />
        <FinalCTA />
      </main>
      
      <Footer />
    </div>
  );
};
