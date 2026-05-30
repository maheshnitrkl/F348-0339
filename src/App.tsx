import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { Roadmap } from './pages/Roadmap'
import { LessonView } from './pages/LessonView'
import { Modules } from './pages/Modules'
import { Playground } from './pages/Playground'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/roadmap" element={<Roadmap />} />
        <Route path="/lesson/:moduleId" element={<LessonView />} />
        <Route path="/modules" element={<Modules />} />
        <Route path="/playground" element={<Playground />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

export default App
