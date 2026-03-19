import { useState, useEffect } from 'react';
import { ReflectionInput } from './components/ReflectionInput';
import { LogList } from './components/LogList';
import { WeeklyInsights } from './components/WeeklyInsights';
import { PatternInsights } from './components/PatternInsights';
import { Settings } from './components/Settings';
import { Search } from './components/Search';
import { Stats } from './components/Stats';
import { useReflections } from './hooks/useReflections';
import type { Reflection } from './types/reflection';
import './App.css';

type Page = 'input' | 'logs' | 'insights' | 'patterns' | 'settings' | 'search' | 'stats';
type Theme = 'system' | 'light' | 'dark';

function App() {
  const { addReflection, updateReflection, deleteReflection, getDailyLogs } = useReflections();
  const [activePage, setActivePage] = useState<Page>('input');
  const [highlightReflectionId, setHighlightReflectionId] = useState<string | null>(null);
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('trailmind-theme') as Theme) || 'system';
  });
  const logs = getDailyLogs();

  useEffect(() => {
    localStorage.setItem('trailmind-theme', theme);
    if (theme === 'system') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);

  const handleUpdateReflection = (id: string, updates: Partial<Reflection>) => {
    updateReflection(id, updates);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-top">
          <h1>TrailMind</h1>
          <button
            className="theme-toggle"
            onClick={() => setTheme(theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light')}
            title={`현재: ${theme === 'system' ? '시스템' : theme === 'light' ? '라이트' : '다크'}`}
          >
            {theme === 'light' ? '☀️' : theme === 'dark' ? '🌙' : '💻'}
          </button>
        </div>
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
          className={activePage === 'stats' ? 'active' : ''}
          onClick={() => setActivePage('stats')}
        >
          통계
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
              onDeleteReflection={deleteReflection}
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
        {activePage === 'stats' && (
          <div className="stats-section">
            <Stats logs={logs} />
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

