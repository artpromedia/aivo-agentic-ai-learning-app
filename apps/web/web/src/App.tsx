import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Landing } from './pages/Landing';
import About from './pages/About';
import Features from './pages/Features';
import Contact from './pages/Contact';
import Pricing from './pages/Pricing';
import Careers from './pages/Careers';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Security from './pages/Security';
import Integrations from './pages/Integrations';
import { OnboardingDemo } from './pages/OnboardingDemo';
import { SelectRole } from './pages/SelectRole';
import { SelectSignInRole } from './pages/SelectSignInRole';
import { Children } from './pages/Children';
import { Parents } from './pages/Parents';
import { Educators } from './pages/Educators';
import { Schools } from './pages/Schools';
import { Documentation } from './pages/Documentation';
import { APIReference } from './pages/APIReference';
import { CaseStudies } from './pages/CaseStudies';
import Devices from './pages/Devices';
import { CommandPalette, useCommandPalette } from './components/CommandPalette';

function App() {
  const { isOpen, setIsOpen } = useCommandPalette();

  return (
    <BrowserRouter>
      <CommandPalette isOpen={isOpen} onClose={() => setIsOpen(false)} />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/about" element={<About />} />
        <Route path="/features" element={<Features />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/devices" element={<Devices />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/security" element={<Security />} />
        <Route path="/integrations" element={<Integrations />} />
        <Route path="/onboarding-demo" element={<OnboardingDemo />} />
        <Route path="/signup/select-role" element={<SelectRole />} />
        <Route path="/signin/select-role" element={<SelectSignInRole />} />
        
        {/* Solution Pages */}
        <Route path="/children" element={<Children />} />
        <Route path="/parents" element={<Parents />} />
        <Route path="/educators" element={<Educators />} />
        <Route path="/schools" element={<Schools />} />
        
        {/* Resource Pages */}
        <Route path="/documentation" element={<Documentation />} />
        <Route path="/api-reference" element={<APIReference />} />
        <Route path="/case-studies" element={<CaseStudies />} />
        
        {/* 
          Auth & Onboarding Routes removed - redirected to portals:
          - Signup now handled by parent portal at http://localhost:3001/signup/parent
          - Teacher signup at http://localhost:3002/signup
        */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
