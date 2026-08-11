"use client";

import { useState } from "react";
import type { Edition } from "@/lib/content";
import { sectionNum } from "@/lib/sections";

interface FieldErrors {
  name?: string;
  email?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Registration({ edition }: { edition: Edition }) {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();

    const next: FieldErrors = {};
    if (!name) next.name = "Name is required.";
    if (!email) next.email = "Email is required.";
    else if (!EMAIL_RE.test(email)) next.email = "That email address does not look valid.";

    setErrors(next);
    setSubmitted(Object.keys(next).length === 0);
  }

  const statusCopy: Record<Edition["status"], string> = {
    draft: "This edition is still in draft.",
    announced: "Registration has not opened yet. Interest list only.",
    "registration-open": "Registration is open.",
    "registration-closed": "Registration is closed.",
    archived: "This edition is archived.",
  };

  return (
    <section className="section" id="register" aria-labelledby="register-h">
      <div className="container">
        <div className="section-mark">
          <span className="num">{sectionNum("register")}</span>
          <h2 id="register-h">Register</h2>
        </div>

        <div className="register-grid">
          <div>
            <p className="register-lede">
              One day in {edition.venue.city}. Utility engineers, facility
              designers and compute operators in one room.
            </p>
            <dl className="register-meta">
              <div>
                <dt>Status</dt>
                <dd>{statusCopy[edition.status]}</dd>
              </div>
              <div>
                <dt>Venue</dt>
                <dd>
                  {edition.venue.name}, {edition.venue.city}
                </dd>
              </div>
              <div>
                <dt>Contact</dt>
                <dd>
                  <a href="mailto:hello@example.org">hello@example.org</a>
                </dd>
              </div>
            </dl>
          </div>

          <form className="register-form" onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label htmlFor="reg-name">Full name</label>
              <input
                id="reg-name"
                name="name"
                type="text"
                autoComplete="name"
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "reg-name-error" : undefined}
              />
              {errors.name ? (
                <p className="error" id="reg-name-error">
                  {errors.name}
                </p>
              ) : null}
            </div>

            <div className="field">
              <label htmlFor="reg-email">Email</label>
              <input
                id="reg-email"
                name="email"
                type="email"
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "reg-email-error" : undefined}
              />
              {errors.email ? (
                <p className="error" id="reg-email-error">
                  {errors.email}
                </p>
              ) : null}
            </div>

            <div className="field">
              <label htmlFor="reg-org">Organization (optional)</label>
              <input id="reg-org" name="organization" type="text" autoComplete="organization" />
            </div>

            <div className="field">
              <label htmlFor="reg-role">I work closest to</label>
              <select id="reg-role" name="role" defaultValue="grid">
                <option value="grid">The grid — utility / interconnection</option>
                <option value="facility">The facility — electrical / mechanical</option>
                <option value="compute">The compute — platform / workloads</option>
                <option value="policy">Policy, finance or ecosystem</option>
              </select>
            </div>

            <button className="btn btn-primary" type="submit">
              Join the interest list
            </button>

            {submitted ? (
              <p className="form-status" role="status">
                Details look valid — but this form is not connected to anything
                yet. Nothing was sent or stored. Registration will run through{" "}
                <a href={edition.registrationUrl}>the official registration page</a>{" "}
                once it opens.
              </p>
            ) : null}

            <p className="form-note">Validated client-side · No data leaves this page</p>
          </form>
        </div>
      </div>
    </section>
  );
}
