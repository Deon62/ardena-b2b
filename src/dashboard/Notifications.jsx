import { useMemo, useState, useSyncExternalStore } from "react";
import { Link } from "react-router-dom";
import {
  subscribe,
  getNotifications,
  markRead,
  markAllRead,
} from "./notificationsStore";
import "./fleet.css";
import "./bookings.css";
import "./workspace.css";

const FILTERS = ["All", "Unread", "Bookings", "Payments"];

const KIND_LABEL = {
  booking: "Booking",
  payment: "Payment",
  verification: "Verification",
  fleet: "Fleet",
  staff: "Staff",
};

/* "/dashboard/bookings/BK-2434" → "BK-2434", "/dashboard/verification" → page name */
function relatedLabel(to) {
  const seg = decodeURIComponent(to.split("/").filter(Boolean).pop());
  const pages = {
    verification: "Verification",
    staff: "Staff & roles",
    payments: "Payments",
    bookings: "Bookings",
    fleet: "Fleet",
  };
  return pages[seg] || seg;
}

const KIND_CLASS = {
  booking: "blue",
  payment: "green",
  verification: "amber",
  fleet: "amber",
  staff: "gray",
};

export default function Notifications() {
  const notifications = useSyncExternalStore(subscribe, getNotifications);
  const [filter, setFilter] = useState("All");

  const unread = notifications.filter((n) => !n.read).length;

  const filtered = useMemo(() => {
    switch (filter) {
      case "Unread":
        return notifications.filter((n) => !n.read);
      case "Bookings":
        return notifications.filter((n) => n.kind === "booking");
      case "Payments":
        return notifications.filter((n) => n.kind === "payment");
      default:
        return notifications;
    }
  }, [notifications, filter]);

  return (
    <>
      <section className="panel-card">
        <div className="fleet-toolbar">
          <div className="seg" role="group" aria-label="Filter notifications">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                className={f === filter ? "active" : ""}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="btn btn-ghost toolbar-btn"
            onClick={markAllRead}
            disabled={unread === 0}
          >
            Mark all read
          </button>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Notification</th>
              <th>Category</th>
              <th>Related to</th>
              <th>Received</th>
              <th className="actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((n) => (
              <tr key={n.id} className={n.read ? "" : "unread-row"}>
                <td>
                  <p className={n.read ? "" : "strong"}>
                    {!n.read && <i className="notif-dot" aria-label="Unread" />}
                    {n.title}
                  </p>
                  <p className="cell-sub">{n.meta}</p>
                </td>
                <td>
                  <span className={`notif-kind ${KIND_CLASS[n.kind]}`}>
                    {KIND_LABEL[n.kind]}
                  </span>
                </td>
                <td>
                  <Link className="spec-link" to={n.to} onClick={() => markRead(n.id)}>
                    {relatedLabel(n.to)}
                  </Link>
                </td>
                <td className="notif-when">{n.time}</td>
                <td className="actions-cell">
                  {!n.read && (
                    <button
                      type="button"
                      className="icon-btn"
                      onClick={() => markRead(n.id)}
                    >
                      Mark read
                    </button>
                  )}
                  <Link className="icon-btn" to={n.to} onClick={() => markRead(n.id)}>
                    Open
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="empty-block fleet-empty">
            <p>Nothing here, you're all caught up.</p>
          </div>
        )}
      </section>
    </>
  );
}
