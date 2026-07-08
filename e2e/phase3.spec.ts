import { test, expect } from "@playwright/test";

// Phase 3 통합 E2E 테스트
// F008 드라이버 등록, F009 탑승 신청, F010 배정 확정

test.describe("카풀 페이지 (F008~F010) — 라우트 보호", () => {
  test("비로그인 /events/[id]/carpool → /auth/login 리다이렉트", async ({
    page,
  }) => {
    await page.goto("/events/some-event-id/carpool");
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test("next 파라미터에 carpool 경로가 포함된다", async ({ page }) => {
    await page.goto("/events/some-event-id/carpool");
    await expect(page).toHaveURL(/next=.*carpool/);
  });
});

test.describe("카풀 페이지 리다이렉트 후 로그인 플로우", () => {
  test("카풀 리다이렉트 후 로그인 폼이 정상 렌더링된다", async ({ page }) => {
    await page.goto("/events/some-id/carpool");
    await expect(page).toHaveURL(/\/auth\/login/);
    await expect(page.getByText("Google로 계속하기")).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });
});

test.describe("Phase 3 보호 라우트 — next 파라미터 보존", () => {
  test("carpool next 파라미터가 URL에 유지된다", async ({ page }) => {
    await page.goto("/events/abc-123/carpool");
    await expect(page).toHaveURL(/next=.*abc-123.*carpool/);
  });
});

test.describe("전체 라우트 보호 통합 확인", () => {
  const protectedRoutes = [
    { path: "/dashboard", label: "대시보드" },
    { path: "/events/new", label: "이벤트 생성" },
    { path: "/events/test-id/manage", label: "이벤트 관리" },
    { path: "/events/test-id/settlement", label: "정산" },
    { path: "/events/test-id/carpool", label: "카풀" },
  ];

  for (const route of protectedRoutes) {
    test(`${route.label} — 비로그인 시 /auth/login 리다이렉트`, async ({
      page,
    }) => {
      await page.goto(route.path);
      await expect(page).toHaveURL(/\/auth\/login/);
    });
  }

  test("이벤트 상세 /events/[id] — 비로그인 접근 허용", async ({ page }) => {
    await page.goto("/events/public-event-id");
    await expect(page).not.toHaveURL(/\/auth\/login/);
  });
});
