import './App.css'
import { BrowserRouter, Route, Routes } from "react-router-dom";
import LeadCapture from './pages/LeadCapture';
import { Dashboard, LeadDetails, LeadForm, Leads, Login, RequireAuth } from './pages/CrmPages';
import Signup from './pages/SignUP';


function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<LeadCapture />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signin" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="/leads" element={<RequireAuth><Leads /></RequireAuth>} />
        <Route path="/leads/new" element={<RequireAuth><LeadForm /></RequireAuth>} />
        <Route path="/leads/:id/edit" element={<RequireAuth><LeadForm edit /></RequireAuth>} />
        <Route path="/leads/:id" element={<RequireAuth><LeadDetails /></RequireAuth>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
