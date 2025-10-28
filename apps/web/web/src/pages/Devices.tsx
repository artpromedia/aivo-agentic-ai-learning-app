import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import {
  CheckCircleIcon,
  DeviceTabletIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';

export default function Devices() {
  const keyFeatures = [
    {
      icon: '🖊️',
      title: 'Stylus-First Design',
      items: [
        'Natural handwriting experience that feels like pen and paper',
        'Advanced palm rejection technology',
        'Pressure-sensitive stylus (4,096 levels) for precise input',
        'Battery-free stylus with replaceable tips',
      ],
    },
    {
      icon: '🔒',
      title: 'Security & Privacy',
      items: [
        'Hardware-backed encryption with secure boot',
        'COPPA and FERPA compliant by design',
        'Military-grade security standards',
        'Tamper-resistant hardware',
        '5 years of security updates guaranteed',
      ],
    },
    {
      icon: '📴',
      title: 'Offline Capability',
      items: [
        'Full curriculum available without internet',
        'Automatic sync when connectivity restored',
        'Dedicated NPU for on-device learning algorithms',
        'Local content library',
      ],
    },
    {
      icon: '♿',
      title: 'Accessibility Features',
      items: [
        'WCAG 2.1 AA compliant interface',
        'Adjustable stylus sensitivity',
        'Screen reader support',
        'High contrast and color inversion modes',
        'Text-to-speech and speech-to-text built-in',
        'Switch control compatibility',
        'Ambient light sensor for automatic brightness',
      ],
    },
    {
      icon: '🔋',
      title: 'All-Day Battery',
      items: [
        '10+ hours of active learning',
        'Fast charging (0-80% in 90 minutes)',
        '18W USB-C fast charging',
        'Intelligent power optimization',
      ],
    },
    {
      icon: '🛡️',
      title: 'Built for Schools',
      items: [
        'MIL-STD-810G drop tested (4-foot drops)',
        'IP54 water resistance rating',
        'Reinforced polycarbonate with rubberized corners',
        'Lightweight at 650g (1.43 lbs)',
      ],
    },
  ];

  const technicalSpecs = {
    display: [
      { label: 'Screen Size', value: '11-inch IPS LCD' },
      { label: 'Resolution', value: '2000 x 1200 pixels (WUXGA)' },
      { label: 'Pixel Density', value: '218 PPI' },
      { label: 'Touch Technology', value: 'Capacitive multi-touch with palm rejection' },
      { label: 'Stylus Support', value: 'Advanced pressure-sensitive stylus (4,096 levels)' },
      { label: 'Brightness', value: '450 nits with anti-glare coating' },
    ],
    performance: [
      { label: 'Processor', value: 'Octa-core ARM Cortex-A78 (2.4GHz)' },
      { label: 'RAM', value: '8GB LPDDR5' },
      { label: 'Storage', value: '128GB eUFS 3.1 (expandable to 512GB via microSD)' },
      { label: 'Graphics', value: 'Mali-G610 MC6' },
      { label: 'AI Processing', value: 'Dedicated NPU for on-device learning algorithms' },
    ],
    connectivity: [
      { label: 'Wi-Fi', value: 'Wi-Fi 6E (802.11ax)' },
      { label: 'Bluetooth', value: 'Bluetooth 5.3' },
      { label: 'Cellular', value: 'Optional 5G/LTE connectivity' },
      { label: 'Ports', value: 'USB-C 3.2, 3.5mm headphone jack' },
      { label: 'Sensors', value: 'Accelerometer, gyroscope, ambient light sensor' },
    ],
    education: [
      { label: 'IEP Integration', value: 'Native support for Individualized Education Programs' },
      { label: 'Offline Learning', value: 'Full curriculum available without internet' },
      { label: 'Adaptive AI', value: 'Real-time learning style adaptation' },
      { label: 'Progress Tracking', value: 'Comprehensive analytics dashboard' },
      { label: 'Accessibility', value: 'WCAG 2.1 AA compliant interface' },
    ],
    durability: [
      { label: 'Build Material', value: 'Reinforced polycarbonate with rubberized corners' },
      { label: 'Drop Protection', value: 'Tested to 4-foot drops (MIL-STD-810G)' },
      { label: 'Water Resistance', value: 'IP54 rating' },
      { label: 'Weight', value: '650g (1.43 lbs)' },
      { label: 'Dimensions', value: '259 x 166 x 9.8 mm (10.2" x 6.5" x 0.39")' },
    ],
    battery: [
      { label: 'Battery Capacity', value: '7,500 mAh' },
      { label: 'Battery Life', value: '10+ hours of active learning' },
      { label: 'Charging', value: 'USB-C fast charging (18W)' },
      { label: 'Charge Time', value: '0-80% in 90 minutes' },
      { label: 'Power Management', value: 'Intelligent power optimization' },
    ],
    software: [
      { label: 'Operating System', value: 'AivoOS (Android-based)' },
      { label: 'Security', value: 'Hardware-backed encryption, secure boot' },
      { label: 'Privacy', value: 'COPPA & FERPA compliant by design' },
      { label: 'Updates', value: '5 years of security updates guaranteed' },
      { label: 'App Management', value: 'Curated educational app ecosystem' },
    ],
  };

  const certifications = [
    { name: 'COPPA Compliant', description: "Children's Online Privacy Protection Act" },
    { name: 'FERPA Compliant', description: 'Family Educational Rights and Privacy Act' },
    { name: 'WCAG 2.1 AA', description: 'Web Content Accessibility Guidelines' },
    { name: 'FCC Certified', description: 'Federal Communications Commission' },
    { name: 'MIL-STD-810G', description: 'Military-grade durability testing' },
    { name: 'IP54 Rated', description: 'Dust and water splash protection' },
    { name: 'SOC 2 Type II', description: 'Security compliance' },
  ];

  const packageContents = [
    'Aivo Pad device (128GB)',
    'Advanced pressure-sensitive stylus (4,096 levels)',
    '3 replacement stylus tips',
    'USB-C charging cable and 18W adapter',
    'Protective case with rubberized corners',
    'Quick start guide',
    '2-year warranty with educational institution support',
  ];

  const addOns = [
    { name: 'Aivo Pad with 5G/LTE', description: 'Stay connected everywhere' },
    { name: 'Expandable Storage', description: 'MicroSD cards up to 512GB' },
    { name: 'Screen Protector', description: 'Extra protection for daily use' },
    { name: 'Replacement Stylus', price: '$29' },
    { name: 'Carrying Sleeve', price: '$24' },
  ];

  const compatibleDevices = {
    fullSupport: [
      {
        category: 'Apple iPad',
        devices: [
          'iPad Pro (all models, 2018+)',
          'iPad Air (3rd generation and later)',
          'iPad (8th generation and later)',
          'iPad mini (5th generation and later)',
        ],
        requirements: 'iPadOS 15 or later',
        stylus: 'Apple Pencil (1st or 2nd gen), Logitech Crayon',
      },
      {
        category: 'Android Tablets',
        devices: [
          'Samsung Galaxy Tab S6, S7, S8, S9 series',
          'Samsung Galaxy Tab A8, A9 series',
          'Lenovo Tab P11, P12 series',
          'Google Pixel Tablet',
          'Any tablet running Android 10 or later with stylus support',
        ],
        requirements: 'Android 10 or later',
        stylus: 'Samsung S Pen, USI stylus, Wacom-compatible stylus',
      },
      {
        category: 'Chromebooks (Touchscreen)',
        devices: [
          'HP Chromebook x360 series',
          'Lenovo Chromebook Duet series',
          'Acer Chromebook Spin series',
          'ASUS Chromebook Flip series',
          'Google Pixelbook',
          'Any Chromebook with touchscreen and ChromeOS 100+',
        ],
        requirements: 'ChromeOS 100+',
        stylus: 'USI stylus, Wacom-compatible stylus',
      },
      {
        category: 'Windows Devices (Touchscreen)',
        devices: [
          'Microsoft Surface Pro (6th gen and later)',
          'Microsoft Surface Go series',
          'Microsoft Surface Laptop Studio',
          'HP Spectre x360',
          'Dell XPS 2-in-1 series',
          'Lenovo Yoga series',
          'Any Windows 10/11 device with touchscreen',
        ],
        requirements: 'Windows 10/11',
        stylus: 'Microsoft Surface Pen, active stylus',
      },
    ],
  };

  const browsers = [
    'Google Chrome (version 100+)',
    'Microsoft Edge (version 100+)',
    'Mozilla Firefox (version 100+)',
    'Apple Safari (version 15+)',
  ];

  const operatingSystems = [
    'Windows 10 (64-bit) or later',
    'macOS 11 (Big Sur) or later',
    'ChromeOS 100 or later',
    'Linux (Ubuntu 20.04+ or equivalent)',
  ];

  const featureComparison = [
    { feature: 'Stylus Input', aivoPad: '✅ 4,096 levels', iPad: '✅ Apple Pencil', android: '✅ S Pen/USI', chromebook: '✅ USI', windows: '✅ Surface Pen', desktop: '⚠️ Mouse only' },
    { feature: 'Offline Mode', aivoPad: '✅ Full', iPad: '✅ Full', android: '✅ Full', chromebook: '✅ Full', windows: '✅ Full', desktop: '❌ Online only' },
    { feature: 'Handwriting Recognition', aivoPad: '✅ Advanced', iPad: '✅ Yes', android: '✅ Yes', chromebook: '✅ Yes', windows: '✅ Yes', desktop: '❌ No' },
    { feature: 'IEP Integration', aivoPad: '✅ Native', iPad: '✅ Yes', android: '✅ Yes', chromebook: '✅ Yes', windows: '✅ Yes', desktop: '✅ Yes' },
    { feature: 'Drop Protection', aivoPad: '✅ 4-foot', iPad: '❌ No', android: '❌ No', chromebook: '⚠️ Some models', windows: '❌ No', desktop: 'N/A' },
    { feature: 'Water Resistance', aivoPad: '✅ IP54', iPad: '❌ No', android: '⚠️ Some models', chromebook: '❌ No', windows: '❌ No', desktop: 'N/A' },
    { feature: 'Battery Life', aivoPad: '✅ 10+ hours', iPad: '✅ 10+ hours', android: '⚠️ 8-10 hours', chromebook: '⚠️ 8-10 hours', windows: '⚠️ 6-8 hours', desktop: 'N/A' },
    { feature: 'On-Device AI', aivoPad: '✅ NPU', iPad: '✅ Neural Engine', android: '⚠️ Limited', chromebook: '❌ No', windows: '⚠️ Limited', desktop: '❌ No' },
    { feature: 'COPPA/FERPA', aivoPad: '✅ By design', iPad: '⚠️ Configuration', android: '⚠️ Configuration', chromebook: '⚠️ Configuration', windows: '⚠️ Configuration', desktop: '⚠️ Configuration' },
    { feature: 'Education Focus', aivoPad: '✅ Purpose-built', iPad: '❌ General use', android: '❌ General use', chromebook: '⚠️ Edu-friendly', windows: '❌ General use', desktop: 'N/A' },
    { feature: '5-Year Updates', aivoPad: '✅ Guaranteed', iPad: '⚠️ ~5 years', android: '⚠️ 2-3 years', chromebook: '✅ ~8 years', windows: '⚠️ Varies', desktop: 'N/A' },
  ];

  const whyAivoPad = [
    { icon: '🎯', title: 'Distraction-Free', description: 'No games, social media, or app stores' },
    { icon: '🛡️', title: 'Rugged', description: 'Survives 4-foot drops and classroom wear-and-tear' },
    { icon: '🔒', title: 'Secure by Design', description: 'COPPA/FERPA compliant out of the box' },
    { icon: '📅', title: 'Long-Term Support', description: '5 years of guaranteed updates' },
    { icon: '🎓', title: 'Education-First', description: 'Every feature serves learning' },
    { icon: '💰', title: 'Cost-Effective', description: 'Lower TCO than consumer tablets with MDM' },
    { icon: '🤖', title: 'AI-Powered', description: 'Dedicated NPU for personalized learning' },
  ];

  const faq = [
    {
      question: 'Can students switch between Aivo Pad and other devices?',
      answer: 'Yes! All learning progress syncs across devices automatically. Students can start on an Aivo Pad at school and continue on their iPad at home seamlessly.',
    },
    {
      question: 'Do we need to buy Aivo Pads, or can we use existing devices?',
      answer: "Aivo Learning works on both! While Aivo Pad offers the best experience with purpose-built features, our platform fully supports iPads, Android tablets, Chromebooks, and Windows devices.",
    },
    {
      question: 'What happens if an Aivo Pad is lost or stolen?',
      answer: "Administrators can remotely lock and wipe devices through the admin dashboard. All student data is encrypted locally and backed up in the cloud. Replacement devices can be quickly provisioned with the student's profile.",
    },
    {
      question: 'Can students use personal devices (BYOD)?',
      answer: 'Yes, with appropriate school permissions and MDM enrollment. Students can install Aivo Learning on personal tablets and sign in with their school accounts while maintaining privacy boundaries.',
    },
    {
      question: 'How much cellular data does Aivo Pad use?',
      answer: 'Initial setup and sync requires about 2-4GB. With offline mode enabled, daily usage is minimal (50-100MB for progress sync). Students can download entire courses for true offline learning.',
    },
    {
      question: "What's the warranty on Aivo Pad?",
      answer: 'All Aivo Pads include a 2-year manufacturer warranty covering defects. Schools can purchase extended warranties and accidental damage protection. Device replacement turnaround is typically 2-3 business days.',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 to-accent-600 text-white py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Devices & Compatibility
            </h1>
            <p className="text-xl lg:text-2xl text-primary-100 max-w-3xl mx-auto">
              Learning That Works on Your Hardware
            </p>
          </div>
          <p className="text-lg text-center text-primary-100 max-w-4xl mx-auto">
            Aivo Learning is designed to work seamlessly across multiple devices, giving students the flexibility to learn anywhere, anytime. Whether you're using our purpose-built Aivo Pad or your existing devices, Aivo adapts to your hardware.
          </p>
        </div>
      </section>

      {/* Aivo Pad Hero */}
      <section className="py-20 bg-gradient-to-br from-neutral-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-primary-100 rounded-full mb-6">
              <DeviceTabletIcon className="w-12 h-12 text-primary-600" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              Aivo Pad
            </h2>
            <p className="text-2xl text-primary-600 font-semibold">
              The Ultimate Learning Companion
            </p>
            <p className="text-lg text-neutral-600 mt-4 max-w-3xl mx-auto">
              The Aivo Pad is our flagship device, purpose-built for personalized, adaptive learning. Engineered for education with enterprise-grade security, rugged durability, and cutting-edge learning technology.
            </p>
          </div>

          {/* Device Images */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Main Device Image */}
            <div className="bg-gradient-to-br from-primary-50 to-white rounded-3xl p-8 flex items-center justify-center">
              <img 
                src="/devices/aivopad1.png" 
                alt="Aivo Pad - Front View" 
                className="w-full h-auto rounded-2xl shadow-2xl"
              />
            </div>

            {/* Device with Stylus */}
            <div className="bg-gradient-to-br from-accent-50 to-white rounded-3xl p-8 flex items-center justify-center">
              <img 
                src="/devices/aivopad2.png" 
                alt="Aivo Pad with Stylus" 
                className="w-full h-auto rounded-2xl shadow-2xl"
              />
            </div>
          </div>

          {/* Additional Device Images */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <div className="bg-neutral-50 rounded-2xl p-6">
              <img 
                src="/devices/aivopad3.png" 
                alt="Aivo Pad - Side View" 
                className="w-full h-auto rounded-xl shadow-lg mb-4"
              />
              <p className="text-sm text-neutral-600 text-center font-semibold">Side Profile</p>
            </div>

            <div className="bg-neutral-50 rounded-2xl p-6">
              <img 
                src="/devices/aivopad4.png" 
                alt="Aivo Pad in Classroom Use" 
                className="w-full h-auto rounded-xl shadow-lg mb-4"
              />
              <p className="text-sm text-neutral-600 text-center font-semibold">In the Classroom</p>
            </div>

            <div className="bg-neutral-50 rounded-2xl p-6">
              <img 
                src="/devices/aivopad5.png" 
                alt="Aivo Pad Accessories" 
                className="w-full h-auto rounded-xl shadow-lg mb-4"
              />
              <p className="text-sm text-neutral-600 text-center font-semibold">What's Included</p>
            </div>
          </div>

          {/* Key Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {keyFeatures.map((feature, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 shadow-lg border border-neutral-200">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-neutral-900 mb-4">
                  {feature.title}
                </h3>
                <ul className="space-y-2">
                  {feature.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircleIcon className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-neutral-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Specifications */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              Technical Specifications
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Display & Input */}
            <div className="bg-neutral-50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-neutral-900 mb-6">Display & Input</h3>
              <div className="space-y-3">
                {technicalSpecs.display.map((spec, idx) => (
                  <div key={idx} className="flex justify-between items-start border-b border-neutral-200 pb-3">
                    <span className="font-semibold text-neutral-900">{spec.label}</span>
                    <span className="text-neutral-700 text-right">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance */}
            <div className="bg-neutral-50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-neutral-900 mb-6">Performance</h3>
              <div className="space-y-3">
                {technicalSpecs.performance.map((spec, idx) => (
                  <div key={idx} className="flex justify-between items-start border-b border-neutral-200 pb-3">
                    <span className="font-semibold text-neutral-900">{spec.label}</span>
                    <span className="text-neutral-700 text-right">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Connectivity */}
            <div className="bg-neutral-50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-neutral-900 mb-6">Connectivity</h3>
              <div className="space-y-3">
                {technicalSpecs.connectivity.map((spec, idx) => (
                  <div key={idx} className="flex justify-between items-start border-b border-neutral-200 pb-3">
                    <span className="font-semibold text-neutral-900">{spec.label}</span>
                    <span className="text-neutral-700 text-right">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Education Features */}
            <div className="bg-neutral-50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-neutral-900 mb-6">Education Features</h3>
              <div className="space-y-3">
                {technicalSpecs.education.map((spec, idx) => (
                  <div key={idx} className="flex justify-between items-start border-b border-neutral-200 pb-3">
                    <span className="font-semibold text-neutral-900">{spec.label}</span>
                    <span className="text-neutral-700 text-right">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Durability & Design */}
            <div className="bg-neutral-50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-neutral-900 mb-6">Durability & Design</h3>
              <div className="space-y-3">
                {technicalSpecs.durability.map((spec, idx) => (
                  <div key={idx} className="flex justify-between items-start border-b border-neutral-200 pb-3">
                    <span className="font-semibold text-neutral-900">{spec.label}</span>
                    <span className="text-neutral-700 text-right">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Battery & Power */}
            <div className="bg-neutral-50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-neutral-900 mb-6">Battery & Power</h3>
              <div className="space-y-3">
                {technicalSpecs.battery.map((spec, idx) => (
                  <div key={idx} className="flex justify-between items-start border-b border-neutral-200 pb-3">
                    <span className="font-semibold text-neutral-900">{spec.label}</span>
                    <span className="text-neutral-700 text-right">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Software & Security - Full Width */}
          <div className="bg-neutral-50 rounded-2xl p-8 mt-8">
            <h3 className="text-2xl font-bold text-neutral-900 mb-6">Software & Security</h3>
            <div className="grid md:grid-cols-2 gap-x-12 gap-y-3">
              {technicalSpecs.software.map((spec, idx) => (
                <div key={idx} className="flex justify-between items-start border-b border-neutral-200 pb-3">
                  <span className="font-semibold text-neutral-900">{spec.label}</span>
                  <span className="text-neutral-700 text-right">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Compliance & Certifications */}
      <section className="py-20 bg-gradient-to-br from-primary-50 to-accent-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              Compliance & Certifications
            </h2>
            <p className="text-lg text-neutral-600">
              Built to meet the highest standards for educational technology
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {certifications.map((cert, idx) => (
              <div key={idx} className="bg-white rounded-xl p-6 shadow-lg text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-success-100 rounded-full mb-4">
                  <CheckCircleIcon className="w-8 h-8 text-success-600" />
                </div>
                <h3 className="text-lg font-bold text-neutral-900 mb-2">
                  {cert.name}
                </h3>
                <p className="text-sm text-neutral-600">{cert.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              What's Included
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Package Contents */}
            <div className="bg-gradient-to-br from-primary-50 to-white rounded-2xl p-8 border-2 border-primary-200">
              <h3 className="text-2xl font-bold text-neutral-900 mb-6">Aivo Pad Package</h3>
              <ul className="space-y-3">
                {packageContents.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircleIcon className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5" />
                    <span className="text-neutral-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Optional Add-ons */}
            <div className="bg-neutral-50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-neutral-900 mb-6">Optional Add-ons</h3>
              <ul className="space-y-3">
                {addOns.map((addon, idx) => (
                  <li key={idx} className="flex items-start justify-between gap-3 pb-3 border-b border-neutral-200">
                    <div>
                      <p className="font-semibold text-neutral-900">{addon.name}</p>
                      {addon.description && (
                        <p className="text-sm text-neutral-600">{addon.description}</p>
                      )}
                    </div>
                    {addon.price && (
                      <span className="font-bold text-primary-600">{addon.price}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              Pricing
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Individual Pricing */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-neutral-900 mb-6">Individual Pricing</h3>
              <div className="space-y-4">
                <div>
                  <p className="font-semibold text-neutral-900">Aivo Pad (128GB, Wi-Fi)</p>
                  <p className="text-3xl font-bold text-primary-600">$149<span className="text-lg text-neutral-600">/device</span></p>
                </div>
                <div>
                  <p className="font-semibold text-neutral-900">Aivo Pad (128GB, 5G/LTE)</p>
                  <p className="text-3xl font-bold text-primary-600">$249<span className="text-lg text-neutral-600">/device</span></p>
                </div>
              </div>
            </div>

            {/* Volume Pricing */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-primary-300">
              <h3 className="text-2xl font-bold text-neutral-900 mb-6">School & District Volume Pricing</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <span className="text-neutral-700"><strong>5-24 devices:</strong> 10% discount</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <span className="text-neutral-700"><strong>25-99 devices:</strong> 15% discount</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <span className="text-neutral-700"><strong>100-499 devices:</strong> 20% discount</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <span className="text-neutral-700"><strong>500+ devices:</strong> Custom pricing</span>
                </li>
              </ul>
            </div>

            {/* Leasing Options */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-neutral-900 mb-6">Leasing Options</h3>
              <div className="space-y-4 mb-6">
                <div>
                  <p className="font-semibold text-neutral-900">36-month lease</p>
                  <p className="text-3xl font-bold text-accent-600">$15<span className="text-lg text-neutral-600">/device/month</span></p>
                </div>
                <div>
                  <p className="font-semibold text-neutral-900">48-month lease</p>
                  <p className="text-3xl font-bold text-accent-600">$12<span className="text-lg text-neutral-600">/device/month</span></p>
                </div>
              </div>
              <p className="text-sm text-neutral-600 italic">
                Includes warranty, support, and device replacement
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary-600 to-accent-600 rounded-2xl p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-4">Contact Sales</h3>
            <p className="text-lg mb-6">Ready to transform your classroom? Get in touch with our education specialists.</p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <a href="mailto:sales@aivolearning.com" className="text-white hover:text-primary-100 font-semibold">
                📧 sales@aivolearning.com
              </a>
              <span className="hidden md:inline text-primary-200">|</span>
              <a href="tel:1-800-248-6725" className="text-white hover:text-primary-100 font-semibold">
                📞 1-800-AIVO-SALES (1-800-248-6725)
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Compatible Devices */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              Compatible Devices
            </h2>
            <p className="text-xl text-neutral-600">
              Don't have an Aivo Pad? No problem!
            </p>
            <p className="text-lg text-neutral-600 mt-2">
              Aivo Learning works on a wide range of devices you may already own. Get the full adaptive learning experience on tablets, laptops, Chromebooks, and more.
            </p>
          </div>

          <div className="mb-12">
            <h3 className="text-3xl font-bold text-neutral-900 mb-8 text-center">
              ✅ Fully Supported Devices
            </h3>
            <p className="text-center text-neutral-600 mb-8">
              These devices support all Aivo Learning features, including stylus input, offline mode, and advanced accessibility options:
            </p>

            <div className="grid lg:grid-cols-2 gap-8">
              {compatibleDevices.fullSupport.map((category, idx) => (
                <div key={idx} className="bg-neutral-50 rounded-2xl p-8">
                  <h4 className="text-2xl font-bold text-neutral-900 mb-4">{category.category}</h4>
                  <ul className="space-y-2 mb-4">
                    {category.devices.map((device, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircleIcon className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                        <span className="text-neutral-700">{device}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="border-t border-neutral-200 pt-4 mt-4">
                    <p className="text-sm text-neutral-600">
                      <strong>Requirements:</strong> {category.requirements}
                    </p>
                    <p className="text-sm text-neutral-600 mt-2">
                      <strong>Stylus Support:</strong> {category.stylus}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop & Laptop Support */}
          <div className="bg-gradient-to-br from-accent-50 to-white rounded-2xl p-8 mb-12">
            <h3 className="text-3xl font-bold text-neutral-900 mb-4 text-center">
              💻 Desktop & Laptop Support
            </h3>
            <p className="text-center text-neutral-600 mb-8">
              Use Aivo Learning on standard computers for teacher dashboards, administrative access, and student learning (with limited stylus features)
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-xl font-bold text-neutral-900 mb-4">Supported Browsers</h4>
                <ul className="space-y-2">
                  {browsers.map((browser, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <GlobeAltIcon className="w-5 h-5 text-accent-600 flex-shrink-0 mt-0.5" />
                      <span className="text-neutral-700">{browser}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-xl font-bold text-neutral-900 mb-4">Operating Systems</h4>
                <ul className="space-y-2">
                  {operatingSystems.map((os, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircleIcon className="w-5 h-5 text-accent-600 flex-shrink-0 mt-0.5" />
                      <span className="text-neutral-700">{os}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              Feature Comparison
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-2xl shadow-lg overflow-hidden">
              <thead className="bg-primary-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Feature</th>
                  <th className="px-6 py-4 text-center font-semibold">Aivo Pad</th>
                  <th className="px-6 py-4 text-center font-semibold">iPad Pro</th>
                  <th className="px-6 py-4 text-center font-semibold">Android Tablet</th>
                  <th className="px-6 py-4 text-center font-semibold">Chromebook</th>
                  <th className="px-6 py-4 text-center font-semibold">Windows Device</th>
                  <th className="px-6 py-4 text-center font-semibold">Desktop Browser</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {featureComparison.map((row, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-neutral-50' : 'bg-white'}>
                    <td className="px-6 py-4 font-semibold text-neutral-900">{row.feature}</td>
                    <td className="px-6 py-4 text-center text-sm">{row.aivoPad}</td>
                    <td className="px-6 py-4 text-center text-sm">{row.iPad}</td>
                    <td className="px-6 py-4 text-center text-sm">{row.android}</td>
                    <td className="px-6 py-4 text-center text-sm">{row.chromebook}</td>
                    <td className="px-6 py-4 text-center text-sm">{row.windows}</td>
                    <td className="px-6 py-4 text-center text-sm">{row.desktop}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Why Choose Aivo Pad */}
      <section className="py-20 bg-gradient-to-br from-primary-600 to-accent-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Why Choose Aivo Pad?
            </h2>
            <p className="text-xl text-primary-100">
              Purpose-Built for Education
            </p>
          </div>

          <p className="text-center text-lg text-primary-100 mb-12 max-w-3xl mx-auto">
            Unlike consumer tablets retrofitted for schools, Aivo Pad is designed from the ground up for learning:
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyAivoPad.map((item, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-primary-100">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-6">
            {faq.map((item, idx) => (
              <div key={idx} className="bg-neutral-50 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-neutral-900 mb-3">
                  {item.question}
                </h3>
                <p className="text-neutral-700 leading-relaxed">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary-50 to-accent-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
            <div className="text-center mb-8">
              <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
                Ready to Transform Your Classroom?
              </h2>
              <p className="text-xl text-neutral-600 mb-8">
                Contact our education specialists to learn how the Aivo Pad can enhance learning outcomes in your district.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="text-center">
                <a
                  href="mailto:sales@aivolearning.com"
                  className="inline-block bg-primary-600 text-white px-8 py-4 rounded-xl hover:bg-primary-700 transition-colors font-semibold text-lg"
                >
                  📧 Email Sales
                </a>
              </div>
              <div className="text-center">
                <a
                  href="tel:1-800-248-6725"
                  className="inline-block bg-accent-600 text-white px-8 py-4 rounded-xl hover:bg-accent-700 transition-colors font-semibold text-lg"
                >
                  📞 Call Sales
                </a>
              </div>
            </div>

            <div className="border-t border-neutral-200 pt-8">
              <h3 className="text-2xl font-bold text-neutral-900 mb-6 text-center">
                Request Information
              </h3>
              <ul className="grid md:grid-cols-2 gap-4">
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <span className="text-neutral-700">Free 30-day pilot program for qualifying schools</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <span className="text-neutral-700">Volume pricing calculator</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <span className="text-neutral-700">Financing and leasing options</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <span className="text-neutral-700">Technical specifications datasheet (PDF)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <span className="text-neutral-700">ROI calculator for district technology leaders</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <span className="text-neutral-700">Case studies from similar schools</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
