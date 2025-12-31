# GitHub Webhook 확인 및 설정 가이드

Vercel 자동 배포를 위한 GitHub Webhook 확인 및 문제 해결 가이드입니다.

## 📍 GitHub Webhook 확인 방법

### Step 1: GitHub 저장소 접속

1. 브라우저에서 https://github.com/jsong1230/TrailMind 접속
2. 로그인 (필요한 경우)

### Step 2: Settings 메뉴 접근

1. 저장소 페이지 상단의 탭 메뉴에서 **Settings** 클릭
   - 위치: 저장소 이름 오른쪽, "Code", "Issues", "Pull requests" 등과 같은 줄
   - ⚠️ 주의: 저장소에 대한 **관리자 권한**이 있어야 Settings 탭이 보입니다

### Step 3: Webhooks 섹션 찾기

1. Settings 페이지 왼쪽 사이드바에서 **Webhooks** 클릭
   - 위치: "Code and automation" 섹션 아래
   - 또는 직접 URL: https://github.com/jsong1230/TrailMind/settings/hooks

### Step 4: Vercel Webhook 확인

Webhooks 페이지에서 다음을 확인합니다:

#### ✅ 정상 상태 확인 사항

1. **Webhook 존재 여부**
   - `vercel.com` 또는 `vercel.app` 도메인을 포함한 webhook이 있어야 함
   - 예: `https://api.vercel.com/v1/integrations/deploy/...`

2. **Active 상태**
   - Webhook 항목 오른쪽에 **Active** 또는 **Inactive** 표시 확인
   - ✅ **Active** (초록색) = 정상 작동
   - ❌ **Inactive** (회색) = 비활성화됨

3. **Events 설정**
   - Webhook 항목 클릭하여 상세 정보 확인
   - **"Just the push event"** 또는 **"Let me select individual events"** 중
   - ✅ **push** 이벤트가 체크되어 있어야 함

4. **최근 전송 기록**
   - Webhook 항목 클릭
   - **Recent Deliveries** 탭 확인
   - 최근 푸시에 대한 전송 기록 확인:
     - ✅ **200 OK** (초록색) = 성공
     - ❌ **4xx/5xx** (빨간색) = 실패

## 🔍 Webhook 상세 확인 방법

### Webhook 항목 클릭 시 보이는 정보

1. **Payload URL**
   - Vercel의 webhook 엔드포인트 URL
   - 예: `https://api.vercel.com/v1/integrations/deploy/...`

2. **Content type**
   - `application/json` 또는 `application/x-www-form-urlencoded`

3. **Secret**
   - 보안을 위한 시크릿 키 (있을 수도, 없을 수도 있음)

4. **Which events would you like to trigger this webhook?**
   - ✅ **Just the push event** (권장)
   - 또는 **Let me select individual events** → **push** 체크

5. **Active**
   - ✅ 체크되어 있어야 함

### Recent Deliveries 확인

1. Webhook 항목 클릭
2. **Recent Deliveries** 탭 클릭
3. 최근 전송 기록 확인:

#### 성공 케이스 (정상)
```
✅ 200 OK
Time: 2 minutes ago
Event: push
Branch: main
Commit: a27f208
```

#### 실패 케이스 (문제)
```
❌ 404 Not Found
Time: 5 minutes ago
Event: push
Branch: main
Commit: a27f208
Response: {"error": "Project not found"}
```

4. 실패한 항목 클릭하여 상세 정보 확인:
   - **Request**: 전송된 데이터
   - **Response**: 서버 응답 (에러 메시지 포함)
   - **Headers**: 요청 헤더 정보

## 🐛 문제 해결

### 문제 1: Webhook이 없음

**증상**: Webhooks 페이지에 Vercel webhook이 없음

**원인**: 
- Vercel에서 Git 저장소를 연결하지 않았음
- 또는 연결 후 webhook이 생성되지 않았음

**해결 방법**:
1. Vercel 대시보드 → 프로젝트 → Settings → Git
2. "Connect Git Repository" 클릭
3. `jsong1230/TrailMind` 선택
4. "Import" 클릭
5. Webhook이 자동으로 생성됨

### 문제 2: Webhook이 Inactive 상태

**증상**: Webhook은 있지만 "Inactive"로 표시됨

**해결 방법**:
1. Webhook 항목 클릭
2. **Active** 체크박스 확인
3. 체크되어 있지 않으면 체크
4. **Update webhook** 클릭

### 문제 3: 최근 전송이 실패함

**증상**: Recent Deliveries에서 빨간색 에러 표시

**일반적인 에러와 해결**:

#### 에러 1: `404 Not Found`
```
Response: {"error": "Project not found"}
```
**원인**: Vercel 프로젝트가 삭제되었거나 이름이 변경됨

**해결**:
1. Vercel 대시보드에서 프로젝트 확인
2. 프로젝트가 없으면 새로 생성
3. Git 연결 재설정

#### 에러 2: `401 Unauthorized`
```
Response: {"error": "Unauthorized"}
```
**원인**: Vercel API 키가 만료되었거나 권한이 없음

**해결**:
1. Vercel → Settings → Git
2. "Disconnect" 후 다시 연결
3. Webhook이 자동으로 재생성됨

#### 에러 3: `500 Internal Server Error`
```
Response: {"error": "Internal server error"}
```
**원인**: Vercel 서버 문제 또는 일시적 오류

**해결**:
1. 몇 분 후 다시 시도
2. 여전히 실패하면 Vercel 지원팀에 문의

### 문제 4: Webhook은 있지만 자동 배포가 안 됨

**증상**: Webhook은 Active이고 전송도 성공하지만 배포가 시작되지 않음

**확인 사항**:
1. Vercel → Settings → Git
2. **Auto-deploy from Git**이 **Enabled**인지 확인
3. **Production Branch**가 `main`인지 확인

**해결**:
1. Auto-deploy를 Disabled → Enabled로 변경
2. Save 클릭
3. 테스트 푸시: `git push origin main`

## 🔄 Webhook 재설정 방법

### 방법 1: Vercel에서 Git 재연결 (권장)

1. **Vercel 대시보드** → 프로젝트 → Settings → Git
2. **Disconnect** 클릭
3. 확인 대화상자에서 **Disconnect** 확인
4. **Connect Git Repository** 클릭
5. `jsong1230/TrailMind` 선택
6. **Import** 클릭
7. Webhook이 자동으로 재생성됨

### 방법 2: GitHub에서 Webhook 삭제 후 재생성

1. **GitHub** → Settings → Webhooks
2. Vercel webhook 찾기
3. 오른쪽 **...** 메뉴 클릭 → **Delete** 선택
4. 확인 대화상자에서 **Yes, delete webhook** 클릭
5. **Vercel** → Settings → Git → **Disconnect** 후 다시 연결
6. Webhook이 자동으로 재생성됨

## ✅ 체크리스트

Webhook이 정상 작동하는지 확인:

- [ ] GitHub → Settings → Webhooks에서 Vercel webhook 존재
- [ ] Webhook이 **Active** 상태
- [ ] **push** 이벤트가 체크되어 있음
- [ ] Recent Deliveries에서 최근 푸시에 대한 전송이 **200 OK**
- [ ] Vercel → Settings → Git에서 **Auto-deploy from Git**이 **Enabled**
- [ ] `git push` 후 1-2분 내에 Vercel에서 배포 시작됨

## 📸 예상 화면

### 정상 Webhook 화면
```
Webhooks
├─ vercel.com
   ├─ Status: ✅ Active
   ├─ Events: push
   ├─ Recent Deliveries:
   │  ├─ ✅ 200 OK (2 min ago) - push to main
   │  ├─ ✅ 200 OK (1h ago) - push to main
   │  └─ ✅ 200 OK (2h ago) - push to main
```

### 문제 있는 Webhook 화면
```
Webhooks
├─ vercel.com
   ├─ Status: ❌ Inactive
   ├─ Events: push
   ├─ Recent Deliveries:
   │  ├─ ❌ 404 Not Found (5 min ago) - push to main
   │  └─ ❌ 404 Not Found (1h ago) - push to main
```

## 🔗 관련 문서

- [Vercel 자동 배포 설정](./VERCEL_AUTO_DEPLOY_SETUP.md)
- [자동 배포 문제 해결](./TROUBLESHOOTING_AUTO_DEPLOY.md)
- [Vercel 배포 가이드](./VERCEL_DEPLOYMENT.md)

