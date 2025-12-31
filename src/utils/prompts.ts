import type { ReflectionCategory } from '../types/reflection';

export interface ReflectionPrompt {
  id: string;
  category: ReflectionCategory;
  title: string;
  questions: string[];
}

export const reflectionPrompts: ReflectionPrompt[] = [
  {
    id: 'thinking-clarity',
    category: 'thinking',
    title: '사고 명확성',
    questions: [
      '오늘 무엇을 생각했나요?',
      '그 생각이 어디서 시작되었나요?',
      '생각을 더 명확하게 하려면 무엇이 필요할까요?',
      '이 생각이 당신의 행동에 어떤 영향을 미쳤나요?',
    ],
  },
  {
    id: 'emotional-awareness',
    category: 'emotion',
    title: '감정 인식',
    questions: [
      '오늘 어떤 감정을 느꼈나요?',
      '그 감정이 언제 시작되었나요?',
      '이 감정의 원인은 무엇이라고 생각하나요?',
      '이 감정이 당신에게 무엇을 알려주고 있나요?',
    ],
  },
  {
    id: 'relationship-patterns',
    category: 'relationship',
    title: '관계 패턴',
    questions: [
      '오늘 누구와 어떤 상호작용을 했나요?',
      '그 상호작용에서 어떤 패턴을 발견했나요?',
      '이 관계에서 무엇을 배웠나요?',
      '앞으로 어떻게 개선하고 싶나요?',
    ],
  },
];

export function getPromptsByCategory(category: ReflectionCategory): ReflectionPrompt[] {
  return reflectionPrompts.filter((p) => p.category === category);
}

export function getPromptById(id: string): ReflectionPrompt | undefined {
  return reflectionPrompts.find((p) => p.id === id);
}



