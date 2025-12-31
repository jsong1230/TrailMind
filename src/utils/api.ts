// 입력 길이 제한 (3,000자)
const MAX_INPUT_LENGTH = 3000;

// 하루 호출 횟수 제한 (30회)
const MAX_DAILY_CALLS = 30;
const STORAGE_KEY_DAILY_CALLS = "trailmind-daily-calls";

/**
 * 하루 호출 횟수 확인 (LocalStorage 기반)
 */
function checkDailyCallLimit(): { allowed: boolean; remaining: number } {
  try {
    const today = new Date().toISOString().split("T")[0];
    const stored = localStorage.getItem(STORAGE_KEY_DAILY_CALLS);
    
    if (!stored) {
      localStorage.setItem(STORAGE_KEY_DAILY_CALLS, JSON.stringify({ date: today, count: 1 }));
      return { allowed: true, remaining: MAX_DAILY_CALLS - 1 };
    }

    const record = JSON.parse(stored) as { date: string; count: number };
    
    if (record.date !== today) {
      // 새로운 날
      localStorage.setItem(STORAGE_KEY_DAILY_CALLS, JSON.stringify({ date: today, count: 1 }));
      return { allowed: true, remaining: MAX_DAILY_CALLS - 1 };
    }

    if (record.count >= MAX_DAILY_CALLS) {
      return { allowed: false, remaining: 0 };
    }

    record.count++;
    localStorage.setItem(STORAGE_KEY_DAILY_CALLS, JSON.stringify(record));
    return { allowed: true, remaining: MAX_DAILY_CALLS - record.count };
  } catch (error) {
    // LocalStorage 오류 시 허용 (서버에서도 검증함)
    console.warn("Failed to check daily call limit:", error);
    return { allowed: true, remaining: MAX_DAILY_CALLS };
  }
}

export async function generateAiResult(payload: {
  guideId: "사고_명확성" | "감정_인식" | "관계_패턴";
  inputText: string;
  meta?: { date?: string; activity?: string; aloneOrWith?: string };
}) {
  // 입력 길이 검증
  const inputText = payload.inputText.trim();
  if (inputText.length > MAX_INPUT_LENGTH) {
    throw new Error(
      `입력 내용은 최대 ${MAX_INPUT_LENGTH}자까지 가능합니다. 현재 ${inputText.length}자입니다.`
    );
  }

  if (inputText.length === 0) {
    throw new Error("입력 내용이 비어있습니다.");
  }

  // 하루 호출 횟수 확인
  const callLimit = checkDailyCallLimit();
  if (!callLimit.allowed) {
    throw new Error(
      `하루 최대 ${MAX_DAILY_CALLS}회까지 호출할 수 있습니다. 내일 다시 시도해주세요.`
    );
  }

  const r = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, inputText }),
  });

  const data = await r.json().catch(() => null);

  if (!r.ok || !data?.ok) {
    const msg = data?.message || "AI 생성에 실패했습니다.";
    throw new Error(msg);
  }
  
  return data as {
    ok: true;
    model: string;
    createdAt: string;
    promptVersion?: string;
    result: any;
  };
}

