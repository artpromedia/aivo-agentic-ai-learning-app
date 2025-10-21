export function Footer() {
  return (
    <footer className="bg-neutral-900 text-neutral-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Footer Top */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Logo & Branding */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center mb-4">
              {/* Same wordmark logo as header */}
              <img 
                src="/logo.svg" 
                alt="AIVO" 
                className="h-8"
              />
            </div>
            <p className="text-sm mb-4">Intelligent IEP Management</p>
            <div className="flex gap-4">
              <a href="#" className="text-neutral-400 hover:text-white transition" aria-label="LinkedIn">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
              <a href="#" className="text-neutral-400 hover:text-white transition" aria-label="Twitter">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg>
              </a>
              <a href="#" className="text-neutral-400 hover:text-white transition" aria-label="Facebook">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-2">
              <li><a href="#features" className="text-sm hover:text-white transition">Features</a></li>
              <li><a href="#pricing" className="text-sm hover:text-white transition">Pricing</a></li>
              <li><a href="#integrations" className="text-sm hover:text-white transition">Integrations</a></li>
              <li><a href="#security" className="text-sm hover:text-white transition">Security</a></li>
            </ul>
          </div>

          {/* Solutions */}
          <div>
            <h4 className="font-semibold text-white mb-4">Solutions</h4>
            <ul className="space-y-2">
              <li><a href="#schools" className="text-sm hover:text-white transition">For Schools</a></li>
              <li><a href="#teachers" className="text-sm hover:text-white transition">For Teachers</a></li>
              <li><a href="#parents" className="text-sm hover:text-white transition">For Parents</a></li>
              <li><a href="#students" className="text-sm hover:text-white transition">For Students</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-white mb-4">Resources</h4>
            <ul className="space-y-2">
              <li><a href="#docs" className="text-sm hover:text-white transition">Documentation</a></li>
              <li><a href="#api" className="text-sm hover:text-white transition">API Reference</a></li>
              <li><a href="#case-studies" className="text-sm hover:text-white transition">Case Studies</a></li>
              <li><a href="#blog" className="text-sm hover:text-white transition">Blog</a></li>
              <li><a href="#support" className="text-sm hover:text-white transition">Support</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2">
              <li><a href="#about" className="text-sm hover:text-white transition">About Us</a></li>
              <li><a href="#careers" className="text-sm hover:text-white transition">Careers</a></li>
              <li><a href="#contact" className="text-sm hover:text-white transition">Contact</a></li>
              <li><a href="#privacy" className="text-sm hover:text-white transition">Privacy Policy</a></li>
              <li><a href="#terms" className="text-sm hover:text-white transition">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-neutral-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          <p>&copy; 2025 AIVO. All rights reserved.</p>
          <div className="flex gap-4 text-xs">
            <span className="text-success-400">✓ FERPA Compliant</span>
            <span className="text-success-400">✓ SOC 2 Type II Certified</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
