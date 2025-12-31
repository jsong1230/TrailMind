import { useState } from 'react';
import type { ReflectionCategory } from '../types/reflection';
import { reflectionPrompts, getPromptsByCategory } from '../utils/prompts';

interface ReflectionInputProps {
  onSave: (content: string, category?: ReflectionCategory, prompts?: string[], promptTemplateId?: string) => void;
}

export function ReflectionInput({ onSave }: ReflectionInputProps) {
  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ReflectionCategory | ''>('');
  const [selectedPrompt, setSelectedPrompt] = useState<string>('');

  const availablePrompts = selectedCategory
    ? getPromptsByCategory(selectedCategory)
    : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const prompts = selectedPrompt ? [selectedPrompt] : undefined;
    onSave(content.trim(), selectedCategory || undefined, prompts, selectedPrompt || undefined);
    setContent('');
    setSelectedCategory('');
    setSelectedPrompt('');
  };

  return (
    <form onSubmit={handleSubmit} className="reflection-input">
      <div className="input-group">
        <label htmlFor="category">카테고리 선택 (선택사항)</label>
        <select
          id="category"
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value as ReflectionCategory | '');
            setSelectedPrompt('');
          }}
        >
          <option value="">선택 안 함</option>
          <option value="thinking">사고 명확성</option>
          <option value="emotion">감정 인식</option>
          <option value="relationship">관계 패턴</option>
        </select>
      </div>

      {availablePrompts.length > 0 && (
        <div className="input-group">
          <label htmlFor="prompt">반성 가이드 선택 (선택사항)</label>
          <select
            id="prompt"
            value={selectedPrompt}
            onChange={(e) => setSelectedPrompt(e.target.value)}
          >
            <option value="">선택 안 함</option>
            {availablePrompts.map((prompt) => (
              <option key={prompt.id} value={prompt.id}>
                {prompt.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedPrompt && (
        <div className="prompt-questions">
          <h4>가이드 질문:</h4>
          <ul>
            {availablePrompts
              .find((p) => p.id === selectedPrompt)
              ?.questions.map((q, i) => (
                <li key={i}>{q}</li>
              ))}
          </ul>
        </div>
      )}

      <div className="input-group">
        <label htmlFor="content">반성 내용</label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="오늘의 생각, 감정, 경험을 자유롭게 적어보세요..."
          rows={8}
          required
        />
      </div>

      <button type="submit" className="save-button">
        저장하기
      </button>
    </form>
  );
}

