import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';
import ServiceDetail from './pages/ServiceDetail';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Cookies from './pages/Cookies';

const AppRoutes = () => (
  <Router>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/services/:id" element={<ServiceDetail />} />
      <Route path="/kushtet" element={<Terms />} />
      <Route path="/privatesia" element={<Privacy />} />
      <Route path="/cookies" element={<Cookies />} />
    </Routes>
  </Router>
);

export default AppRoutes;
