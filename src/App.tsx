import { useState } from 'react';
import { ReflectionInput } from './components/ReflectionInput';
import { LogList } from './components/LogList';
import { WeeklyInsights } from './components/WeeklyInsights';
import { PatternInsights } from './components/PatternInsights';
import { Settings } from './components/Settings';
import { Search } from './components/Search';
import { useReflections } from './hooks/useReflections';
import type { Reflection } from './types/reflection';
import './App.css';

type Page = 'input' | 'logs' | 'insights' | 'patterns' | 'settings' | 'search';

function App() {
  const { addReflection, updateReflection, getDailyLogs } = useReflections();
  const [activePage, setActivePage] = useState<Page>('input');
  const [highlightReflectionId, setHighlightReflectionId] = useState<string | null>(null);
  const logs = getDailyLogs();

  const handleUpdateReflection = (id: string, updates: Partial<Reflection>) => {
    updateReflection(id, updates);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>TrailMind</h1>
        <p className="subtitle">개인 반성 시스템</p>
      </header>

      <nav className="tabs">
        <button
          className={activePage === 'input' ? 'active' : ''}
          onClick={() => setActivePage('input')}
        >
          반성하기
        </button>
        <button
          className={activePage === 'logs' ? 'active' : ''}
          onClick={() => setActivePage('logs')}
        >
          로그 보기 ({logs.length})
        </button>
        <button
          className={activePage === 'search' ? 'active' : ''}
          onClick={() => setActivePage('search')}
        >
          검색
        </button>
        <button
          className={activePage === 'insights' ? 'active' : ''}
          onClick={() => setActivePage('insights')}
        >
          주간 인사이트
        </button>
        <button
          className={activePage === 'patterns' ? 'active' : ''}
          onClick={() => setActivePage('patterns')}
        >
          패턴 인식
        </button>
        <button
          className={activePage === 'settings' ? 'active' : ''}
          onClick={() => setActivePage('settings')}
        >
          설정
        </button>
      </nav>

      <main className="app-main">
        {activePage === 'input' && (
          <div className="input-section">
            <ReflectionInput onSave={addReflection} />
          </div>
        )}
        {activePage === 'logs' && (
          <div className="logs-section">
            <LogList
              logs={logs}
              onUpdateReflection={handleUpdateReflection}
              highlightReflectionId={highlightReflectionId}
              onHighlightComplete={() => setHighlightReflectionId(null)}
            />
          </div>
        )}
        {activePage === 'insights' && (
          <div className="insights-section">
            <WeeklyInsights />
          </div>
        )}
        {activePage === 'patterns' && (
          <div className="patterns-section">
            <PatternInsights />
          </div>
        )}
        {activePage === 'search' && (
          <div className="search-section">
            <Search
              onSelectReflection={(reflection) => {
                setHighlightReflectionId(reflection.id);
                setActivePage('logs');
              }}
            />
          </div>
        )}
        {activePage === 'settings' && (
          <div className="settings-section">
            <Settings />
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>Local-first • 데이터는 브라우저에 저장됩니다</p>
      </footer>
    </div>
  );
}

export default App;

