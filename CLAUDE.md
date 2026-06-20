# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 명령어

```bash
npm run dev       # 개발 서버 시작 (localhost:3000)
npm run build     # 프로덕션 빌드
npm run lint      # ESLint 검사
```

shadcn/ui 컴포넌트 추가:
```bash
npx shadcn@latest add [component-name]
```

## 환경 변수

`.env.local` 파일이 필요하며 다음 변수를 설정해야 합니다:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

## 아키텍처

### 인증 흐름

Supabase Auth를 쿠키 기반 세션으로 사용합니다. 세션 갱신은 `proxy.ts` (미들웨어 역할)에서 처리하며, `lib/supabase/proxy.ts`의 `updateSession`을 호출합니다.

- **서버 컴포넌트**: `lib/supabase/server.ts`의 `createClient()` — 매 함수 호출마다 새 인스턴스 생성 필요 (전역 변수 금지)
- **클라이언트 컴포넌트**: `lib/supabase/client.ts`의 `createClient()`

인증이 필요한 페이지는 `app/protected/` 아래에 배치합니다. 인증 관련 라우트는 `app/auth/` 아래에 있습니다 (login, sign-up, forgot-password, update-password, confirm, error).

### 컴포넌트 구조

- `components/ui/` — shadcn/ui 기반 기본 UI 컴포넌트 (수정 지양)
- `components/` — 비즈니스 로직이 담긴 기능 컴포넌트 (폼, 버튼 등)
- `components/tutorial/` — 스타터 튜토리얼용 컴포넌트

### 라우팅 규칙

- App Router만 사용 (Pages Router 금지)
- `params`, `searchParams`는 반드시 `await`로 처리 (Next.js 15 비동기 API)
- Server Component 우선, `'use client'`는 상호작용이 필요한 경우에만 사용

## 코딩 컨벤션

- 파일명: `kebab-case` (예: `login-form.tsx`)
- 컴포넌트명: `PascalCase`
- import 경로: `@/` 별칭 사용 (상대 경로 금지)
- Named export 사용 (`export function Foo`), 페이지 컴포넌트만 default export

자세한 가이드: `docs/guides/` 참조 (nextjs-15.md, component-patterns.md, project-structure.md, styling-guide.md, forms-react-hook-form.md)
