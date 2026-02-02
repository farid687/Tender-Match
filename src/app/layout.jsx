
import { Toaster } from "@/elements/toaster";
import { Provider } from "../elements/provider";
import "./globals.css";

export const metadata = {
  title: "Tender Match",
  description: "Tender Match - Find and match with the best tenders",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body cz-shortcut-listen="true"  >
        <Provider>
          {children}
          <Toaster />
        </Provider>
      </body>
    </html>
  );
}
