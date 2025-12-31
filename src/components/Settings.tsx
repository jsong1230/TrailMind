import { useRef, useState } from 'react';
import { useReflections } from '../hooks/useReflections';
import { parseImportFile } from '../utils/exportImport';
import { exportLogs, type ExportFormat } from '../utils/exportFormats';

export function Settings() {
  const { logs, importLogs } = useReflections();
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 새로운 익스포트 옵션
  const [exportFormat, setExportFormat] = useState<ExportFormat>('json');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [includeMetadata, setIncludeMetadata] = useState(true);

  const handleExport = () => {
    try {
      exportLogs(logs, {
        format: exportFormat,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        includeMetadata,
      });
      setImportStatus({
        type: 'success',
        message: '로그가 성공적으로 내보내졌습니다.',
      });
      setTimeout(() => setImportStatus({ type: null, message: '' }), 3000);
    } catch (error) {
      setImportStatus({
        type: 'error',
        message: error instanceof Error ? error.message : '내보내기 중 오류가 발생했습니다.',
      });
      setTimeout(() => setImportStatus({ type: null, message: '' }), 5000);
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
          로그 데이터를 다양한 형식으로 내보내거나 가져올 수 있습니다. 같은 ID의 항목이 있으면 최신 버전이 유지됩니다.
        </p>
        
        {/* 새로운 익스포트 옵션 */}
        <div className="export-options">
          <div className="export-option-group">
            <label htmlFor="export-format">내보내기 형식</label>
            <select
              id="export-format"
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
              className="export-select"
            >
              <option value="json">JSON (전체 데이터)</option>
              <option value="markdown-daily">Markdown (일별)</option>
              <option value="markdown-weekly">Markdown (주별)</option>
              <option value="markdown-monthly">Markdown (월별)</option>
              <option value="pdf">PDF (인쇄)</option>
            </select>
          </div>

          <div className="export-option-group">
            <label htmlFor="export-start-date">시작 날짜 (선택사항)</label>
            <input
              id="export-start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="export-date-input"
            />
          </div>

          <div className="export-option-group">
            <label htmlFor="export-end-date">종료 날짜 (선택사항)</label>
            <input
              id="export-end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="export-date-input"
            />
          </div>

          {exportFormat === 'json' && (
            <div className="export-option-group">
              <label className="export-checkbox-label">
                <input
                  type="checkbox"
                  checked={includeMetadata}
                  onChange={(e) => setIncludeMetadata(e.target.checked)}
                  className="export-checkbox"
                />
                메타데이터 포함
              </label>
            </div>
          )}

          <button className="action-button export-button" onClick={handleExport}>
            내보내기
          </button>
        </div>

        <div className="settings-actions">
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



