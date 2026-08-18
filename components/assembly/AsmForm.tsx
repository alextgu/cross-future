"use client";

import { useId, useState } from "react";
import AsmButton from "./AsmButton";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface AsmFieldSpec {
  name: string;
  label: string;
  type: "text" | "email" | "select" | "textarea";
  required?: boolean;
  autoComplete?: string;
  options?: string[];
  /** Half-width on wide viewports. */
  half?: boolean;
}

/**
 * One form engine for both the registration and the contact form.
 *
 * It validates on submit, moves focus to the first invalid field, and then
 * says plainly that nothing was sent. That last part is deliberate and
 * matches the rest of the repo: a form that silently does nothing is worse
 * than no form, so the success state tells the truth and hands the visitor
 * the route that actually works.
 */
export default function AsmForm({
  fields,
  endpoint,
  edition,
  submitLabel,
  successNote,
  tone = "deep",
}: {
  fields: AsmFieldSpec[];
  endpoint: string;
  edition: string;
  submitLabel: string;
  successNote: React.ReactNode;
  tone?: "deep" | "plain";
}) {
  const uid = useId();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [serverMessage, setServerMessage] = useState("");

  const fieldId = (name: string) => `${uid}-${name}`;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const next: Record<string, string> = {};

    for (const field of fields) {
      const value = String(data.get(field.name) ?? "").trim();
      if (field.required && !value) {
        next[field.name] = `${field.label} is required.`;
      } else if (field.type === "email" && value && !EMAIL_RE.test(value)) {
        next[field.name] = "That email address does not look valid.";
      }
    }

    setErrors(next);
    const ok = Object.keys(next).length === 0;

    if (!ok) {
      setStatus("error");
      setServerMessage("Check the highlighted fields and try again.");
      const first = fields.find((f) => next[f.name]);
      if (first) form.querySelector<HTMLElement>(`#${CSS.escape(fieldId(first.name))}`)?.focus();
      return;
    }

    setStatus("submitting");
    setServerMessage("");

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          edition,
          ...Object.fromEntries(
            fields.map((field) => [field.name, String(data.get(field.name) ?? "")])
          ),
        }),
      });
      const result = (await response.json().catch(() => null)) as
        | {
            ok?: boolean;
            fieldErrors?: Record<string, string[]>;
            message?: string;
          }
        | null;

      if (!response.ok || !result?.ok) {
        const returnedErrors = Object.fromEntries(
          Object.entries(result?.fieldErrors ?? {}).flatMap(([name, messages]) =>
            messages?.[0] ? [[name, messages[0]]] : []
          )
        );
        setErrors(returnedErrors);
        setStatus("error");
        setServerMessage(
          result?.message ?? "We could not store that submission. Please try again."
        );
        const first = fields.find((field) => returnedErrors[field.name]);
        if (first) {
          form
            .querySelector<HTMLElement>(`#${CSS.escape(fieldId(first.name))}`)
            ?.focus();
        }
        return;
      }

      form.reset();
      setErrors({});
      setStatus("success");
    } catch {
      setStatus("error");
      setServerMessage("We could not store that submission. Please try again.");
    }
  }

  return (
    <form
      className="asm-form"
      onSubmit={handleSubmit}
      noValidate
      aria-busy={status === "submitting"}
    >
      <div
        className="asm-row"
        style={{ ["--cols" as string]: 2, ["--cols-md" as string]: 1 }}
      >
        {fields
          .filter((f) => f.half)
          .map((field) => (
            <Field
              key={field.name}
              field={field}
              id={fieldId(field.name)}
              error={errors[field.name]}
            />
          ))}
      </div>

      {fields
        .filter((f) => !f.half)
        .map((field) => (
          <Field
            key={field.name}
            field={field}
            id={fieldId(field.name)}
            error={errors[field.name]}
          />
        ))}

      <div style={{ marginTop: 6 }}>
        <AsmButton
          type="submit"
          tone={tone === "deep" ? "inverse" : "accent"}
          disabled={status === "submitting"}
        >
          {status === "submitting" ? "Storing…" : submitLabel}
        </AsmButton>
      </div>

      <p className="asm-formnote" data-state={status} role="status">
        {status === "success"
          ? successNote
          : status === "error"
            ? serverMessage
            : status === "submitting"
              ? "Saving this submission locally…"
              : "Your details are stored only after a successful response."}
      </p>
    </form>
  );
}

function Field({
  field,
  id,
  error,
}: {
  field: AsmFieldSpec;
  id: string;
  error?: string;
}) {
  const describedBy = error ? `${id}-error` : undefined;
  const shared = {
    id,
    name: field.name,
    autoComplete: field.autoComplete,
    required: Boolean(field.required),
    "aria-required": Boolean(field.required),
    "aria-invalid": Boolean(error),
    "aria-describedby": describedBy,
  } as const;

  return (
    <div className="asm-field" data-invalid={error ? "true" : undefined}>
      <label htmlFor={id}>
        {field.label}
        {field.required ? <span aria-hidden="true"> *</span> : null}
      </label>

      {field.type === "textarea" ? (
        <textarea {...shared} />
      ) : field.type === "select" ? (
        <select {...shared} defaultValue={field.options?.[0]}>
          {field.options?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input {...shared} type={field.type} />
      )}

      {error ? (
        <p className="err" id={describedBy}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
