import './App.css'
import { BrowserRouter, Route, Routes } from "react-router-dom";
import LeadCapture from './pages/LeadCapture';
import { Dashboard, LeadDetails, LeadForm, Leads, Login, RequireAuth } from './pages/CrmPages';
import Signup from './pages/SignUP';
import Analytics from './pages/Analytics';
import WorkflowSettings from './pages/WorkflowSettings';
import { Contacts, ContactDetails } from './pages/Contacts';
import Calendar from './pages/Calendar';
import { SocketProvider } from './context/SocketContext';
import { ThemeProvider } from './context/ThemeContext';


function App() {

  return (
    <ThemeProvider>
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
            <Route path="/contacts" element={<RequireAuth><Contacts /></RequireAuth>} />
            <Route path="/contacts/:id" element={<RequireAuth><ContactDetails /></RequireAuth>} />
            <Route path="/calendar" element={<RequireAuth><Calendar /></RequireAuth>} />
            <Route path="/analytics" element={<RequireAuth adminOnly><Analytics /></RequireAuth>} />
            <Route path="/workflows" element={<RequireAuth adminOnly><WorkflowSettings /></RequireAuth>} />
          </Routes>
        </SocketProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
