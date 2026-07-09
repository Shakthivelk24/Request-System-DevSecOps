import {
  requestCreatedCounter,
  approvedRequestsGauge,
  rejectedRequestsGauge,
  pendingRequestsGauge,
} from "./metrics.js";

// ============================================================
// Request Created
// ============================================================

export const recordRequestCreated = () => {
  requestCreatedCounter.inc();
};

// ============================================================
// Update Request Gauges
// ============================================================

export const updateRequestMetrics = ({
  pending = 0,
  approved = 0,
  rejected = 0,
}) => {
  pendingRequestsGauge.set(pending);
  approvedRequestsGauge.set(approved);
  rejectedRequestsGauge.set(rejected);
};