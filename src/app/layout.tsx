import type { Metadata } from "next";
import { Bubblegum_Sans, Permanent_Marker } from "next/font/google";
import { storeConfig } from "@/config/store.config";
import { ToastContainer } from "@/components/ui/Toast";
import { TableProvider } from "@/context/TableContext";
import "./globals.css";

const sans = Bubblegum_Sans({
  weight: "400",
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const grunge = Permanent_Marker({
  variable: "--font-grunge",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: storeConfig.seo.defaultTitle,
    template: storeConfig.seo.titleTemplate,
  },
  description: storeConfig.seo.defaultDescription,
  openGraph: {
    title: storeConfig.seo.defaultTitle,
    description: storeConfig.seo.defaultDescription,
    url: storeConfig.url,
    siteName: storeConfig.name,
    locale: storeConfig.locale,
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${sans.variable} ${grunge.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <TableProvider>
          {children}
          <ToastContainer />
        </TableProvider>
      </body>
    </html>
  );
}

