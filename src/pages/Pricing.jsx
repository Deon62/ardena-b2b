import { useState } from "react";
import { Link } from "react-router-dom";
import usePageTitle from "../hooks/usePageTitle";
import SiteNav from "../components/SiteNav";
import SiteFooter from "../components/SiteFooter";
import {
  MODULES,
  RATE,
  LAUNCH_RATE,
  MINIMUM,
  CHECK_PRICE,
  monthlyFor,
  fmtKES,
} from "./pricingData";
import "./landing.css";

export default function Pricing() {
  usePageTitle("Pricing");
  const [fleetSize, setFleetSize] = useState(12);

  return (
    <div className="landing pricing-page">
      <SiteNav />

      {/* ---- Plans (white) ---- */}
      <section className="panel pricing">
        <div className="section-head">
          <h2>Simple pricing that scales with your fleet.</h2>
          <p className="section-sub">
            Every module included on every plan. KES {LAUNCH_RATE} per vehicle
            for your first 3 months, KES {RATE} after. 14 day free trial, no
            card required.
          </p>
        </div>

        <div className="plan-grid pricing-trio">
          <article className="plan-card featured">
            <span className="plan-tag">Launch price</span>
            <h3>Fleet plan</h3>
            <div className="calc">
              <div className="calc-head">
                <label htmlFor="fleet-size">How many vehicles do you run?</label>
                <strong>{fleetSize}</strong>
              </div>
              <input
                id="fleet-size"
                type="range"
                min="3"
                max="100"
                value={fleetSize}
                onChange={(e) => setFleetSize(Number(e.target.value))}
              />
              <p className="calc-price">
                KES {fmtKES(monthlyFor(fleetSize, LAUNCH_RATE))}
                <span> /month for your first 3 months</span>
              </p>
              <p className="calc-after">
                then KES {fmtKES(monthlyFor(fleetSize, RATE))} /month · cancel
                anytime
              </p>
            </div>
            <ul>
              <li>Unlimited bookings &amp; staff seats</li>
              <li>M-Pesa payment prompting included</li>
              <li>Fleet, clients, notifications &amp; reports</li>
              <li>KES {fmtKES(MINIMUM)} monthly minimum</li>
            </ul>
            <Link to="/signup" className="btn btn-primary inverse">
              Request access
            </Link>
          </article>

          <article className="plan-card">
            <h3>Renter verification</h3>
            <p className="plan-price">
              KES {CHECK_PRICE} <span>per check · pay as you go</span>
            </p>
            <ul>
              <li>ID lookup, selfie &amp; licence in one check</li>
              <li>Top up like airtime, via M-Pesa or card</li>
              <li>Credits never expire</li>
              <li>No monthly commitment</li>
            </ul>
            <Link to="/signup" className="btn btn-ghost">
              Request access
            </Link>
          </article>

          <article className="plan-card">
            <h3>Large fleets</h3>
            <p className="plan-price">
              Let&apos;s talk <span>100+ vehicles · same per-vehicle rate</span>
            </p>
            <ul>
              <li>Assisted onboarding &amp; team training</li>
              <li>Bulk import of vehicles &amp; clients</li>
              <li>Priority support</li>
              <li>Custom invoicing available</li>
            </ul>
            <Link to="/contact" className="btn btn-ghost">
              Contact sales
            </Link>
          </article>
        </div>
      </section>

      {/* ---- Everything included (black) ---- */}
      <section className="panel modules">
        <div className="section-head">
          <h2>Every module. Every plan.</h2>
          <p className="section-sub">
            No tiers, no add-ons. One subscription unlocks the whole operation.
          </p>
        </div>
        <div className="module-grid">
          {MODULES.map((m) => (
            <article className="module-card" key={m.title}>
              <span className="module-dot" />
              <h3>{m.title}</h3>
              <p>{m.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ---- Closing (white) ---- */}
      <section className="panel closing">
        <div className="closing-body">
          <h2>
            Start free.
            <br />
            Pay when it works for you.
          </h2>
          <p>14 day free trial on every account. Cancel anytime.</p>
          <div className="hero-cta">
            <Link to="/signup" className="btn btn-brand">
              Request access
            </Link>
            <Link to="/dashboard" className="btn btn-ghost">
              View live demo
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
