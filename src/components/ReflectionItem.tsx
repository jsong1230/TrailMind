import { useState, useEffect } from 'react';
import type { Reflection } from '../types/reflection';
import { renderMarkdown } from '../utils/markdown';
import { getPromptById } from '../utils/prompts';
import { buildKoreanReflectionPrompt } from '../utils/koreanPrompts';
import { generateReflectionAnalysis } from '../utils/aiClient';
import { formatAnalysisToMarkdown, parseAndFormatAnalysis } from '../utils/formatAnalysis';

interface ReflectionItemProps {
  reflection: Reflection;
  onUpdate: (id: string, updates: Partial<Reflection>) => void;
}

export function ReflectionItem({ reflection, onUpdate }: ReflectionItemProps) {
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiOutput, setAiOutput] = useState(reflection.aiOutput || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  // 기존 aiOutput이 있지만 aiAnalysisMarkdown이 없는 경우 변환
  useEffect(() => {
    if (reflection.aiOutput && !reflection.aiAnalysisMarkdown) {
      try {
        const markdown = parseAndFormatAnalysis(reflection.aiOutput);
        onUpdate(reflection.id, { aiAnalysisMarkdown: markdown });
      } catch (err) {
        console.error('Failed to convert existing AI output:', err);
      }
    }
  }, [reflection.id, reflection.aiOutput, reflection.aiAnalysisMarkdown, onUpdate]);

  const categoryLabels: Record<string, string> = {
    thinking: '사고 명확성',
    emotion: '감정 인식',
    relationship: '관계 패턴',
  };

  const handleGeneratePrompt = () => {
    const rawInput = reflection.rawInput || reflection.content || '';
    const category = reflection.category || 'thinking';
    
    // 프롬프트 생성 (수동 복사용)
    const prompt = buildKoreanReflectionPrompt(rawInput, category);
    
    onUpdate(reflection.id, {
      generatedPrompt: prompt,
      promptTemplateId: reflection.promptTemplateId || category,
    });
  };

  const handleGenerateAI = async () => {
    // 중복 클릭 방지
    if (isGenerating || isButtonDisabled) {
      return;
    }

    const rawInput = reflection.rawInput || reflection.content || '';
    const category = reflection.category || 'thinking';
    
    if (!rawInput.trim()) {
      setError('입력 내용이 없습니다.');
      return;
    }

    setIsGenerating(true);
    setIsButtonDisabled(true);
    setError(null);

    try {
      // AI 분석 요청
      const { analysis, promptVersion } = await generateReflectionAnalysis(rawInput, category);
      
      // JSON 원본 저장 (로컬 스토리지용)
      const jsonOutput = JSON.stringify(analysis, null, 2);
      
      // 마크다운으로 변환 (렌더링용)
      const markdownOutput = formatAnalysisToMarkdown(analysis);
      
      // 로그에 저장
      onUpdate(reflection.id, {
        aiOutput: jsonOutput, // JSON 원본 저장 (기존 호환성)
        aiAnalysisMarkdown: markdownOutput, // 마크다운 저장
        generatedPrompt: buildKoreanReflectionPrompt(rawInput, category),
        promptTemplateId: category,
        promptVersion, // 프롬프트 버전 저장
      });
      
      setAiOutput(jsonOutput);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'AI 분석 중 오류가 발생했습니다.';
      setError(errorMessage);
      console.error('AI 분석 오류:', err);
    } finally {
      setIsGenerating(false);
      // 버튼 비활성화 해제 (1초 후)
      setTimeout(() => {
        setIsButtonDisabled(false);
      }, 1000);
    }
  };

  const handleCopyPrompt = async () => {
    if (reflection.generatedPrompt) {
      try {
        await navigator.clipboard.writeText(reflection.generatedPrompt);
        alert('프롬프트가 클립보드에 복사되었습니다.');
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const handlePasteAIOutput = () => {
    onUpdate(reflection.id, { aiOutput });
  };

  const rawInput = reflection.rawInput || reflection.content || '';
  
  // AI 분석 결과가 있으면 마크다운으로 표시, 없으면 원본 입력만
  const combinedContent = reflection.aiAnalysisMarkdown
    ? `## 원본 입력\n\n${rawInput}\n\n---\n\n${reflection.aiAnalysisMarkdown}`
    : reflection.aiOutput
    ? `## 원본 입력\n\n${rawInput}\n\n---\n\n## AI 분석\n\n${reflection.aiOutput}`
    : rawInput;

  return (
    <div className="reflection-item">
      <div className="reflection-meta">
        {reflection.category && (
          <span className="category-badge">
            {categoryLabels[reflection.category]}
          </span>
        )}
        <span className="reflection-time">
          {new Date(reflection.date).toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
        <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
          {!reflection.aiOutput && (
            <button
              className="ai-generate-button"
              onClick={handleGenerateAI}
              disabled={isGenerating || isButtonDisabled || !reflection.rawInput}
              title={isGenerating ? 'AI 분석 중...' : isButtonDisabled ? '잠시 후 다시 시도해주세요' : 'AI로 분석 생성'}
            >
              {isGenerating ? '생성 중...' : 'AI로 생성'}
            </button>
          )}
          <button
            className="ai-toggle-button"
            onClick={() => setShowAIPanel(!showAIPanel)}
          >
            {showAIPanel ? 'AI 패널 닫기' : 'AI 패널'}
          </button>
        </div>
      </div>

      {showAIPanel && (
        <div className="ai-panel">
          <div className="ai-panel-section">
            <div className="ai-buttons">
              <button
                className="ai-button primary"
                onClick={handleGenerateAI}
                disabled={isGenerating || isButtonDisabled || !reflection.rawInput}
                title={isGenerating ? 'AI 분석 중...' : isButtonDisabled ? '잠시 후 다시 시도해주세요' : 'AI로 분석 생성'}
              >
                {isGenerating ? 'AI 분석 중...' : 'AI 분석하기'}
              </button>
              <button
                className="ai-button"
                onClick={handleGeneratePrompt}
                disabled={isGenerating || !reflection.rawInput}
              >
                프롬프트 생성
              </button>
              {reflection.generatedPrompt && (
                <button className="ai-button" onClick={handleCopyPrompt}>
                  프롬프트 복사
                </button>
              )}
            </div>
            {error && (
              <div className="ai-error">
                {error}
              </div>
            )}
            {reflection.generatedPrompt && (
              <div className="generated-prompt">
                <label>Generated Prompt:</label>
                <textarea
                  readOnly
                  value={reflection.generatedPrompt}
                  rows={6}
                  className="prompt-textarea"
                />
              </div>
            )}
          </div>

          <div className="ai-panel-section">
            <label htmlFor={`ai-output-${reflection.id}`}>AI 분석 결과:</label>
            <textarea
              id={`ai-output-${reflection.id}`}
              value={aiOutput}
              onChange={(e) => setAiOutput(e.target.value)}
              placeholder="AI 분석 결과가 여기에 표시됩니다. 수동으로 붙여넣을 수도 있습니다."
              rows={12}
              className="ai-output-textarea"
              readOnly={!!reflection.aiOutput}
            />
            {!reflection.aiOutput && (
              <button
                className="save-ai-button"
                onClick={handlePasteAIOutput}
                disabled={!aiOutput.trim()}
              >
                수동 저장
              </button>
            )}
          </div>
        </div>
      )}

      <div
        className="reflection-content"
        dangerouslySetInnerHTML={{
          __html: renderMarkdown(combinedContent),
        }}
      />

      {reflection.prompts && reflection.prompts.length > 0 && (
        <div className="used-prompts">
          <strong>사용한 가이드:</strong>
          <ul>
            {reflection.prompts.map((promptId) => {
              const prompt = getPromptById(promptId);
              return prompt ? <li key={promptId}>{prompt.title}</li> : null;
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

