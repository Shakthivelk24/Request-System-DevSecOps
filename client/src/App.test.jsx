import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { test, expect } from "vitest";

import App from "./App";
import { UserDataProvider } from "../context/UserContext";

test("renders App", () => {
  const { container } = render(
    <UserDataProvider>
      <MemoryRouter>
        <App />
      </MemoryRouter>
    </UserDataProvider>
  );

  expect(container).toBeTruthy();
});