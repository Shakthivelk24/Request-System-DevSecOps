import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi, describe, test, expect, beforeEach } from "vitest";

import Login from "./Login";
import { userDataContext } from "../../context/UserContext";

const mockNavigate = vi.fn();
const mockPost = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("Login Component", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockPost.mockClear();
    vi.restoreAllMocks();
  });

  test("renders login form", () => {
    render(
      <userDataContext.Provider value={{ axios: { post: mockPost } }}>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </userDataContext.Provider>
    );

    expect(
    screen.getByRole("heading", { name: /login/i })
).toBeInTheDocument();

expect(
    screen.getByRole("button", { name: /login/i })
).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /login/i })
    ).toBeInTheDocument();
  });

  test("updates input values", () => {
    render(
      <userDataContext.Provider value={{ axios: { post: mockPost } }}>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </userDataContext.Provider>
    );

    const email = screen.getByPlaceholderText("Email");
    const password = screen.getByPlaceholderText("Password");

    fireEvent.change(email, {
      target: { value: "test@example.com" },
    });

    fireEvent.change(password, {
      target: { value: "password123" },
    });

    expect(email.value).toBe("test@example.com");
    expect(password.value).toBe("password123");
  });

  test("logs in successfully", async () => {
    mockPost.mockResolvedValue({});

    render(
      <userDataContext.Provider value={{ axios: { post: mockPost } }}>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </userDataContext.Provider>
    );

    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "test@example.com" },
    });

    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith(
        "/api/users/login",
        {
          email: "test@example.com",
          password: "password123",
        },
        {
          withCredentials: true,
        }
      );

      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });

  test("shows alert when login fails", async () => {
    mockPost.mockRejectedValue(new Error("Login Failed"));

    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    render(
      <userDataContext.Provider value={{ axios: { post: mockPost } }}>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </userDataContext.Provider>
    );

    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "test@example.com" },
    });

    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "wrongpassword" },
    });

    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith("Login Failed");
    });
  });

  test("navigates to register page", () => {
    render(
      <userDataContext.Provider value={{ axios: { post: mockPost } }}>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </userDataContext.Provider>
    );

    fireEvent.click(screen.getByText("Register"));

    expect(mockNavigate).toHaveBeenCalledWith("/register");
  });
});