import { test, expect } from "@playwright/test";

// Phase 1 통합 E2E 테스트
// 로그인 → 생성 → 공유 → 참여 응답 → 현황 확인 플로우 검증
// (Google OAuth 특성상 인증 후 단계는 미들웨어·리다이렉트·UI 렌더링 위주로 검증)

test.describe("랜딩 페이지", () => {
  test("제목과 CTA 버튼이 노출된다", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("모임");
    await expect(
      page.getByRole("link", { name: /이벤트 만들기|시작하기|만들기/ })
    ).toBeVisible();
  });

  test("헤더에 Sign in 링크가 노출된다", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Sign in" })).toBeVisible();
  });
});

test.describe("인증 페이지", () => {
  test("로그인 페이지 — Google 버튼과 이메일 입력이 렌더링된다", async ({
    page,
  }) => {
    await page.goto("/auth/login");
    await expect(page.getByText("Google로 계속하기")).toBeVisible();
    // 이메일 input (placeholder: m@example.com)
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test("이메일 없이 로그인 시도 시 에러가 표시된다", async ({ page }) => {
    await page.goto("/auth/login");
    // Login 버튼 클릭 (이메일 미입력)
    await page.getByRole("button", { name: "Login" }).click();
    // 브라우저 native validation 또는 폼 에러 확인
    const emailInput = page.locator('input[type="email"]');
    // HTML5 native validation: input:invalid 상태가 됨
    const isInvalid = await emailInput.evaluate(
      (el) => (el as HTMLInputElement).validity.valueMissing
    );
    expect(isInvalid).toBeTruthy();
  });

  test("회원가입 페이지 렌더링", async ({ page }) => {
    await page.goto("/auth/sign-up");
    await expect(page.getByText("Create a new account")).toBeVisible();
  });

  test("회원가입 페이지에 Google 버튼이 있다", async ({ page }) => {
    await page.goto("/auth/sign-up");
    await expect(page.getByText("Google로 계속하기")).toBeVisible();
  });
});

test.describe("미들웨어 — 인증 보호 라우트", () => {
  test("/dashboard → /auth/login 리다이렉트", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test("/events/new → /auth/login 리다이렉트", async ({ page }) => {
    await page.goto("/events/new");
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test("/events/[id]/manage → /auth/login 리다이렉트", async ({ page }) => {
    await page.goto("/events/some-event-id/manage");
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test("next 파라미터가 리다이렉트 URL에 포함된다", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/next=%2Fdashboard/);
  });
});

test.describe("이벤트 상세 페이지 — 공개 접근", () => {
  test("비로그인 상태에서 접근 가능하다 (로그인 리다이렉트 없음)", async ({
    page,
  }) => {
    await page.goto("/events/test-fake-uuid-1234");
    await expect(page).not.toHaveURL(/\/auth\/login/);
  });

  test("존재하지 않는 이벤트 ID → 404 콘텐츠 렌더링", async ({ page }) => {
    await page.goto("/events/test-fake-uuid-1234");
    const content = await page.content();
    // Next.js notFound() → "This page could not be found" 또는 커스텀 not-found
    expect(
      content.includes("404") ||
        content.includes("not-found") ||
        content.includes("찾을 수") ||
        content.includes("없습니다") ||
        content.includes("could not be found")
    ).toBeTruthy();
  });
});

test.describe("로그인 후 리다이렉트 — next 파라미터 보존", () => {
  test("로그인 페이지에 next 파라미터가 있을 때 URL이 유지된다", async ({
    page,
  }) => {
    await page.goto("/auth/login?next=/dashboard");
    // 페이지가 로드되고 next 파라미터가 URL에 유지됨 (인코딩 여부 무관)
    await expect(page).toHaveURL(/next=.*dashboard/);
    // 로그인 폼이 렌더링됨
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });
});

test.describe("404 페이지", () => {
  test("존재하지 않는 라우트에서 404 컨텐츠가 노출된다", async ({ page }) => {
    await page.goto("/this-page-does-not-exist-xyz");
    // Next.js dev 모드에서는 HTTP 200 + not-found 콘텐츠 렌더링
    const content = await page.content();
    expect(
      content.includes("404") ||
        content.includes("This page could not be found") ||
        content.includes("not-found")
    ).toBeTruthy();
  });
});
