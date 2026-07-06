import { useSyncExternalStore } from "react";
import { subscribe, getSampleData, toggleSampleData } from "./demoStore";

/* Floating preview control: flip the whole dashboard between the demo
   dataset and an empty (new-business) state. */
export default function DemoToggle() {
  const sample = useSyncExternalStore(subscribe, getSampleData);

  return (
    <div className="demo-toggle">
      <div>
        <p className="demo-toggle-title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          Sample data
        </p>
        <p className="demo-toggle-sub">
          {sample ? "Showing Acme's demo records" : "Empty, like a new business"}
        </p>
      </div>
      <label className="switch">
        <input
          type="checkbox"
          checked={sample}
          onChange={toggleSampleData}
          aria-label="Toggle sample data"
        />
        <i />
      </label>
    </div>
  );
}
