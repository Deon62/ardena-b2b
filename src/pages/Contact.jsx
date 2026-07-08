import { useState } from "react";
import SiteNav from "../components/SiteNav";
import SiteFooter from "../components/SiteFooter";
import Dropdown from "../components/Dropdown";
import usePageTitle from "../hooks/usePageTitle";
import { SOCIALS } from "../components/socials";
import "./landing.css";

export default function Contact() {
  usePageTitle("Contact");
  const [sent, setSent] = useState(false);
  const [topic, setTopic] = useState("Sales & demos");

  function handleSubmit(e) {
    e.preventDefault();
    setSent(true);
    e.target.reset();
  }

  return (
    <div className="landing contact-page">
      <SiteNav />

      {/* ---- Hero: title + description alone (white, full viewport) ---- */}
      <section className="panel contact-hero">
        <div className="contact-hero-body">
          <h1>Talk to us.</h1>
          <p>
            Whether you run five cars or five hundred, we'd love to show you
            around or help you get unstuck. We reply within one business day.
          </p>
        </div>
      </section>

      {/* ---- Email form: intro left, form right (black, full viewport) ---- */}
      <section className="panel modules form-panel" id="email">
        <div className="form-split">
          <div className="form-intro">
            <h2>Drop us an email.</h2>
            <p>
              Fill in the form and it lands straight in our inbox, no ticket
              numbers, no bots. A real person replies within one business day.
            </p>
          </div>

          <form className="contact-form form-elevated" onSubmit={handleSubmit} onChange={() => setSent(false)}>
            <div className="contact-row">
              <div className="field">
                <label htmlFor="c-name">Your name</label>
                <input id="c-name" type="text" placeholder="Wanjiku Kamau" required />
              </div>
              <div className="field">
                <label htmlFor="c-business">Business name</label>
                <input id="c-business" type="text" placeholder="Acme Car Hire" />
              </div>
            </div>
            <div className="contact-row">
              <div className="field">
                <label htmlFor="c-email">Work email</label>
                <input id="c-email" type="email" placeholder="you@business.co.ke" required />
              </div>
              <div className="field">
                <label htmlFor="c-phone">Phone</label>
                <input id="c-phone" type="tel" placeholder="0700 000 000" />
              </div>
            </div>
            <div className="field">
              <label htmlFor="c-topic">What's this about?</label>
              <Dropdown
                id="c-topic"
                value={topic}
                onChange={setTopic}
                options={["Sales & demos", "Support", "Partnerships", "Something else"]}
              />
            </div>
            <div className="field">
              <label htmlFor="c-message">Message</label>
              <textarea
                id="c-message"
                rows="4"
                placeholder="Tell us about your fleet and what you need"
                required
              />
            </div>
            <div className="contact-actions">
              <button type="submit" className="btn btn-primary">
                Send message
              </button>
              {sent && (
                <p className="sent-note" role="status">
                  Thanks, we've got it. Expect a reply within one business day.
                </p>
              )}
            </div>
          </form>
        </div>
      </section>

      {/* ---- Socials (white, full viewport) ---- */}
      <section className="panel social-panel" id="socials">
        <div className="section-head">
          <h2>Find us on socials.</h2>
          <p className="section-sub">
            Product updates, fleet-running tips and what we're building next.
          </p>
        </div>
        <div className="social-row">
          {SOCIALS.map((s) => (
            <a
              key={s.name}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              aria-label={s.name}
            >
              {s.icon}
            </a>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
