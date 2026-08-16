import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/AppShell.jsx';
import Dashboard from './pages/Dashboard.jsx';
import CareerProfile from './pages/CareerProfile.jsx';
import NewApplication from './pages/NewApplication.jsx';
import JobAnalysis from './pages/JobAnalysis.jsx';
import ApplicationPackage from './pages/ApplicationPackage.jsx';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/career-profile" element={<CareerProfile />} />
          <Route path="/new-application" element={<NewApplication />} />
          <Route path="/job-analysis" element={<JobAnalysis />} />
          <Route path="/application-package" element={<ApplicationPackage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;