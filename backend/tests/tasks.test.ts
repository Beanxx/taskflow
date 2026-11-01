import { describe, test, expect, beforeAll } from "vitest";
import app from "../src/app";

const json = { "Content-Type": "application/json" };

async function registerUser(email: string) {
  const res = await app.request("/api/auth/register", {
    method: "POST",
    headers: json,
    body: JSON.stringify({ email, password: "password123" }),
  });
  expect(res.status).toBe(201);
  const data = await res.json();
  return data.token as string;
}

async function createTask(token: string, title: string, description: string) {
  const res = await app.request("/api/tasks", {
    method: "POST",
    headers: { ...json, Authorization: `Bearer ${token}` },
    body: JSON.stringify({ title, description }),
  });
  expect(res.status).toBe(201);
  return (await res.json()).id as number;
}

describe("인증", () => {
  test("토큰 없이 접근하면 401을 반환한다", async () => {
    const res = await app.request("/api/tasks");
    expect(res.status).toBe(401);
    expect(await res.json()).toHaveProperty("error");
  });

  test("잘못된 토큰으로 접근하면 401을 반환한다", async () => {
    const res = await app.request("/api/tasks", {
      headers: { Authorization: "Bearer invalid-token" },
    });
    expect(res.status).toBe(401);
  });
});

describe("GET /api/tasks", () => {
  let authToken: string;

  beforeAll(async () => {
    // 먼저 사용자 등록 및 로그인하여 토큰을 얻습니다.
    authToken = await registerUser("test@test.com");
  });

  test("인증된 사용자가 새 태스크를 생성한다", async () => {
    const res = await app.request("/api/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        title: "새 태스크",
        description: "테스트 설명",
      }),
    });
    expect(res.status).toBe(201);
    const task = await res.json();
    expect(task.title).toBe("새 태스크");
    expect(task.status).toBe("pending");
  });

  test("제목이 없으면 400을 반환한다", async () => {
    const res = await app.request("/api/tasks", {
      method: "POST",
      headers: { ...json, Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({ description: "제목 없음" }),
    });
    expect(res.status).toBe(400);
    expect(await res.json()).toHaveProperty("error");
  });

  test("인증된 사용자가 자신의 태스크 목록을 조회한다", async () => {
    const res = await app.request("/api/tasks", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toBeInstanceOf(Array);
  });

  describe("PATCH /api/tasks/:id", () => {
    let authToken: string;
    let taskId: number;

    beforeAll(async () => {
      // 사용자 등록 및 로그인
      authToken = await registerUser("test@example.com");

      // 태스크 생성
      taskId = await createTask(authToken, "테스트 태스크", "테스트 태스크 설명");
    });

    test("인증된 사용자가 자신의 태스크 상태를 업데이트한다", async () => {
      const res = await app.request(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          status: "completed",
        }),
      });
      expect(res.status).toBe(200);
      const updatedTask = await res.json();
      expect(updatedTask.status).toBe("completed");
    });

    test("허용되지 않는 상태 값이면 400을 반환한다", async () => {
      const res = await app.request(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { ...json, Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ status: "done" }),
      });
      expect(res.status).toBe(400);
    });
  });
});

describe("DELETE /api/tasks/:id", () => {
  let authToken: string;
  let taskId: number;

  beforeAll(async () => {
    // 사용자 등록 및 로그인
    authToken = await registerUser("delete@example.com");

    // 태스크 생성
    taskId = await createTask(authToken, "삭제할 태스크", "삭제할 태스크 설명");
  });

  test("인증된 사용자가 자신의 태스크를 삭제한다", async () => {
    const res = await app.request(`/api/tasks/${taskId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    expect(res.status).toBe(204);
  });

  test("이미 삭제된 태스크는 404를 반환한다", async () => {
    const res = await app.request(`/api/tasks/${taskId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${authToken}` },
    });
    expect(res.status).toBe(404);
  });
});

describe("다른 사용자의 태스크 접근", () => {
  let ownerToken: string;
  let otherToken: string;
  let taskId: number;

  beforeAll(async () => {
    ownerToken = await registerUser("owner@example.com");
    otherToken = await registerUser("other@example.com");
    taskId = await createTask(ownerToken, "소유자의 태스크", "비공개");
  });

  test("목록에 다른 사용자의 태스크가 보이지 않는다", async () => {
    const res = await app.request("/api/tasks", {
      headers: { Authorization: `Bearer ${otherToken}` },
    });
    expect(await res.json()).toEqual([]);
  });

  test("다른 사용자의 태스크를 수정하면 404를 반환한다", async () => {
    const res = await app.request(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { ...json, Authorization: `Bearer ${otherToken}` },
      body: JSON.stringify({ status: "completed" }),
    });
    expect(res.status).toBe(404);
  });

  test("다른 사용자의 태스크를 삭제하면 404를 반환하고 태스크는 유지된다", async () => {
    const res = await app.request(`/api/tasks/${taskId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${otherToken}` },
    });
    expect(res.status).toBe(404);

    const list = await app.request("/api/tasks", {
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    expect(await list.json()).toHaveLength(1);
  });
});
