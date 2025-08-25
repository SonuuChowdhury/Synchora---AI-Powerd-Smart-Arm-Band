import React from 'react';
import './Home.css';
import { useNavigate } from 'react-router-dom';

const teamMembers = [
  { name: 'Sonu Chowdhury', img: 'sonu.png' },
  { name: 'Kishlay Verma', img: 'kishlay.png' },
  { name: 'Subhojit Mukherjee', img: 'subhojit.png' },
  { name: 'Kanka Chakraborty', img: 'kanka.png' },
  { name: 'Hrithik Gupta', img: 'hrithik.png' },
];

const features = [
  {
    title: 'AI Image Recognition',
    desc: 'Navigate and get real-time descriptions of your surroundings. Perfect for visually impaired users.',
    icon: '🧠',
  },
  {
    title: 'Voice Memory',
    desc: 'Save events and information with your voice for easy recall.',
    icon: '🎤',
  },
  {
    title: 'AI Search Engine',
    desc: 'Ask anything, get instant answers powered by AI.',
    icon: '🔍',
  },
  {
    title: 'Emergency Alerts',
    desc: 'Send location and contacts instantly in emergencies.',
    icon: '🚨',
  },
  {
    title: 'Schedule & Finance',
    desc: 'Manage your day and track finances with AI assistance.',
    icon: '📅',
  },
];

const getProfileImg = (img) =>
  `/` + (img ? img : 'defaultProfile.png');

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="homeRoot">
      {/* Navbar */}
      <nav className="homeNavbar">
        <div className="homeLogoWrap">
          <img src="/logo.png" alt="Synchora Logo" className="homeLogoImg" />
          <span className="homeLogoText">Synchora</span>
        </div>
        <ul className="homeNavLinks">
          <li><a href="#home">Home</a></li>
          <li><a href="#features">Features</a></li>
          <li><a href="#team">Developers</a></li>
        </ul>
        <div className="homeNavBtns">
          <button className="homeDemoBtn" onClick={()=> navigate("/demo")}>Demo</button>
          <button className="homeLoginBtn" onClickCapture={()=> navigate("/login")}>Log in</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="homeHero" id="home">
        <div className="homeHeroContent">
          <img src="/logo.png" alt="Synchora Logo" className="homeHeroLogo" />
          <h1 className="homeHeroTitle">Synchora</h1>
          <h2 className="homeHeroTagline">AI Powered Arm Band</h2>
          <p className="homeHeroDesc">
            An arm-band designed for daily use, helping people manage and live their lives more effectively by making everyday tasks easier, faster, and more efficient—overcoming challenges with a single, all-in-one device.
          </p>
          <div className="homeHeroAnimatedText">
            <span>Empowering lives, one band at a time...</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="homeFeatures" id="features">
        <h2 className="homeSectionTitle">Features</h2>
        <div className="homeFeaturesGrid">
          {features.map((f, i) => (
            <div className="homeFeatureCard" key={i}>
              <div className="homeFeatureIcon">{f.icon}</div>
              <h3 className="homeFeatureTitle">{f.title}</h3>
              <p className="homeFeatureDesc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Developed By Section */}
      <section className="homeTeam" id="team">
        <h2 className="homeSectionTitle">Developed By</h2>
        <div className="homeTeamGrid">
          {teamMembers.map((member, i) => (
            <div className="homeTeamCard" key={i}>
              <img
                src={getProfileImg(member.img)}
                alt={member.name}
                className="homeTeamImg"
                onError={e => { e.target.src = '/defaultProfile.jpeg'; }}
              />
              <span className="homeTeamName">{member.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="homeFooter">
        <span>© {new Date().getFullYear()} Synchora. All rights reserved.</span>
        <div className="homeFooterLinks">
          <a href="#features">Features</a>
          <a href="#team">Team</a>
          <a href="#about">About</a>
        </div>
      </footer>
    </div>
  );
}
