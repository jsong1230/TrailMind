/**
 * 간단한 Markdown 렌더링 (초기 버전)
 * 나중에 라이브러리로 교체 가능
 */
export function renderMarkdown(text: string): string {
  // 기본 Markdown 변환
  let html = text
    // 헤더
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // 볼드
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    // 이탤릭
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    // 줄바꿈
    .replace(/\n/gim, '<br>');

  return html;
}


