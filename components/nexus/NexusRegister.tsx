"use client";

import { useState } from "react";
import type { Edition } from "@/lib/content";

const PASS_TYPES = ["General", "Student", "Industry"] as const;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function NexusRegister({
  edition,
  benefits,
}: {
  edition: Edition;
  benefits: string[];
}) {
  const [passType, setPassType] = useState<(typeof PASS_TYPES)[number]>("General");
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();

    const next: { name?: string; email?: string } = {};
    if (!name) next.name = "Name is required.";
    if (!email) next.email = "Email is required.";
    else if (!EMAIL_RE.test(email)) next.email = "That email address does not look valid.";

    setErrors(next);
    setSubmitted(Object.keys(next).length === 0);
  }

  return (
    <section className="nx-section" id="register" aria-labelledby="nx-register-h">
      <div className="nx-container nx-register-grid">
        <div className="nx-register-left">
          <p className="nx-seclabel">§ 05 / SUMMIT PORTAL</p>
          <h2 className="nx-h2" id="nx-register-h">
            Reserve your seat at the foundational classroom.
          </h2>
          <ol className="nx-benefits">
            {benefits.map((benefit, index) => (
              <li key={benefit.slice(0, 24)}>
                <span className="num">{String(index + 1).padStart(2, "0")}</span>
                <span>{benefit}</span>
              </li>
            ))}
          </ol>
          <div className="nx-eventgo">
            <a className="nx-btn ghost" href={edition.registrationUrl}>
              Complete registration on EventGo{" "}
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>

        <div className="nx-register-right">
          {edition.heroFigure ? (
            <div className="bg" aria-hidden="true">
              <img src={edition.heroFigure.imageUrl} alt="" width={896} height={1120} />
            </div>
          ) : null}
          <form className="nx-register-form" onSubmit={handleSubmit} noValidate>
            <span className="kicker">Express interest / No commitment</span>
            <h3>Begin your registration</h3>

            <div className="nx-field">
              <label htmlFor="nx-name">Full name</label>
              <input
                id="nx-name"
                name="name"
                type="text"
                placeholder="Ada Lovelace"
                autoComplete="name"
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "nx-name-error" : undefined}
              />
              {errors.name ? (
                <p className="error" id="nx-name-error">
                  {errors.name}
                </p>
              ) : null}
            </div>

            <div className="nx-field">
              <label htmlFor="nx-email">Email</label>
              <input
                id="nx-email"
                name="email"
                type="email"
                placeholder="ada@future.ai"
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "nx-email-error" : undefined}
              />
              {errors.email ? (
                <p className="error" id="nx-email-error">
                  {errors.email}
                </p>
              ) : null}
            </div>

            <div className="nx-field">
              <span className="nx-field label" id="nx-passtype-label">
                Pass type
              </span>
              <div
                className="nx-passtype"
                role="group"
                aria-labelledby="nx-passtype-label"
              >
                {PASS_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    aria-pressed={passType === type}
                    onClick={() => setPassType(type)}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <button className="nx-btn" type="submit">
              Express interest <span aria-hidden="true">→</span>
            </button>

            {submitted ? (
              <p className="nx-form-status" role="status">
                Looks valid ({passType.toLowerCase()} pass) — but this form is
                not connected to anything yet. Nothing was sent or stored.
                Registration runs through{" "}
                <a href={edition.registrationUrl}>EventGo</a>.
              </p>
            ) : null}

            <p className="nx-form-note">
              Validated client-side · No data leaves this page
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
