import type { Metadata } from "next";
import "./globals.css";
import { AppointmentProvider } from "@/context/AppointmentContext";

export const metadata: Metadata = {
  title: "Medical Appointments",
  description: "Manage medical appointments",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppointmentProvider>{children}</AppointmentProvider>
      </body>
    </html>
  );
}
