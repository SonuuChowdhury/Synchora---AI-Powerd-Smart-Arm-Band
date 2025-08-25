import './demo.css';

export default function Demo() {
  return (
    <div className="demoRoot">
      <nav className="demoNavbar">
        <div className="demoLogoWrap" style={{marginRight: 'auto'}}>
          <img src="/logo.png" alt="Synchora Logo" className="demoLogoImg" />
          <span className="demoLogoText">Synchora</span>
        </div>
        <div className="demoNavHome" style={{marginLeft: 'auto'}}>
          <a href="/" className="demoHomeBtn">
            <span className="demoBackArrow">&#8592;</span> Home
          </a>
        </div>
      </nav>
      <section className="demoSection">
        <h1 className="demoTitle">Object Detection & Scene Description Demo</h1>
        <p className="demoSubtitle">
          Experience AI-powered object detection and scene description. Upload an image and let Synchora analyze and describe it for you!
        </p>
        <div className="demoActionBox">
          <span className="demoActionText">Ready to try it out?</span>
          <button className="demoActionBtn">Upload Image</button>
        </div>
      </section>
    </div>
  );
}