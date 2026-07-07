import { Link } from "react-router-dom";
import usePageTitle from "../hooks/usePageTitle";
import SiteNav from "../components/SiteNav";
import SiteFooter from "../components/SiteFooter";
import PricingPlans from "../components/PricingPlans";
import { MODULES, RATE, LAUNCH_RATE } from "./pricingData";
import "./landing.css";

export default function Pricing() {
  usePageTitle("Pricing");

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

        <PricingPlans />
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
