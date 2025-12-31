import type { DailyLog, ExportData } from '../types/reflection';

export type ExportFormat = 'json' | 'markdown-daily' | 'markdown-weekly' | 'markdown-monthly' | 'pdf';

export interface ExportOptions {
  format: ExportFormat;
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  includeMetadata?: boolean;
}

/**
 * 날짜 범위 필터링
 */
function filterByDateRange(
  logs: Record<string, DailyLog>,
  startDate?: string,
  endDate?: string
): Record<string, DailyLog> {
  if (!startDate && !endDate) {
    return logs;
  }

  const filtered: Record<string, DailyLog> = {};
  for (const [date, log] of Object.entries(logs)) {
    if (startDate && date < startDate) continue;
    if (endDate && date > endDate) continue;
    filtered[date] = log;
  }
  return filtered;
}

/**
 * JSON 형식으로 내보내기 (개선된 메타데이터 포함)
 */
export function exportToJson(
  logs: Record<string, DailyLog>,
  options: ExportOptions
): ExportData {
  const filtered = filterByDateRange(logs, options.startDate, options.endDate);
  
  const exportData: ExportData = {
    version: '1.1.0',
    exportedAt: new Date().toISOString(),
    logs: filtered,
  };

  // 메타데이터 추가
  if (options.includeMetadata) {
    const totalDays = Object.keys(filtered).length;
    const totalReflections = Object.values(filtered).reduce(
      (sum, log) => sum + (log?.reflections?.length || 0),
      0
    );
    
    (exportData as any).metadata = {
      totalDays,
      totalReflections,
      dateRange: {
        start: options.startDate || Object.keys(filtered).sort()[0] || null,
        end: options.endDate || Object.keys(filtered).sort().reverse()[0] || null,
      },
      exportFormat: options.format,
    };
  }

  return exportData;
}

/**
 * 마크다운 형식으로 내보내기 (일별)
 */
export function exportToMarkdownDaily(
  logs: Record<string, DailyLog>,
  options: ExportOptions
): string {
  const filtered = filterByDateRange(logs, options.startDate, options.endDate);
  const sortedDates = Object.keys(filtered).sort().reverse();

  let markdown = `# TrailMind 일별 반성 로그\n\n`;
  if (options.startDate || options.endDate) {
    markdown += `**기간**: ${options.startDate || '시작'} ~ ${options.endDate || '종료'}\n\n`;
  }
  markdown += `**내보낸 날짜**: ${new Date().toLocaleDateString('ko-KR')}\n\n`;
  markdown += `---\n\n`;

  for (const date of sortedDates) {
    const log = filtered[date];
    if (!log || !log.reflections || log.reflections.length === 0) continue;

    const dateObj = new Date(date);
    markdown += `## ${dateObj.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    })}\n\n`;

    for (const reflection of log.reflections) {
      const time = new Date(reflection.date);
      markdown += `### ${time.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
      })}\n\n`;

      if (reflection.category) {
        const categoryLabels: Record<string, string> = {
          thinking: '사고 명확성',
          emotion: '감정 인식',
          relationship: '관계 패턴',
        };
        markdown += `**카테고리**: ${categoryLabels[reflection.category] || reflection.category}\n\n`;
      }

      const content = reflection.rawInput || reflection.content || '';
      markdown += `${content}\n\n`;

      if (reflection.aiAnalysisMarkdown) {
        markdown += `---\n\n${reflection.aiAnalysisMarkdown}\n\n`;
      }

      markdown += `---\n\n`;
    }
  }

  return markdown;
}

/**
 * 마크다운 형식으로 내보내기 (주별)
 */
export function exportToMarkdownWeekly(
  logs: Record<string, DailyLog>,
  options: ExportOptions
): string {
  const filtered = filterByDateRange(logs, options.startDate, options.endDate);
  const sortedDates = Object.keys(filtered).sort().reverse();

  // 주별로 그룹화
  const weeklyGroups: Record<string, string[]> = {};
  for (const date of sortedDates) {
    const dateObj = new Date(date);
    const weekStart = new Date(dateObj);
    weekStart.setDate(dateObj.getDate() - dateObj.getDay()); // 일요일로 맞춤
    const weekKey = weekStart.toISOString().split('T')[0];
    
    if (!weeklyGroups[weekKey]) {
      weeklyGroups[weekKey] = [];
    }
    weeklyGroups[weekKey].push(date);
  }

  let markdown = `# TrailMind 주별 반성 로그\n\n`;
  if (options.startDate || options.endDate) {
    markdown += `**기간**: ${options.startDate || '시작'} ~ ${options.endDate || '종료'}\n\n`;
  }
  markdown += `**내보낸 날짜**: ${new Date().toLocaleDateString('ko-KR')}\n\n`;
  markdown += `---\n\n`;

  for (const [weekStart, dates] of Object.entries(weeklyGroups).sort().reverse()) {
    const weekStartDate = new Date(weekStart);
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekStartDate.getDate() + 6);

    markdown += `## ${weekStartDate.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })} ~ ${weekEndDate.toLocaleDateString('ko-KR', {
      month: 'long',
      day: 'numeric',
    })}\n\n`;

    for (const date of dates.sort().reverse()) {
      const log = filtered[date];
      if (!log || !log.reflections || log.reflections.length === 0) continue;

      const dateObj = new Date(date);
      markdown += `### ${dateObj.toLocaleDateString('ko-KR', {
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      })}\n\n`;

      for (const reflection of log.reflections) {
        const time = new Date(reflection.date);
        markdown += `**${time.toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
        })}**\n\n`;

        const content = reflection.rawInput || reflection.content || '';
        markdown += `${content}\n\n`;

        if (reflection.aiAnalysisMarkdown) {
          markdown += `${reflection.aiAnalysisMarkdown}\n\n`;
        }

        markdown += `---\n\n`;
      }
    }
  }

  return markdown;
}

/**
 * 마크다운 형식으로 내보내기 (월별)
 */
export function exportToMarkdownMonthly(
  logs: Record<string, DailyLog>,
  options: ExportOptions
): string {
  const filtered = filterByDateRange(logs, options.startDate, options.endDate);
  const sortedDates = Object.keys(filtered).sort().reverse();

  // 월별로 그룹화
  const monthlyGroups: Record<string, string[]> = {};
  for (const date of sortedDates) {
    const monthKey = date.substring(0, 7); // YYYY-MM
    if (!monthlyGroups[monthKey]) {
      monthlyGroups[monthKey] = [];
    }
    monthlyGroups[monthKey].push(date);
  }

  let markdown = `# TrailMind 월별 반성 로그\n\n`;
  if (options.startDate || options.endDate) {
    markdown += `**기간**: ${options.startDate || '시작'} ~ ${options.endDate || '종료'}\n\n`;
  }
  markdown += `**내보낸 날짜**: ${new Date().toLocaleDateString('ko-KR')}\n\n`;
  markdown += `---\n\n`;

  for (const [monthKey, dates] of Object.entries(monthlyGroups).sort().reverse()) {
    const monthDate = new Date(`${monthKey}-01`);
    markdown += `## ${monthDate.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
    })}\n\n`;

    let monthReflectionCount = 0;
    for (const date of dates.sort().reverse()) {
      const log = filtered[date];
      if (!log || !log.reflections || log.reflections.length === 0) continue;

      monthReflectionCount += log.reflections.length;

      const dateObj = new Date(date);
      markdown += `### ${dateObj.toLocaleDateString('ko-KR', {
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      })}\n\n`;

      for (const reflection of log.reflections) {
        const time = new Date(reflection.date);
        markdown += `**${time.toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
        })}**\n\n`;

        const content = reflection.rawInput || reflection.content || '';
        markdown += `${content}\n\n`;

        if (reflection.aiAnalysisMarkdown) {
          markdown += `${reflection.aiAnalysisMarkdown}\n\n`;
        }

        markdown += `---\n\n`;
      }
    }

    markdown += `\n**이번 달 총 반성 수**: ${monthReflectionCount}개\n\n`;
    markdown += `---\n\n`;
  }

  return markdown;
}

/**
 * PDF 형식으로 내보내기 (브라우저 인쇄 API 사용)
 */
export function exportToPdf(
  logs: Record<string, DailyLog>,
  options: ExportOptions
): void {
  // 마크다운을 HTML로 변환
  const markdown = exportToMarkdownDaily(logs, options);
  const html = convertMarkdownToHtml(markdown);

  // 새 창 열기
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('팝업이 차단되었습니다. 브라우저 설정에서 팝업을 허용해주세요.');
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>TrailMind Export</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
            color: #1a1a1a;
          }
          h1 { font-size: 2rem; margin-top: 2rem; margin-bottom: 1rem; }
          h2 { font-size: 1.5rem; margin-top: 1.5rem; margin-bottom: 0.75rem; }
          h3 { font-size: 1.25rem; margin-top: 1rem; margin-bottom: 0.5rem; }
          p { margin: 0.5rem 0; }
          hr { margin: 1.5rem 0; border: none; border-top: 1px solid #e0e0e0; }
          @media print {
            body { padding: 1rem; }
            h1 { page-break-after: avoid; }
            h2 { page-break-after: avoid; }
          }
        </style>
      </head>
      <body>
        ${html}
      </body>
    </html>
  `);

  printWindow.document.close();

  // 인쇄 대화상자 열기
  setTimeout(() => {
    printWindow.print();
  }, 250);
}

/**
 * 마크다운을 HTML로 변환 (간단한 버전)
 */
function convertMarkdownToHtml(markdown: string): string {
  return markdown
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/---/gim, '<hr>')
    .replace(/\n\n/gim, '</p><p>')
    .replace(/^(.+)$/gim, '<p>$1</p>')
    .replace(/<p><\/p>/gim, '')
    .replace(/<p><h/gim, '<h')
    .replace(/<\/h([1-3])><\/p>/gim, '</h$1>');
}

/**
 * 파일 다운로드 (범용)
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 형식에 따라 내보내기 실행
 */
export function exportLogs(
  logs: Record<string, DailyLog>,
  options: ExportOptions
): void {
  switch (options.format) {
    case 'json':
      const jsonData = exportToJson(logs, options);
      downloadFile(
        JSON.stringify(jsonData, null, 2),
        `trailmind-export-${new Date().toISOString().split('T')[0]}.json`,
        'application/json'
      );
      break;

    case 'markdown-daily':
      const markdownDaily = exportToMarkdownDaily(logs, options);
      downloadFile(
        markdownDaily,
        `trailmind-daily-${new Date().toISOString().split('T')[0]}.md`,
        'text/markdown'
      );
      break;

    case 'markdown-weekly':
      const markdownWeekly = exportToMarkdownWeekly(logs, options);
      downloadFile(
        markdownWeekly,
        `trailmind-weekly-${new Date().toISOString().split('T')[0]}.md`,
        'text/markdown'
      );
      break;

    case 'markdown-monthly':
      const markdownMonthly = exportToMarkdownMonthly(logs, options);
      downloadFile(
        markdownMonthly,
        `trailmind-monthly-${new Date().toISOString().split('T')[0]}.md`,
        'text/markdown'
      );
      break;

    case 'pdf':
      exportToPdf(logs, options);
      break;

    default:
      throw new Error(`Unknown export format: ${options.format}`);
  }
}

