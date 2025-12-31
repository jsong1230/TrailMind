import type { Request, Response } from 'express';
import type { ReflectionCategory } from '../types/reflection';
import { buildKoreanReflectionPrompt } from '../utils/koreanPrompts';

interface GenerateRequest {
  input: string;
  category: ReflectionCategory;
}

interface GenerateResponse {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * 간단한 요청 제한 (같은 IP에서 연속 호출 방지)
 */
const requestCache = new Map<string, number>();
const RATE_LIMIT_MS = 2000; // 2초

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const lastRequest = requestCache.get(ip);
  
  if (lastRequest && now - lastRequest < RATE_LIMIT_MS) {
    return false; // 너무 빠른 요청
  }
  
  requestCache.set(ip, now);
  return true;
}

/**
 * AI API 호출 (OpenAI 또는 Claude)
 */
async function callAI(prompt: string): Promise<string> {
  const apiKey = process.env.AI_API_KEY;
  const apiProvider = process.env.AI_API_PROVIDER || 'openai';
  
  if (!apiKey) {
    throw new Error('AI_API_KEY 환경변수가 설정되지 않았습니다.');
  }

  if (apiProvider === 'openai') {
    return callOpenAI(prompt, apiKey);
  } else if (apiProvider === 'claude') {
    return callClaude(prompt, apiKey);
  } else {
    throw new Error(`지원하지 않는 AI 제공자: ${apiProvider}`);
  }
}

/**
 * OpenAI API 호출
 */
async function callOpenAI(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API 오류: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

/**
 * Claude API 호출 (Anthropic)
 */
async function callClaude(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: process.env.CLAUDE_MODEL || 'claude-3-haiku-20240307',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Claude API 오류: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.content[0]?.text || '';
}

/**
 * /api/generate 엔드포인트 핸들러
 */
export async function handleGenerate(req: Request, res: Response): Promise<void> {
  try {
    // Rate limiting 체크
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    if (!checkRateLimit(clientIp)) {
      res.status(429).json({
        success: false,
        error: '요청이 너무 빠릅니다. 잠시 후 다시 시도해주세요.',
      } as GenerateResponse);
      return;
    }

    // 요청 본문 검증
    const { input, category }: GenerateRequest = req.body;
    
    if (!input || typeof input !== 'string' || input.trim().length === 0) {
      res.status(400).json({
        success: false,
        error: '입력 내용이 필요합니다.',
      } as GenerateResponse);
      return;
    }

    if (!category || !['thinking', 'emotion', 'relationship'].includes(category)) {
      res.status(400).json({
        success: false,
        error: '유효한 카테고리가 필요합니다. (thinking, emotion, relationship)',
      } as GenerateResponse);
      return;
    }

    // 프롬프트 생성
    const prompt = buildKoreanReflectionPrompt(input, category);

    // AI API 호출
    const aiResponse = await callAI(prompt);

    // JSON 파싱 시도
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(aiResponse);
    } catch (parseError) {
      // JSON 파싱 실패 시 원본 반환
      parsedResponse = aiResponse;
    }

    // 성공 응답
    res.status(200).json({
      success: true,
      data: parsedResponse,
    } as GenerateResponse);
  } catch (error) {
    console.error('Generate API 오류:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
    } as GenerateResponse);
  }
}

