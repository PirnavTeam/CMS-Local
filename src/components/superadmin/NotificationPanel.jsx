import React from "react";

function NotificationPanel({ items = [] }) {
  if (!items.length) {
    return <div className="sa-state">No notifications available.</div>;
  }

  const isRead = (item = {}) => String(item.status || "").toLowerCase() === "read";

  return (
    <div className="sa-notification-list">
      {items.map((item) => (
        <div className="sa-notification-item" key={item.id}>
          <div>
            <b>{item.title}</b>
            <p>{item.message}</p>
            <span>{item.targetUsers}</span>
          </div>
          <span className={`sa-badge ${isRead(item) ? "is-muted" : "is-active"}`}>
            {isRead(item) ? "Read" : "Unread"}
          </span>
        </div>
      ))}
    </div>
  );
}

export default NotificationPanel;

