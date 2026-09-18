import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import Navbar from "./Navbar";

vi.mock("../hooks/useAuth", () => ({
  useAuth: () => ({
    user: null,
    logout: vi.fn(),
  }),
}));

describe("Navbar", () => {
  it("renders navigation links and the app name", () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>,
    );

    expect(screen.getByText("Policy Claims Tracker")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Dashboard" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Claims" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Policies" })).toBeInTheDocument();
  });
});
