import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi, describe, test, expect, beforeEach } from "vitest";

import Register from "./Register";
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

describe("Register Component", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockPost.mockClear();
    vi.restoreAllMocks();
  });

  test("renders register form", () => {
    render(
      <userDataContext.Provider value={{ axios: { post: mockPost } }}>
        <MemoryRouter>
          <Register />
        </MemoryRouter>
      </userDataContext.Provider>
    );

    expect(
    screen.getByRole("heading", { name: /register/i })
).toBeInTheDocument();

expect(
    screen.getByRole("button", { name: /register/i })
).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Username")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /register/i })
    ).toBeInTheDocument();
  });

  test("updates form fields", () => {
    render(
      <userDataContext.Provider value={{ axios: { post: mockPost } }}>
        <MemoryRouter>
          <Register />
        </MemoryRouter>
      </userDataContext.Provider>
    );

    const username = screen.getByPlaceholderText("Username");
    const email = screen.getByPlaceholderText("Email");
    const password = screen.getByPlaceholderText("Password");

    fireEvent.change(username, {
      target: { value: "john" },
    });

    fireEvent.change(email, {
      target: { value: "john@test.com" },
    });

    fireEvent.change(password, {
      target: { value: "password123" },
    });

    expect(username.value).toBe("john");
    expect(email.value).toBe("john@test.com");
    expect(password.value).toBe("password123");
  });

  test("registers successfully", async () => {
    mockPost.mockResolvedValue({});

    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    render(
      <userDataContext.Provider value={{ axios: { post: mockPost } }}>
        <MemoryRouter>
          <Register />
        </MemoryRouter>
      </userDataContext.Provider>
    );

    fireEvent.change(screen.getByPlaceholderText("Username"), {
      target: { value: "john" },
    });

    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "john@test.com" },
    });

    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /register/i }));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith(
        "/api/users/register",
        {
          username: "john",
          email: "john@test.com",
          password: "password123",
        },
        {
          withCredentials: true,
        }
      );

      expect(alertSpy).toHaveBeenCalledWith("Registration Successful");
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });

  test("shows alert when registration fails", async () => {
    mockPost.mockRejectedValue(new Error("Registration Failed"));

    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    render(
      <userDataContext.Provider value={{ axios: { post: mockPost } }}>
        <MemoryRouter>
          <Register />
        </MemoryRouter>
      </userDataContext.Provider>
    );

    fireEvent.change(screen.getByPlaceholderText("Username"), {
      target: { value: "john" },
    });

    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "john@test.com" },
    });

    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /register/i }));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith("Registration Failed");
    });
  });

  test("contains login link", () => {
    render(
      <userDataContext.Provider value={{ axios: { post: mockPost } }}>
        <MemoryRouter>
          <Register />
        </MemoryRouter>
      </userDataContext.Provider>
    );

    const loginLink = screen.getByRole("link", { name: /login/i });

    expect(loginLink).toBeInTheDocument();
    expect(loginLink.getAttribute("href")).toBe("/");
  });
});