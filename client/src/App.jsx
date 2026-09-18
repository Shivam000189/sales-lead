import './App.css'
import { BrowserRouter, Route, Routes } from "react-router-dom";
import LeadCapture from './pages/LeadCapture';
import { Dashboard, LeadDetails, LeadForm, Leads, Login, RequireAuth } from './pages/CrmPages';
import Signup from './pages/SignUP';
import Analytics from './pages/Analytics';
import { SocketProvider } from './context/SocketContext';


function App() {

  return (
    <BrowserRouter>
      <SocketProvider>
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
          <Route path="/analytics" element={<RequireAuth adminOnly><Analytics /></RequireAuth>} />
        </Routes>
      </SocketProvider>
    </BrowserRouter>
  )
}

export default App
