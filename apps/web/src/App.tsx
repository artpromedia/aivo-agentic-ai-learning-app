import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Landing } from './pages/Landing';
import About from './pages/About';
import Features from './pages/Features';
import Contact from './pages/Contact';
import { OnboardingDemo } from './pages/OnboardingDemo';
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
        <Route path="/contact" element={<Contact />} />
        <Route path="/onboarding-demo" element={<OnboardingDemo />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
