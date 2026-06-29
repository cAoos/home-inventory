import React from 'react'
import { Routes, Route } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import Dashboard from './pages/Dashboard'
import Inventory from './pages/Inventory'
import Shopping from './pages/Shopping'
import PriceTracker from './pages/PriceTracker'
import Stores from './pages/Stores'
import Analytics from './pages/Analytics'
import Budget from './pages/Budget'
import Import from './pages/Import'
import Alerts from './pages/Alerts'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/shopping" element={<Shopping />} />
        <Route path="/prices" element={<PriceTracker />} />
        <Route path="/stores" element={<Stores />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/budget" element={<Budget />} />
        <Route path="/import" element={<Import />} />
        <Route path="/alerts" element={<Alerts />} />
      </Route>
    </Routes>
  )
}
