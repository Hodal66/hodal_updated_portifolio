import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import {
  Navbar,
  AnimatedBackground,
  HeroSection,
  AboutSection,
  SkillsSection,
  ProjectsSection,
  ExperienceSection,
  ContactSection,
  Footer,
} from '../components';

const HomePage = () => {
  const [activeSection, setActiveSection] = useState('home');
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen font-sans overflow-x-hidden ${isDark ? 'bg-dark-950 text-gray-100' : 'bg-slate-50 text-slate-800'}`}>
      <AnimatedBackground />
      <Navbar activeSection={activeSection} setActiveSection={setActiveSection} />

      <main className="relative z-10">
        {activeSection === 'home' && <HeroSection setActiveSection={setActiveSection} />}
        {activeSection === 'about' && <AboutSection />}
        {activeSection === 'skills' && <SkillsSection />}
        {activeSection === 'projects' && <ProjectsSection />}
        {activeSection === 'experience' && <ExperienceSection />}
        {activeSection === 'contact' && <ContactSection />}
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;
