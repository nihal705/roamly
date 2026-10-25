import "./globals.css";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { AuthProvider } from "../providers/AuthProvider";
import { DemoBanner } from "../components/DemoBanner";

export const metadata = {
  title: "Roamly | Vacation rentals, cabins, beach houses & more",
  description:
    "Find holiday rentals, cabins, beach houses, unique homes and experiences.",
  icons: {
    icon: "/Roamly.png",
    shortcut: "/Roamly.png",
    apple: "/Roamly.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <DemoBanner />
          <Header />
          <main>{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
