import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, test, expect, vi, beforeEach } from "vitest";

import Dashboard from "./Dashboard";
import { userDataContext } from "../../context/UserContext";

const mockNavigate = vi.fn();

const mockAxios = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
};

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("Dashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockAxios.get.mockImplementation((url) => {
      if (url === "/api/requests/sent") {
        return Promise.resolve({
          data: [
            {
              _id: "1",
              receiver: { username: "Alice" },
              message: "Hello",
              status: "pending",
            },
          ],
        });
      }

      if (url === "/api/requests/received") {
        return Promise.resolve({
          data: [
            {
              _id: "2",
              sender: { username: "Bob" },
              message: "Need approval",
              status: "pending",
            },
          ],
        });
      }

      if (url === "/api/users/logout") {
        return Promise.resolve({});
      }

      return Promise.resolve({ data: [] });
    });

    mockAxios.post.mockResolvedValue({});
    mockAxios.put.mockResolvedValue({});
  });

  const renderDashboard = () =>
    render(
      <userDataContext.Provider value={{ axios: mockAxios }}>
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      </userDataContext.Provider>
    );

  test("renders dashboard", async () => {
    renderDashboard();

    expect(
      screen.getByText("Request Dashboard")
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Received")).toBeInTheDocument();
      expect(screen.getByText("Sent")).toBeInTheDocument();
    });
  });

  test("loads received and sent requests", async () => {
    renderDashboard();

    expect(await screen.findByText("Bob")).toBeInTheDocument();
    expect(await screen.findByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Need approval")).toBeInTheDocument();
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  test("sends a request", async () => {
    renderDashboard();

    fireEvent.change(
      screen.getByPlaceholderText("Receiver Email"),
      {
        target: { value: "user@test.com" },
      }
    );

    fireEvent.change(
      screen.getByPlaceholderText("Message"),
      {
        target: { value: "Testing request" },
      }
    );

    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    await waitFor(() => {
      expect(mockAxios.post).toHaveBeenCalledWith(
        "/api/requests/send",
        {
          receiverEmail: "user@test.com",
          message: "Testing request",
        },
        {
          withCredentials: true,
        }
      );
    });
  });

  test("accepts a request", async () => {
    renderDashboard();

    const acceptButton = await screen.findByText("Accept");

    fireEvent.click(acceptButton);

    await waitFor(() => {
      expect(mockAxios.put).toHaveBeenCalledWith(
        "/api/requests/status/2",
        { status: "accepted" },
        { withCredentials: true }
      );
    });
  });

  test("rejects a request", async () => {
    renderDashboard();

    const rejectButton = await screen.findByText("Reject");

    fireEvent.click(rejectButton);

    await waitFor(() => {
      expect(mockAxios.put).toHaveBeenCalledWith(
        "/api/requests/status/2",
        { status: "rejected" },
        { withCredentials: true }
      );
    });
  });

  test("logout redirects to login", async () => {
    renderDashboard();

    const logoutButton = screen.getByRole("button", {
      name: "Logout",
    });

    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalledWith(
        "/api/users/logout",
        {
          withCredentials: true,
        }
      );

      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  test("redirects to login when session expires", async () => {
    mockAxios.get.mockRejectedValueOnce(new Error("Unauthorized"));

    const alertSpy = vi
      .spyOn(window, "alert")
      .mockImplementation(() => {});

    renderDashboard();

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        "Session expired. Please login."
      );

      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });
});