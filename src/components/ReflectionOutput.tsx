import { getPromptById } from '../utils/prompts';

interface ReflectionOutputProps {
  promptId?: string;
}

export function ReflectionOutput({ promptId }: ReflectionOutputProps) {
  if (!promptId) return null;

  const prompt = getPromptById(promptId);
  if (!prompt) return null;

  return (
    <div className="reflection-output">
      <h3>{prompt.title}</h3>
      <ul className="prompt-questions">
        {prompt.questions.map((question, index) => (
          <li key={index}>{question}</li>
        ))}
      </ul>
    </div>
  );
}


