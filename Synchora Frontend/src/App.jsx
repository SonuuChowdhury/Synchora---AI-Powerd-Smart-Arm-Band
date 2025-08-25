import './App.css';
import Home from './Pages/Home/Home';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Demo from './Pages/Object Detection Model Demo/demo';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='*' element={<Home />} />
        <Route path='/demo' element={<Demo />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
