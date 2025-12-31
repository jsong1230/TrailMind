import type { DailyLog, ExportData } from '../types/reflection';

const EXPORT_VERSION = '1.0.0';

/**
 * 로그 데이터를 Export 형식으로 변환
 */
export function exportLogs(logs: Record<string, DailyLog>): ExportData {
  return {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    logs,
  };
}

/**
 * Export 데이터를 JSON 파일로 다운로드
 */
export function downloadExport(data: ExportData, filename?: string): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `trailmind-export-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * JSON 파일을 읽어서 ExportData로 파싱
 */
export function parseImportFile(file: File): Promise<ExportData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = JSON.parse(text) as ExportData;
        
        // 기본 검증
        if (!data.version || !data.exportedAt || !data.logs) {
          throw new Error('Invalid export file format');
        }
        
        resolve(data);
      } catch (error) {
        reject(new Error('Failed to parse export file: ' + (error instanceof Error ? error.message : 'Unknown error')));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
}


