import { useState } from 'react';
import { Button } from '@aivo/ui';
import { Bars3Icon, XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const solutions = [
    { name: 'For Neurodiverse Children', href: '/children' },
    { name: 'For Parents', href: '/parents' },
    { name: 'For Educators', href: '/educators' },
    { name: 'For Schools', href: '/schools' },
  ];

  const resources = [
    { name: 'Documentation', href: '/documentation' },
    { name: 'API Reference', href: '/api-reference' },
    { name: 'Case Studies', href: '/case-studies' },
    { name: 'Blog', href: '#blog' },
    { name: 'Support', href: '#support' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-neutral-200 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="flex items-center hover:opacity-80 transition-opacity">
              {/* Full wordmark logo */}
              <img 
                src="/logo.svg" 
                alt="AIVO" 
                className="h-8"
              />
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {/* Solutions Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setActiveDropdown('solutions')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className="flex items-center gap-1 text-sm font-medium text-neutral-700 hover:text-primary-600 transition">
                Solutions
                <ChevronDownIcon className="w-4 h-4" />
              </button>
              {activeDropdown === 'solutions' && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-neutral-200 py-2">
                  {solutions.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-primary-600 transition"
                    >
                      {item.name}
                    </a>
                  ))}
                </div>
              )}
            </div>

            <a href="/features" className="text-sm font-medium text-neutral-700 hover:text-primary-600 transition">
              Features
            </a>
            <a href="/devices" className="text-sm font-medium text-neutral-700 hover:text-primary-600 transition">
              Devices
            </a>
            <a href="/pricing" className="text-sm font-medium text-neutral-700 hover:text-primary-600 transition">
              Pricing
            </a>

            {/* Resources Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setActiveDropdown('resources')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className="flex items-center gap-1 text-sm font-medium text-neutral-700 hover:text-primary-600 transition">
                Resources
                <ChevronDownIcon className="w-4 h-4" />
              </button>
              {activeDropdown === 'resources' && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 py-2">
                  {resources.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-primary-600 transition"
                    >
                      {item.name}
                    </a>
                  ))}
                </div>
              )}
            </div>

            <a href="/about" className="text-sm font-medium text-neutral-700 hover:text-primary-600 transition">
              About
            </a>
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <a href="/signin/select-role" className="text-sm font-medium text-neutral-700 hover:text-primary-600 transition">
              Sign In
            </a>
            <a href="/signup/select-role">
              <Button variant="primary" size="sm">
                Get Started
              </Button>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg text-neutral-700 hover:bg-neutral-100 transition"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <Bars3Icon className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-neutral-200 py-4">
            <div className="flex flex-col gap-4">
              <div>
                <button 
                  className="w-full flex items-center justify-between text-sm font-medium text-neutral-900 py-2"
                  onClick={() => setActiveDropdown(activeDropdown === 'solutions-mobile' ? null : 'solutions-mobile')}
                >
                  Solutions
                  <ChevronDownIcon className={`w-4 h-4 transition-transform ${activeDropdown === 'solutions-mobile' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'solutions-mobile' && (
                  <div className="pl-4 flex flex-col gap-2 mt-2">
                    {solutions.map((item) => (
                      <a key={item.name} href={item.href} className="text-sm text-neutral-600 hover:text-primary-600 py-1">
                        {item.name}
                      </a>
                    ))}
                  </div>
                )}
              </div>
              
              <a href="/features" className="text-sm font-medium text-neutral-700 py-2">Features</a>
              <a href="/devices" className="text-sm font-medium text-neutral-700 py-2">Devices</a>
              <a href="/pricing" className="text-sm font-medium text-neutral-700 py-2">Pricing</a>
              
              <div>
                <button 
                  className="w-full flex items-center justify-between text-sm font-medium text-neutral-900 py-2"
                  onClick={() => setActiveDropdown(activeDropdown === 'resources-mobile' ? null : 'resources-mobile')}
                >
                  Resources
                  <ChevronDownIcon className={`w-4 h-4 transition-transform ${activeDropdown === 'resources-mobile' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'resources-mobile' && (
                  <div className="pl-4 flex flex-col gap-2 mt-2">
                    {resources.map((item) => (
                      <a key={item.name} href={item.href} className="text-sm text-neutral-600 hover:text-primary-600 py-1">
                        {item.name}
                      </a>
                    ))}
                  </div>
                )}
              </div>
              
              <a href="/about" className="text-sm font-medium text-neutral-700 py-2">About</a>
              
              <div className="pt-4 border-t border-neutral-200 flex flex-col gap-3">
                <a href="/signin/select-role" className="text-sm font-medium text-center py-2 text-neutral-700">Sign In</a>
                <a href="/signup/select-role" className="w-full">
                  <Button variant="primary" size="md" className="w-full">Get Started</Button>
                </a>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
