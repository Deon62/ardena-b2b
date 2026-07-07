import { useState } from "react";
import { Link } from "react-router-dom";
import useReveal from "../hooks/useReveal";
import {
  RATE,
  LAUNCH_RATE,
  MINIMUM,
  CHECK_PRICE,
  monthlyFor,
  fmtKES,
} from "../pages/pricingData";

/* The three pricing cards, shared by the landing page and /pricing
   so the plans never drift apart. */
export default function PricingPlans() {
  const ref = useReveal();
  const [fleetSize, setFleetSize] = useState(12);

  return (
    <div ref={ref} className="plan-grid pricing-trio reveal-group">
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
  );
}
