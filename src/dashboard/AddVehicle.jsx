import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { addVehicle, getVehicle, formatDateInput } from "./fleetStore";
import Dropdown from "../components/Dropdown";
import DatePicker from "./DatePicker";
import { todayISO } from "./bookingsStore";
import { toast } from "./toastStore";
import "./fleet.css";

const CATEGORIES = ["SUV", "Saloon", "Hatchback", "Van", "Pickup"];

export default function AddVehicle() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [cat, setCat] = useState("SUV");
  const [vStatus, setVStatus] = useState("Available");
  const [ins, setIns] = useState("");
  const [inspection, setInspection] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    const plate = f.get("plate").trim().toUpperCase();
    const stay = e.nativeEvent.submitter?.name === "again";

    if (getVehicle(plate)) {
      setError(`A vehicle with plate ${plate} is already in your fleet.`);
      return;
    }
    if (!ins) {
      setError("Pick the insurance expiry date.");
      return;
    }

    addVehicle({
      name: f.get("name").trim(),
      plate,
      cat: f.get("cat"),
      rate: Number(f.get("rate")),
      status: f.get("status"),
      ins: formatDateInput(f.get("ins")),
      inspection: formatDateInput(f.get("inspection")),
      added: "3 Jul 2026",
      notes: f.get("notes").trim(),
    });

    toast(`${plate} added to your fleet.`);
    if (stay) {
      setError("");
      form.reset();
      setCat("SUV");
      setVStatus("Available");
      setIns("");
      setInspection("");
      return;
    }
    navigate("/dashboard/fleet");
  }

  return (
    <>
      <header className="head-card">
        <div className="head-left">
          <Link to="/dashboard/fleet" className="back-link" aria-label="Back to fleet">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="head-titles">
            <h1>Add vehicle</h1>
            <p>Register a vehicle to make it bookable.</p>
          </div>
        </div>
      </header>

      <div className="details-grid">
        <form id="add-vehicle-form" className="panel-card" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="v-name">Make &amp; model</label>
              <input id="v-name" name="name" type="text" placeholder="Toyota Prado" required />
            </div>
            <div className="field">
              <label htmlFor="v-plate">Number plate</label>
              <input id="v-plate" name="plate" type="text" placeholder="KDL 482A" required />
            </div>
            <div className="field">
              <label htmlFor="v-cat">Category</label>
              <Dropdown
                id="v-cat"
                name="cat"
                value={cat}
                onChange={setCat}
                options={CATEGORIES}
              />
            </div>
            <div className="field">
              <label htmlFor="v-rate">Day rate (KES)</label>
              <input id="v-rate" name="rate" type="number" min="0" step="100" placeholder="9,500" required />
            </div>
            <div className="field">
              <label htmlFor="v-ins">Insurance expiry</label>
              <DatePicker
                id="v-ins"
                name="ins"
                value={ins}
                onChange={setIns}
                minDate={todayISO()}
                placeholder="Pick the expiry date"
              />
            </div>
            <div className="field">
              <label htmlFor="v-inspection">Inspection due</label>
              <DatePicker
                id="v-inspection"
                name="inspection"
                value={inspection}
                onChange={setInspection}
                minDate={todayISO()}
                placeholder="Optional"
              />
            </div>
            <div className="field">
              <label htmlFor="v-status">Status</label>
              <Dropdown
                id="v-status"
                name="status"
                value={vStatus}
                onChange={setVStatus}
                options={["Available", "In maintenance"]}
              />
            </div>
            <div className="field form-full">
              <label htmlFor="v-notes">Notes</label>
              <textarea id="v-notes" name="notes" rows="3" placeholder="Anything your team should know about this vehicle" />
            </div>
          </div>

          <div className="upload-box" aria-disabled="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
            Vehicle photos coming soon
          </div>

          {error && <p className="form-error">{error}</p>}
        </form>

        <aside className="details-side">
          <section className="panel-card">
            <header className="card-head">
              <h2>Actions</h2>
              <p>Save this vehicle or discard it</p>
            </header>
            <div className="action-stack">
              <button type="submit" form="add-vehicle-form" className="btn btn-primary">
                Add to fleet
              </button>
              <button type="submit" form="add-vehicle-form" name="again" className="btn btn-ghost">
                Save &amp; add another
              </button>
              <Link to="/dashboard/fleet" className="btn btn-ghost">
                Cancel
              </Link>
            </div>
            <p className="action-hint">
              New vehicles are bookable straight away unless you set them to
              maintenance.
            </p>
          </section>
        </aside>
      </div>
    </>
  );
}
