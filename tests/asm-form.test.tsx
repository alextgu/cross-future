// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { afterEach, expect, it, vi } from "vitest";
import AsmForm, { type AsmFieldSpec } from "../components/assembly/AsmForm";

const fields: AsmFieldSpec[] = [
  { name: "firstName", label: "First name", type: "text", required: true },
  { name: "email", label: "Email", type: "email", required: true },
];

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

function renderForm() {
  return render(
    <AsmForm
      fields={fields}
      endpoint="/api/test"
      edition="2026-assembly"
      submitLabel="Send"
      successNote="Stored"
    />
  );
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it("prevents duplicate submits while pending and resets after success", async () => {
  const pending = deferred<Response>();
  const fetchMock = vi.fn(() => pending.promise);
  vi.stubGlobal("fetch", fetchMock);
  const user = userEvent.setup();
  const { container } = renderForm();

  await user.type(screen.getByLabelText(/^First name/), "Ada");
  await user.type(screen.getByLabelText(/^Email/), "ada@example.com");
  const form = container.querySelector("form");
  expect(form).not.toBeNull();
  fireEvent.submit(form!);
  fireEvent.submit(form!);

  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(
    (screen.getByRole("button", { name: /storing/i }) as HTMLButtonElement)
      .disabled
  ).toBe(true);

  pending.resolve(
    new Response(JSON.stringify({ ok: true, id: 1 }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    })
  );
  await screen.findByText("Stored");
  expect((screen.getByLabelText(/^First name/) as HTMLInputElement).value).toBe("");
  expect((screen.getByLabelText(/^Email/) as HTMLInputElement).value).toBe("");
});

it("maps server field errors and retains entered values", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          ok: false,
          fieldErrors: { email: ["This email is already registered."] },
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    )
  );
  const user = userEvent.setup();
  renderForm();

  await user.type(screen.getByLabelText(/^First name/), "Ada");
  await user.type(screen.getByLabelText(/^Email/), "ada@example.com");
  await user.click(screen.getByRole("button", { name: /send/i }));

  await screen.findByText("This email is already registered.");
  expect(screen.getByLabelText(/^Email/).getAttribute("aria-invalid")).toBe("true");
  expect((screen.getByLabelText(/^Email/) as HTMLInputElement).value).toBe("ada@example.com");
});

it("retains entered values when the infrastructure request fails", async () => {
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
  const user = userEvent.setup();
  renderForm();

  await user.type(screen.getByLabelText(/^First name/), "Ada");
  await user.type(screen.getByLabelText(/^Email/), "ada@example.com");
  await user.click(screen.getByRole("button", { name: /send/i }));

  await waitFor(() =>
    expect(
      screen.getByText("We could not store that submission. Please try again.")
    ).toBeTruthy()
  );
  expect((screen.getByLabelText(/^First name/) as HTMLInputElement).value).toBe("Ada");
  expect((screen.getByLabelText(/^Email/) as HTMLInputElement).value).toBe("ada@example.com");
});
