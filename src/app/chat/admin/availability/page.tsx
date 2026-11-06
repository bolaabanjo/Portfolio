import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAvailability, type Availability } from "@/lib/booking/availability";
import { ADMIN_COOKIE, isAdminSession } from "@/lib/booking/tokens";
import { AdminAvailability } from "@/components/book/AdminAvailability";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Working hours", robots: { index: false } };

export default async function AvailabilityPage() {
  if (!isAdminSession((await cookies()).get(ADMIN_COOKIE)?.value)) redirect("/chat/admin");

  let initial: Availability;
  try {
    initial = await getAvailability({ fresh: true });
  } catch (e) {
    return (
      <p style={{ padding: 48 }}>Could not load availability: {e instanceof Error ? e.message : "unknown error"}</p>
    );
  }
  return <AdminAvailability initial={initial} />;
}
