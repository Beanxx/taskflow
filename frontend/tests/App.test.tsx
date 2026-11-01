import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../src/App";

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );

describe("App 라우팅", () => {
  test("홈에 회원가입, 로그인 링크가 있다", () => {
    renderAt("/");
    expect(screen.getByRole("link", { name: "회원가입" })).toHaveAttribute("href", "/signup");
    expect(screen.getByRole("link", { name: "로그인" })).toHaveAttribute("href", "/login");
  });

  test("홈에서 로그인 링크를 누르면 로그인 페이지로 이동한다", () => {
    renderAt("/");
    fireEvent.click(screen.getByRole("link", { name: "로그인" }));
    expect(screen.getByLabelText("이메일")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "로그인" })).toBeInTheDocument();
  });

  test("회원가입 페이지에 비밀번호 확인 입력이 있다", () => {
    renderAt("/signup");
    expect(screen.getByLabelText("비밀번호 확인")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "회원가입" })).toBeInTheDocument();
  });

  test("회원가입에서 비밀번호가 다르면 에러를 표시하고 onSignup을 부르지 않는다", () => {
    renderAt("/signup");
    fireEvent.change(screen.getByLabelText("이메일"), { target: { value: "a@b.co" } });
    fireEvent.change(screen.getByLabelText("비밀번호"), { target: { value: "password123" } });
    fireEvent.change(screen.getByLabelText("비밀번호 확인"), { target: { value: "different123" } });
    fireEvent.click(screen.getByRole("button", { name: "회원가입" }));
    expect(screen.getByText("비밀번호가 일치하지 않습니다.")).toBeInTheDocument();
  });
});
