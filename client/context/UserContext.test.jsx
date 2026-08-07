import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import axios from "axios";

import {
  UserDataProvider,
  userDataContext,
} from "./UserContext";
import { useContext } from "react";

// Mock axios
vi.mock("axios", () => ({
  default: {
    defaults: {
      baseURL: "/api",
    },
    get: vi.fn(),
  },
}));

// Consumer component
function TestComponent() {
  const { axios } = useContext(userDataContext);

  return (
    <div>
      <span data-testid="provider">Provider Loaded</span>
      <span data-testid="baseurl">{axios.defaults.baseURL}</span>
    </div>
  );
}

describe("UserDataProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders children", () => {
    axios.get.mockResolvedValue({
      data: {},
    });

    const { getByTestId } = render(
      <UserDataProvider>
        <TestComponent />
      </UserDataProvider>
    );

    expect(getByTestId("provider")).toBeInTheDocument();
  });

  test("provides axios through context", () => {
    axios.get.mockResolvedValue({
      data: {},
    });

    const { getByTestId } = render(
      <UserDataProvider>
        <TestComponent />
      </UserDataProvider>
    );

    expect(getByTestId("baseurl").textContent).toBe(
      "/api"
    );
  });

  test("fetches current user on mount", async () => {
    axios.get.mockResolvedValue({
      data: {
        username: "Shakthi",
      },
    });

    render(
      <UserDataProvider>
        <TestComponent />
      </UserDataProvider>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        "/api/requests/current",
        {
          withCredentials: true,
        }
      );
    });
  });

  test("handles API error gracefully", async () => {
    const errorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    axios.get.mockRejectedValue(new Error("API Error"));

    render(
      <UserDataProvider>
        <TestComponent />
      </UserDataProvider>
    );

    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalled();
    });

    errorSpy.mockRestore();
  });
});