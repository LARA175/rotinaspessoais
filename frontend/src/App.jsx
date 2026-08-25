import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Dashboard from './components/Dashboard'
import CalendarView from './components/CalendarView'
import EventoForm from './components/EventoForm'
import CategoriaManager from './components/CategoriaManager'
import AlarmManager from './components/AlarmManager'

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Header />
      <main className="flex-1 pt-20">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/calendario" element={<CalendarView />} />
          <Route path="/eventos/novo" element={<EventoForm />} />
          <Route path="/eventos/editar/:id" element={<EventoForm editar={true} />} />
          <Route path="/categorias" element={<CategoriaManager />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>
      <Footer />
      <AlarmManager />
    </div>
  )
}

export default App
