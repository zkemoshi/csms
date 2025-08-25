// src/lib/ga.js

export const GA_MEASUREMENT_ID = "G-99Q918ZK42"; // your GA4 ID

// Send a pageview
export const pageview = (url) => {
  window.gtag("config", GA_MEASUREMENT_ID, {
    page_path: url,
  });
};

// Send custom event
export const event = ({ action, params }) => {
  window.gtag("event", action, params);
};