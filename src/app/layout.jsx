
import { Toaster } from "@/elements/toaster";
import { Provider } from "../elements/provider";
import { Header } from "../elements/header";
import "./globals.css";

export const metadata = {
  title: "Tender Match",
  description: "Tender Match - Find and match with the best tenders",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body cz-shortcut-listen="true"  >
        <Provider>
          <Header />
          {children}
          <Toaster />
        </Provider>
      </body>
    </html>
  );
}
