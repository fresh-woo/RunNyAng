import React from 'react';
import './EventBanner.css';

interface EventBannerProps {
  message: string | null;
}

export const EventBanner: React.FC<EventBannerProps> = ({ message }) => {
  if (!message) return null;
  return (
    <div className="widget-event-banner" role="status" aria-live="polite" key={message}>
      <span className="event-banner-badge">EVENT</span>
      <span className="event-banner-text">{message}</span>
    </div>
  );
};
