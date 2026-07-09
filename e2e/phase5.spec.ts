import { test, expect } from "@playwright/test";

// Phase 5 통합 E2E 테스트
// F013 관리자 권한 체계, F014 통계 대시보드, F015 전체 사용자 관리,
// F016 전체 이벤트 관리, F017 운영 액션(정지·강제 삭제)
// (관리자 로그인 자격 증명이 없는 환경이므로, 인증 이후 단계는
//  미들웨어·라우트 가드·UI 렌더링 위주로 검증한다)

test.describe("관리자 라우트 (F013) — 비로그인 접근 차단", () => {
  const adminRoutes = [
    { path: "/admin", label: "관리자 대시보드" },
    { path: "/admin/users", label: "사용자 관리" },
    { path: "/admin/events", label: "이벤트 관리" },
  ];

  for (const route of adminRoutes) {
    test(`${route.label} — 비로그인 시 /auth/login 리다이렉트`, async ({
      page,
    }) => {
      await page.goto(route.path);
      await expect(page).toHaveURL(/\/auth\/login/);
    });

    test(`${route.label} — next 파라미터가 리다이렉트 URL에 포함된다`, async ({
      page,
    }) => {
      await page.goto(route.path);
      await expect(page).toHaveURL(/next=.*admin/);
    });
  }
});

test.describe("관리자 라우트 리다이렉트 후 로그인 폼", () => {
  test("/admin 리다이렉트 후 로그인 폼이 정상 렌더링된다", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/auth\/login/);
    await expect(page.getByText("Google로 계속하기")).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });
});

test.describe("정지 계정 안내 (F017)", () => {
  test("로그인 페이지에 suspended=1 파라미터가 있으면 안내 메시지가 노출된다", async ({
    page,
  }) => {
    await page.goto("/auth/login?suspended=1");
    await expect(page.getByText("정지된 계정입니다")).toBeVisible();
  });

  test("suspended 파라미터가 없으면 안내 메시지가 노출되지 않는다", async ({
    page,
  }) => {
    await page.goto("/auth/login");
    await expect(page.getByText("정지된 계정입니다")).not.toBeVisible();
  });
});

test.describe("보안 — 관리자 화면 UI 비노출 확인", () => {
  test("비로그인 /admin 접근 시 관리자 대시보드 UI가 노출되지 않는다", async ({
    page,
  }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/auth\/login/);
    await expect(page.getByText("관리자 대시보드")).not.toBeVisible();
  });

  test("비로그인 /admin/users 접근 시 사용자 관리 UI가 노출되지 않는다", async ({
    page,
  }) => {
    await page.goto("/admin/users");
    await expect(page).toHaveURL(/\/auth\/login/);
    await expect(page.getByText("사용자 관리")).not.toBeVisible();
  });

  test("비로그인 /admin/events 접근 시 이벤트 관리 UI가 노출되지 않는다", async ({
    page,
  }) => {
    await page.goto("/admin/events");
    await expect(page).toHaveURL(/\/auth\/login/);
    await expect(page.getByText("이벤트 관리")).not.toBeVisible();
  });
});
