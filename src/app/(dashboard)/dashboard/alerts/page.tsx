import { getSession } from "@/lib/auth/session";
import { getAlertPreference } from "@/lib/db/alert-preferences";
import { AlertsSettings } from "@/components/dashboard/alerts-settings";

export const metadata = { title: "Alerts" };

export default async function DashboardAlertsPage() {
  const session = await getSession();
  if (!session) return null;
  const preference = await getAlertPreference(session.userId);

  return <AlertsSettings initialEnabled={preference.emailEnabled} />;
}
