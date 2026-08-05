export interface HealthMetric {
  label: string;
  value: string;
  state: "Healthy" | "Watch";
}

export const healthMetrics: HealthMetric[] = [
  { label: "Active shoppers", value: "8,492", state: "Healthy" },
  { label: "New checkouts", value: "1,247", state: "Healthy" },
  { label: "Returning buyers", value: "38.4%", state: "Healthy" },
  { label: "Cart abandonment", value: "12.3%", state: "Watch" },
  { label: "Engagement", value: "82.1%", state: "Healthy" },
  { label: "Revenue", value: "NPR 4.8M", state: "Healthy" },
];
