import { useRef, useState } from 'react';
import { useReflections } from '../hooks/useReflections';
import { exportLogs, downloadExport, parseImportFile } from '../utils/exportImport';

export function Settings() {
  const { logs, importLogs } = useReflections();
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    try {
      const exportData = exportLogs(logs);
      downloadExport(exportData);
      setImportStatus({
        type: 'success',
        message: '로그가 성공적으로 내보내졌습니다.',
      });
      setTimeout(() => setImportStatus({ type: null, message: '' }), 3000);
    } catch (error) {
      setImportStatus({
        type: 'error',
        message: '내보내기 중 오류가 발생했습니다.',
      });
      setTimeout(() => setImportStatus({ type: null, message: '' }), 3000);
    }
  };

  const handleImport = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setImportStatus({
        type: 'error',
        message: '파일을 선택해주세요.',
      });
      setTimeout(() => setImportStatus({ type: null, message: '' }), 3000);
      return;
    }

    try {
      const importData = await parseImportFile(file);
      importLogs(importData.logs);
      setImportStatus({
        type: 'success',
        message: `로그가 성공적으로 가져와졌습니다. (${Object.keys(importData.logs).length}일치)`,
      });
      setTimeout(() => setImportStatus({ type: null, message: '' }), 5000);
      
      // 파일 입력 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      setImportStatus({
        type: 'error',
        message: error instanceof Error ? error.message : '가져오기 중 오류가 발생했습니다.',
      });
      setTimeout(() => setImportStatus({ type: null, message: '' }), 5000);
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="settings">
      <h2>설정</h2>
      
      <div className="settings-section">
        <h3>데이터 관리</h3>
        <p className="settings-description">
          로그 데이터를 내보내거나 가져올 수 있습니다. 같은 ID의 항목이 있으면 최신 버전이 유지됩니다.
        </p>
        
        <div className="settings-actions">
          <div className="action-group">
            <h4>내보내기</h4>
            <p className="action-description">모든 로그를 JSON 파일로 다운로드합니다.</p>
            <button className="action-button export-button" onClick={handleExport}>
              Export Logs
            </button>
          </div>
          
          <div className="action-group">
            <h4>가져오기</h4>
            <p className="action-description">JSON 파일에서 로그를 가져와 병합합니다.</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              style={{ display: 'none' }}
              onChange={handleImport}
            />
            <button className="action-button import-button" onClick={handleFileSelect}>
              Import Logs
            </button>
          </div>
        </div>

        {importStatus.type && (
          <div className={`import-status ${importStatus.type}`}>
            {importStatus.message}
          </div>
        )}
      </div>

      <div className="settings-section">
        <h3>정보</h3>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">총 로그 일수:</span>
            <span className="info-value">{Object.keys(logs).length}</span>
          </div>
          <div className="info-item">
            <span className="info-label">총 반성 항목:</span>
            <span className="info-value">
              {Object.values(logs).reduce((sum, log) => sum + (log?.reflections?.length || 0), 0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

