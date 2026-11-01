# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

TaskFlow는 TDD로 만드는 풀스택 할 일 관리 앱이다(JWT 회원가입/로그인, 태스크 CRUD, 상태 흐름 `pending → in_progress → completed`). `backend/`, `frontend/`, `e2e/`는 각각 독립된 npm 패키지이며 루트 워크스페이스는 없다.

## 기술 스택

- 백엔드: Hono, Drizzle ORM, SQLite (better-sqlite3), Zod, JWT(`hono/jwt`) + bcryptjs
- 프론트엔드: React, Vite, TailwindCSS, react-router-dom, axios
- 테스트: Vitest(백엔드는 `node`, 프론트엔드는 `jsdom` + Testing Library), E2E는 Playwright

## 현재 상태

- `backend/`: 세팅 완료, Red 단계. 설정, DB 스키마, 테스트는 있고 라우트와 `authMiddleware`는 아직 없다.
- `frontend/`, `e2e/`: 아직 `package.json`이 없다.

## 명령어 (`backend/`에서 실행)

```bash
npm run dev                        # tsx watch src/index.ts (포트 3000)
npm run db:migrate                 # drizzle-kit push:sqlite — 테스트 전에 스키마를 sqlite.db에 반영
npx vitest run                     # 전체 테스트 1회 실행 (npm test는 watch 모드)
npx vitest run tests/auth.test.ts  # 파일 하나
npx vitest run -t "토큰을 반환"      # 테스트 이름으로
npx tsc                            # 타입 체크 (noEmit)
```

## 개발 방식: 테스트가 곧 명세

Red → Green → Refactor 순서로 진행한다. 구현은 테스트의 `expect` 구문을 그대로 충족해야 하고, `expect`를 약화시켜 통과시키지 않는다. 문서화된 규칙과 테스트가 다르면 테스트를 따른다. 예를 들어 태스크 API는 `{ data: T }`로 감싸지 않고 배열/객체를 그대로 반환한다(`GET /api/tasks` → `Task[]`, `POST` → `Task`, 201).

## 백엔드 구조

- `src/index.ts`가 Hono `app`을 `export default`하고, `/api/auth`와 `/api/tasks` 라우터를 마운트한다. 테스트는 서버를 띄우지 않고 `app.request(...)`로 직접 호출한다.
- `src/db/index.ts`는 `DATABASE_URL`(기본값 `sqlite.db`)의 SQLite를 연다. `src/db/schema.ts`에는 `users`, `tasks`(`tasks.userId → users.id`, `status` 기본값 `'pending'`)가 있다.
- `authMiddleware`는 `Authorization: Bearer <token>`을 `JWT_SECRET`(기본값 `dev-secret`)으로 검증하고 `c.set('userId')`를 설정한다. 태스크 라우터 전체(`*`)에 적용하며, 모든 태스크 조회는 `userId`로 범위를 제한한다(다른 사용자의 태스크면 404).

## 규칙

- 모든 입력은 Zod로 검증하고, 실패하면 400을 반환한다. `PATCH /api/tasks/:id`도 예외가 아니다(status ∈ `pending|in_progress|completed`, title/description은 선택).
- 에러 응답은 항상 `{ error: string }`, 인증 성공 응답은 `{ user, token }`이다. 회원가입은 201로 응답한다.
- 비밀번호(해시 포함)는 어떤 응답에도 넣지 않는다.

## 테스트를 통과시킬 때 주의할 점

- `tests/tasks.test.ts`는 `Authorization: Bearer test-token`을 보내는데, 유효한 JWT가 아니라서 그대로는 401이 된다. `sign({ userId }, JWT_SECRET)`로 만든 토큰이나 `beforeAll`에서 회원가입해 받은 토큰을 쓰도록 셋업한다.
- `tests/auth.test.ts`는 `test@test.com` / `password123`으로 로그인하지만 이 사용자를 만드는 코드가 없다. 또 같은 DB에서 다시 실행하면 `new@test.com` 회원가입이 중복으로 400이 된다. 테스트 전용 DB(`DATABASE_URL`)를 쓰고 시드 데이터를 넣는다.
- PATCH/DELETE 테스트는 아직 비어 있는 스텁이라 항상 통과한다.

## 프론트엔드 / E2E 계약

- 컴포넌트는 RTL과 Playwright 양쪽에서 한국어 접근성 라벨로 찾으므로 라벨을 정확히 유지한다: `이메일`, `비밀번호`, `로그인` 버튼. 로그인 후 `/dashboard`로 이동한다.
- `TaskTable`(`src/components/tasks/TaskTable.tsx`)은 `{ tasks, onStatusChange(id, nextStatus) }`를 받는다. 각 행에 이름이 `상태 변경`인 버튼이 있고, 상태는 `pending → in_progress → completed → pending` 순으로 순환한다. 목록이 비면 `태스크가 없습니다`를 렌더링한다.
- E2E 픽스처 사용자는 `e2e-test@example.com` / `test123456`이며, 테스트 전에 존재해야 한다.
- `e2e/playwright.config.ts`의 `webServer`는 `../frontend`(5173)와 `../backend`(3000)를 `npm run dev`로 띄운다.

# 코드 컨벤션

- Typescript strict mode
- 함수형 컴포넌트 + Hooks
- 에러는 Zod 스키마로 검증
- 한글 주석 허용
