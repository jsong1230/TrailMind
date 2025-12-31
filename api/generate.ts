type GuideId = "사고_명확성" | "감정_인식" | "관계_패턴";

type ReqBody = {
  guideId: GuideId;
  inputText: string;
  meta?: {
    date?: string;
    activity?: string;
    aloneOrWith?: string;
  };
};

type TrailMindJson = {
  핵심_요약: string;
  사실과_해석: { 사실: string[]; 해석: string[] };
  감정_신호: string[];
  관계_신호: string[];
  재해석: string;
  오늘의_질문: string;
  아주_작은_행동: string;
};

// 프롬프트 버전 관리
const PROMPT_VERSION = "1.0.0";

// 입력 길이 제한 (3,000자)
const MAX_INPUT_LENGTH = 3000;

// 하루 호출 횟수 제한 (30회/IP)
const MAX_DAILY_CALLS = 30;
const COOLDOWN_MS = 2500; // 2.5초 쿨다운 (연속 호출 방지)

const GUIDE_PROMPTS: Record<GuideId, string> = {
  사고_명확성: `당신은 사고의 명확성을 돕는 분석가입니다. 상담/위로/동기부여 톤 금지. 차분하고 분석적으로 작성하세요.

분석 원칙:
1. 사실과 해석을 엄격히 구분
2. 사고의 논리적 흐름 파악
3. 가정이나 편견 식별
4. 명확하지 않은 부분 지적

중요: "오늘의_질문"은 반드시 사고를 더 명확하게 하는 구체적이고 실용적인 질문이어야 합니다. 일반적이거나 추상적인 질문은 피하세요.`,
  감정_인식: `당신은 감정 패턴을 분석하는 관찰자입니다. 상담/위로/동기부여 톤 금지. 차분하고 분석적으로 작성하세요.

분석 원칙:
1. 명시적/암묵적 감정 신호 식별
2. 감정의 강도나 변화 추적
3. 감정을 유발한 상황 파악
4. 반복되는 감정 패턴 인식

중요: "오늘의_질문"은 반드시 감정을 더 깊이 이해하기 위한 구체적이고 실용적인 질문이어야 합니다. 일반적이거나 추상적인 질문은 피하세요.`,
  관계_패턴: `당신은 관계 역학을 분석하는 관찰자입니다. 상담/위로/동기부여 톤 금지. 차분하고 분석적으로 작성하세요.

분석 원칙:
1. 관계 관련 언급 모두 식별
2. 상호작용 패턴 파악
3. 기대나 경계 인식
4. 관계에서의 역할이나 위치 파악

중요: "오늘의_질문"은 반드시 관계 패턴을 더 깊이 이해하기 위한 구체적이고 실용적인 질문이어야 합니다. 일반적이거나 추상적인 질문은 피하세요.`,
};

// --- 호출 제한 관리 ---
const lastCallByIp = new Map<string, number>(); // 연속 호출 방지
const dailyCallCountByIp = new Map<string, { count: number; date: string }>(); // 하루 호출 횟수

function getClientIp(req: any): string {
  // Vercel/프록시 환경에서 자주 쓰는 헤더들
  const xf = req.headers?.["x-forwarded-for"] as string | undefined;
  if (xf) return xf.split(",")[0].trim();
  return (req.socket?.remoteAddress as string) || "unknown";
}

function getTodayDateString(): string {
  return new Date().toISOString().split("T")[0];
}

function checkDailyCallLimit(ip: string): { allowed: boolean; remaining: number } {
  const today = getTodayDateString();
  const record = dailyCallCountByIp.get(ip);

  if (!record || record.date !== today) {
    // 새로운 날이거나 첫 호출
    dailyCallCountByIp.set(ip, { count: 1, date: today });
    return { allowed: true, remaining: MAX_DAILY_CALLS - 1 };
  }

  if (record.count >= MAX_DAILY_CALLS) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  dailyCallCountByIp.set(ip, record);
  return { allowed: true, remaining: MAX_DAILY_CALLS - record.count };
}

function badRequest(res: any, message: string, status = 400) {
  res.status(status).json({ ok: false, message });
}

/**
 * JSON 파싱 시 마크다운 코드 블록 제거 및 정리
 */
function cleanJsonText(text: string): string {
  return text
    .replace(/```json\s*/g, "")
    .replace(/```\s*/g, "")
    .replace(/^[^{]*/, "") // JSON 시작 전 텍스트 제거
    .replace(/[^}]*$/, "") // JSON 종료 후 텍스트 제거
    .trim();
}

/**
 * 필수 필드 검증 (특히 "오늘의_질문")
 */
function validateTrailMindJson(data: any): { valid: boolean; error?: string } {
  if (!data || typeof data !== "object") {
    return { valid: false, error: "응답이 객체가 아닙니다." };
  }

  const requiredFields = [
    "핵심_요약",
    "사실과_해석",
    "감정_신호",
    "관계_신호",
    "재해석",
    "오늘의_질문",
    "아주_작은_행동",
  ];

  for (const field of requiredFields) {
    if (!(field in data)) {
      return { valid: false, error: `필수 필드 "${field}"가 누락되었습니다.` };
    }
  }

  // "오늘의_질문"은 반드시 의미있는 내용이 있어야 함
  if (!data.오늘의_질문 || data.오늘의_질문.trim().length < 5) {
    return {
      valid: false,
      error: '"오늘의_질문"이 비어있거나 너무 짧습니다. 구체적이고 실용적인 질문이 필요합니다.',
    };
  }

  // 사실과_해석 구조 검증
  if (
    !data.사실과_해석 ||
    !Array.isArray(data.사실과_해석.사실) ||
    !Array.isArray(data.사실과_해석.해석)
  ) {
    return { valid: false, error: '"사실과_해석" 구조가 올바르지 않습니다.' };
  }

  // 배열 필드 검증
  if (!Array.isArray(data.감정_신호) || !Array.isArray(data.관계_신호)) {
    return { valid: false, error: "감정_신호 또는 관계_신호가 배열이 아닙니다." };
  }

  return { valid: true };
}

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== "POST") {
      return badRequest(res, "POST 요청만 지원합니다.", 405);
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return badRequest(res, "서버에 OPENAI_API_KEY가 설정되지 않았습니다.", 500);
    }

    const ip = getClientIp(req);

    // 연속 호출 방지 (2.5초 쿨다운)
    const now = Date.now();
    const last = lastCallByIp.get(ip) ?? 0;
    if (now - last < COOLDOWN_MS) {
      return badRequest(res, "요청이 너무 빠릅니다. 잠시 후 다시 시도해주세요.", 429);
    }
    lastCallByIp.set(ip, now);

    // 하루 호출 횟수 제한
    const callLimit = checkDailyCallLimit(ip);
    if (!callLimit.allowed) {
      return badRequest(
        res,
        `하루 최대 ${MAX_DAILY_CALLS}회까지 호출할 수 있습니다. 내일 다시 시도해주세요.`,
        429
      );
    }

    const body = req.body as ReqBody;
    if (!body?.guideId || !body?.inputText?.trim()) {
      return badRequest(res, "guideId와 inputText는 필수입니다.");
    }

    // 입력 길이 제한
    const inputText = body.inputText.trim();
    if (inputText.length > MAX_INPUT_LENGTH) {
      return badRequest(
        res,
        `입력 내용은 최대 ${MAX_INPUT_LENGTH}자까지 가능합니다. 현재 ${inputText.length}자입니다.`,
        400
      );
    }

    const schema = {
      name: "trailmind_reflection",
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          핵심_요약: { type: "string" },
          사실과_해석: {
            type: "object",
            additionalProperties: false,
            properties: {
              사실: { type: "array", items: { type: "string" } },
              해석: { type: "array", items: { type: "string" } },
            },
            required: ["사실", "해석"],
          },
          감정_신호: { type: "array", items: { type: "string" } },
          관계_신호: { type: "array", items: { type: "string" } },
          재해석: { type: "string" },
          오늘의_질문: { type: "string" },
          아주_작은_행동: { type: "string" },
        },
        required: [
          "핵심_요약",
          "사실과_해석",
          "감정_신호",
          "관계_신호",
          "재해석",
          "오늘의_질문",
          "아주_작은_행동",
        ],
      },
      strict: true,
    };

    const system = GUIDE_PROMPTS[body.guideId].trim();
    const user = `
[메타]
- 날짜: ${body.meta?.date ?? "미기재"}
- 활동: ${body.meta?.activity ?? "미기재"}
- 혼자/함께: ${body.meta?.aloneOrWith ?? "미기재"}

[사용자 입력]
${inputText}
`.trim();

    // OpenAI API 호출 (최대 2회 시도)
    let parsed: TrailMindJson | null = null;
    let lastError: string | null = null;
    const maxRetries = 2;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // 타임아웃 처리를 위한 AbortController
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 25000); // 25초 타임아웃

        const resp = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: process.env.OPENAI_MODEL || "gpt-4o-mini",
            messages: [
              { role: "system", content: system },
              { role: "user", content: user },
            ],
            response_format: { type: "json_schema", json_schema: schema },
            temperature: 0.7,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!resp.ok) {
          const errText = await resp.text().catch(() => "");
          lastError = `AI 호출 실패 (${resp.status}): ${errText?.slice(0, 200) ?? ""}`;
          
          // 재시도 가능한 에러인지 확인 (5xx 에러만 재시도)
          if (resp.status >= 500 && attempt < maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, 1000 * attempt)); // 지수 백오프
            continue;
          }
          
          return badRequest(res, lastError, 500);
        }

        const data = await resp.json();

        // Chat Completions API의 출력 텍스트 추출
        let jsonText = "";
        if (data?.choices?.[0]?.message?.content) {
          jsonText = data.choices[0].message.content;
        } else {
          lastError = "AI 응답에 내용이 없습니다.";
          if (attempt < maxRetries) continue;
          return badRequest(res, lastError, 500);
        }

        // JSON 파싱 시도
        try {
          const cleanedText = cleanJsonText(jsonText);
          parsed = JSON.parse(cleanedText) as TrailMindJson;
        } catch (parseError) {
          lastError = `JSON 파싱 실패: ${parseError instanceof Error ? parseError.message : "알 수 없는 오류"}`;
          
          // 재시도 가능한 경우 (첫 시도이고 JSON 파싱 실패)
          if (attempt < maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
            continue;
          }
          
          return badRequest(res, lastError, 500);
        }

        // 필수 필드 검증
        const validation = validateTrailMindJson(parsed);
        if (!validation.valid) {
          lastError = validation.error || "필수 필드 검증 실패";
          
          // 재시도 가능한 경우
          if (attempt < maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
            continue;
          }
          
          return badRequest(res, lastError, 500);
        }

        // 성공: 루프 종료
        break;
      } catch (fetchError: any) {
        // 네트워크 오류나 타임아웃
        if (fetchError.name === "AbortError" || fetchError.name === "TimeoutError") {
          lastError = "AI 응답 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.";
        } else if (fetchError.name === "TypeError" && fetchError.message?.includes("fetch")) {
          lastError = "네트워크 연결에 실패했습니다. 인터넷 연결을 확인해주세요.";
        } else {
          lastError = `네트워크 오류: ${fetchError.message ?? "알 수 없는 오류"}`;
        }

        // 재시도 가능한 경우
        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
          continue;
        }

        return badRequest(res, lastError, 500);
      }
    }

    if (!parsed) {
      return badRequest(res, lastError || "AI 응답을 처리할 수 없습니다.", 500);
    }

    return res.status(200).json({
      ok: true,
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      createdAt: new Date().toISOString(),
      promptVersion: PROMPT_VERSION,
      result: parsed,
    });
  } catch (e: any) {
    return badRequest(res, `서버 오류: ${e?.message ?? "알 수 없는 오류"}`, 500);
  }
}

