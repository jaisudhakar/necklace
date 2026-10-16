import type { Metadata, Viewport } from "next";
import { Nunito, Playfair_Display } from "next/font/google";
import { CartProvider } from "@/components/CartProvider";
import Effects from "@/components/Effects";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Toast from "@/components/Toast";
import { brand } from "@/lib/brand";
import "./globals.css";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-display-serif" });
const nunito = Nunito({ subsets: ["latin"], weight: ["400", "600", "700", "800"], variable: "--font-nunito" });

export const metadata: Metadata = {
  title: {
    default: `${brand.name} · Little charms, close to heart`,
    template: `%s · ${brand.name}`,
  },
  description: brand.description,
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>💎</text></svg>",
  },
};

export const viewport: Viewport = {
  themeColor: "#fdf3f2",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${nunito.variable}`}>
      <body>
        <CartProvider>
          <Header />
          <main>{children}</main>
          <Footer />
          <Toast />
          <Effects />
        </CartProvider>
      </body>
    </html>
  );
}
