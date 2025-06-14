import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import FormDetailsPage from './pages/FormDetailPage'
import CreateFormPage from './pages/CreateFormPage'
import FormPage from './pages/FormPage'
import AdminDashboard from './pages/AdminDashboard'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/create" element={<CreateFormPage />} />
        <Route path="/form/:inviteCode" element={<FormPage />} />
        <Route path="/admin/forms/:id" element={<FormDetailsPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} /> 
      </Routes>
    </Router>
  )
}

export default App
