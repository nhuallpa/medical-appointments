import type { Metadata } from "next";
import "./globals.css";
import { AppointmentProvider } from "@/context/AppointmentContext";
import { LocaleProvider } from "@/i18n/LocaleContext";

export const metadata: Metadata = {
  title: "Medical Appointments",
  description: "Manage medical appointments",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <LocaleProvider>
          <AppointmentProvider>{children}</AppointmentProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
