import React from 'react';
import Header from './components/Header';
import ImageEditor from './components/ImageEditor';

function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-teal-100 selection:text-teal-900 pb-20">
      <Header />
      <main className="relative z-10">
        <ImageEditor />
      </main>
      
      {/* Abstract Background SVG for "Wireframe Body" Feel */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-30">
        <svg className="absolute w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
    </div>
  );
}

export default App;