import './demo.css';
import React, { useRef, useState } from 'react';

export default function Demo() {
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef();
  const cameraInputRef = useRef();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      uploadImage(file);
    }
  };

  const handleCameraChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      uploadImage(file);
    }
  };

  const uploadImage = async (file) => {
    setLoading(true);
    setError(null);
    setResult(null);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const response = await fetch('http://10.132.223.75:3000/upload', {
        method: 'POST',
        body: formData,
      });
      if (response.status === 200) {
        const data = await response.json();
        setResult(data);
      } else {
        setError('Server is down or closed. Please try again later.');
      }
    } catch (err) {
        console.log(err)
      setError('Server is down or closed. Please try again later.');
    }
    setLoading(false);
  };

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
          <div style={{display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center'}}>
            <button className="demoActionBtn" onClick={() => fileInputRef.current.click()} disabled={loading}>
              Select from Files
            </button>
            <button className="demoActionBtn" onClick={() => cameraInputRef.current.click()} disabled={loading}>
              Use Camera
            </button>
            <input
              type="file"
              accept="image/*"
              style={{display: 'none'}}
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <input
              type="file"
              accept="image/*"
              capture="environment"
              style={{display: 'none'}}
              ref={cameraInputRef}
              onChange={handleCameraChange}
            />
          </div>
        </div>
        {imagePreview && (
          <div style={{marginTop: '2rem', textAlign: 'center'}}>
            <img src={imagePreview} alt="Preview" style={{maxWidth: '320px', maxHeight: '320px', borderRadius: '16px', boxShadow: '0 0 16px #00ffe7'}} />
          </div>
        )}
        {loading && (
          <div style={{marginTop: '2rem', color: '#00ffe7', fontWeight: 600}}>Processing...</div>
        )}
        {error && (
          <div style={{marginTop: '2rem', color: '#ff4d4f', fontWeight: 600}}>{error}</div>
        )}
        {result && result.detection && (
          <div style={{marginTop: '2rem', width: '100%', maxWidth: '700px', marginLeft: 'auto', marginRight: 'auto'}}>
            <h2 style={{color: '#00ffe7', marginBottom: '1rem'}}>Detections</h2>
            <table style={{width: '100%', borderCollapse: 'collapse', background: 'rgba(24,28,36,0.8)', borderRadius: '12px', overflow: 'hidden'}}>
              <thead>
                <tr style={{background: '#232a3a', color: '#00ffe7'}}>
                  <th style={{padding: '0.7rem'}}>Class</th>
                  <th style={{padding: '0.7rem'}}>Confidence</th>
                  <th style={{padding: '0.7rem'}}>BBox (x, y, w, h)</th>
                </tr>
              </thead>
              <tbody>
                {result.detection.detections.map((det, idx) => (
                  <tr key={idx} style={{borderBottom: '1px solid #232a3a'}}>
                    <td style={{padding: '0.7rem', color: '#e0e6f6'}}>{det.class}</td>
                    <td style={{padding: '0.7rem', color: '#e0e6f6'}}>{(det.confidence * 100).toFixed(1)}%</td>
                    <td style={{padding: '0.7rem', color: '#e0e6f6'}}>{det.bbox.x}, {det.bbox.y}, {det.bbox.width}, {det.bbox.height}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{marginTop: '2rem', background: 'rgba(24,28,36,0.7)', borderRadius: '12px', padding: '1.2rem', color: '#e0e6f6', boxShadow: '0 0 12px #00ffe780'}}>
              <h3 style={{color: '#00ffe7'}}>Scene Description</h3>
              <div style={{marginTop: '0.7rem', fontSize: '1.1rem'}}>{result.speech}</div>
              <div style={{marginTop: '1.2rem', display: 'flex', gap: '2rem', flexWrap: 'wrap'}}>
                <span style={{color: '#b0b8c1'}}>Detection Model Time: <span style={{color: '#00ffe7'}}>{result.detect_time_ms} ms</span></span>
                <span style={{color: '#b0b8c1'}}>Description Model Time: <span style={{color: '#00ffe7'}}>{result.gemini_time_ms} ms</span></span>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}