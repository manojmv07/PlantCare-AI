import React from 'react';
import { Link } from 'react-router-dom';
import { APP_NAME } from '../constants'; // APP_AUTHORS removed as it's handled by translate
import Card from '../components/Card';
import { useLanguage } from '../contexts/LanguageContext';
import PlantCareLogo from '../components/PlantCareLogo';

interface Feature {
  emoji: string;
  title: string;
  desc: string;
}

const LandingPage: React.FC = () => {
  const { translate } = useLanguage();

  const features: Feature[] = [
    {
      emoji: '🔍',
      title: 'Instant Analysis',
      desc: 'Real-time plant disease detection using advanced AI technology',
    },
    {
      emoji: '💊',
      title: 'Treatment Guide',
      desc: 'Detailed treatment recommendations and preventive measures',
    },
    {
      emoji: '📱',
      title: 'Easy to Use',
      desc: 'Simple interface with camera and upload options',
    },
    {
      emoji: '📊',
      title: 'Analysis History',
      desc: 'Track all your previous plant analyses',
    },
  ];

  const moreFeatures: Feature[] = [
    {
      emoji: '🌐',
      title: 'Multilingual Support',
      desc: 'Access the app in 100+ languages for global reach',
    },
    {
      emoji: '🌦️',
      title: 'Weather Insights',
      desc: 'Get real-time weather data and farming advice',
    },
    {
      emoji: '🔔',
      title: 'Smart Notifications',
      desc: 'Personalized reminders for plant care and updates',
    },
    {
      emoji: '🤝',
      title: 'Community Hub',
      desc: 'Connect, share, and learn with fellow plant lovers',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 via-white to-green-100">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center py-20 px-4 sm:px-0">
        <div className="mb-6">
          <PlantCareLogo size={96} />
        </div>
        <h1 className="text-5xl sm:text-7xl font-extrabold text-green-800 mb-4 leading-tight capitalize drop-shadow-lg">
          {translate(APP_NAME)}
        </h1>
        <p className="text-xl sm:text-2xl text-gray-700 max-w-2xl mx-auto leading-relaxed mb-8">
          {translate('appCatchphrase')}
        </p>
        <Link to="/scan" className="inline-block px-10 py-4 bg-green-600 text-white text-xl font-bold rounded-full shadow-lg hover:scale-105 hover:bg-green-700 transition-all duration-300">
          Get Started
        </Link>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 px-2 bg-gradient-to-b from-white to-green-50">
        <h2 className="text-4xl font-bold text-gray-800 text-center mb-12">Key Features</h2>
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="bg-white rounded-3xl shadow-xl p-8 flex flex-col items-center text-center transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl animate-fade-in-up"
              style={{ animationDelay: `${i * 0.1 + 0.2}s` }}
            >
              <div className="text-5xl mb-4 drop-shadow-lg">{f.emoji}</div>
              <div className="text-2xl font-bold text-gray-800 mb-2">{f.title}</div>
              <div className="text-gray-600 text-base">{f.desc}</div>
            </div>
          ))}
        </div>
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {moreFeatures.map((f, i) => (
            <div
              key={f.title}
              className="bg-white rounded-3xl shadow-xl p-8 flex flex-col items-center text-center transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl animate-fade-in-up"
              style={{ animationDelay: `${(i + 4) * 0.1 + 0.2}s` }}
            >
              <div className="text-5xl mb-4 drop-shadow-lg">{f.emoji}</div>
              <div className="text-2xl font-bold text-gray-800 mb-2">{f.title}</div>
              <div className="text-gray-600 text-base">{f.desc}</div>
            </div>
          ))}
        </div>

        {/* How It Works Section */}
        <h2 className="text-4xl font-bold text-gray-800 text-center mb-12">How It Works</h2>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-stretch justify-center gap-8 relative">
          {/* Connecting line (desktop only) */}
          <div className="hidden md:block absolute left-0 right-0 top-1/2 h-0.5 bg-green-200 z-0" style={{marginTop: '-1px'}} />
          {[
            {
              num: 1,
              title: 'Upload Image',
              desc: 'Take a photo or upload an image of your plant for instant analysis',
            },
            {
              num: 2,
              title: 'AI Analysis',
              desc: 'Our advanced AI technology analyzes your plant for diseases and health issues',
            },
            {
              num: 3,
              title: 'Get Results',
              desc: 'Receive detailed diagnosis and personalized treatment recommendations',
            },
          ].map((step, i) => (
            <div key={step.num} className="relative bg-white rounded-3xl shadow-xl flex-1 p-8 flex flex-col items-center text-center z-10 animate-fade-in-up" style={{ animationDelay: `${i * 0.15 + 0.2}s` }}>
              <div className="mb-6">
                <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center text-3xl font-bold text-white shadow-lg mx-auto mb-2 ring-4 ring-green-200" style={{boxShadow: '0 0 0 8px #bbf7d0, 0 4px 24px 0 #22c55e33'}}>
                  {step.num}
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-800 mb-2">{step.title}</div>
              <div className="text-gray-600 text-base">{step.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white text-green-900 py-8 mt-auto border-t border-green-100">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between px-4">
          <div className="flex items-center gap-3 mb-4 sm:mb-0">
            <PlantCareLogo size={40} />
            <span className="font-bold text-lg">{translate(APP_NAME)}</span>
          </div>
          <div className="flex gap-4 text-2xl">
            <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" className="hover:text-green-600 transition-colors">Twitter</a>
            <a href="https://github.com/" target="_blank" rel="noopener noreferrer" className="hover:text-green-600 transition-colors">GitHub</a>
            <a href="mailto:hello@plantcare.ai" className="hover:text-green-600 transition-colors">Contact</a>
          </div>
        </div>
        <div className="text-center text-green-400 mt-4 text-sm">&copy; {new Date().getFullYear()} PlantCare AI. All rights reserved.</div>
      </footer>

      {/* Animations */}
      <style>{`
        @keyframes fade-in-up { 0% { opacity: 0; transform: translateY(40px); } 100% { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fade-in-up 0.8s cubic-bezier(0.23, 1, 0.32, 1) both; }
      `}</style>
    </div>
  );
};

export default LandingPage;