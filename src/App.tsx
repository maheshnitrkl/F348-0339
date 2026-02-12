import React from 'react';
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { Roadmap } from './pages/Roadmap'
import { LessonView } from './pages/LessonView'
import { Modules } from './pages/Modules'

function App() {
  const [currentView, setCurrentView] = React.useState('dashboard');
  const [activeModuleId, setActiveModuleId] = React.useState<string | undefined>(undefined);

  const handleNavigate = (view: string, moduleId?: string) => {
    setCurrentView(view);
    if (moduleId) {
      setActiveModuleId(moduleId);
    }
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard onNavigate={handleNavigate} />;
      case 'roadmap': return <Roadmap onNavigate={handleNavigate} />;
      case 'lesson': return <LessonView moduleId={activeModuleId} />;
      case 'modules': return <Modules onNavigate={handleNavigate} />;
      default: return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <Layout currentView={currentView} onNavigate={handleNavigate}>
      {renderView()}
    </Layout>
  )
}

export default App
