// Componente raiz: layout com sidebar fixa + area de conteudo.
import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import CalendarView from './components/CalendarView'
import EventoForm from './components/EventoForm'
import CategoriaManager from './components/CategoriaManager'
import AlarmManager from './components/AlarmManager'

function App() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/calendario" element={<CalendarView />} />
          <Route path="/eventos/novo" element={<EventoForm />} />
          <Route path="/eventos/editar/:id" element={<EventoForm editar={true} />} />
          <Route path="/categorias" element={<CategoriaManager />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>
      <AlarmManager />
    </div>
  )
}

export default App
