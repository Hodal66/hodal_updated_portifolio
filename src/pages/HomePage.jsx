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

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Muheto Hodal",
    "url": "https://hodaltech.space/",
    "jobTitle": "Senior Full-Stack Developer",
    "knowsAbout": ["Web Development", "Software Engineering", "UI/UX Architecture", "React", "Node.js", "Cloud Computing"],
    "image": "https://res.cloudinary.com/dqd87p5cz/image/upload/v1774207737/HodalTechLogo_xrm8ah.png",
    "sameAs": [
      "https://github.com/muhetohodal",
      "https://linkedin.com/in/muhetohodal"
    ]
  };

  return (
    <div className={`min-h-screen font-sans overflow-x-hidden ${isDark ? 'bg-dark-950 text-gray-100' : 'bg-slate-50 text-slate-800'}`}>
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
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
