import ThemeRegistry from "@/components/ThemeRegistry";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Note from "@/components/Notes";
import { Box } from "@mui/material";
import { Source_Sans_3 } from "next/font/google";
import Script from "next/script";
import { headers } from "next/headers";
import { Suspense } from "react";
import "@/css/all.min.css";
//import "./globals.css";

const sourceSans3 = Source_Sans_3({ subsets: ["latin"] });

export async function generateMetadata() {
  const headersList = await headers();
  const host = headersList.get("host") || "";

  if (host.includes("jobsmatch4u.com")) {
    return {
      title: "Jobsmatch",
      description: "Find your perfect career match",
      icons: {
        icon: '/images/jm4u-favicon.png',
      },
    };
  }
  return {
    title: "Jobzesty",
    description: "Job board for digital nomads",
    icons: {
      icon: '/images/jz-favicon.png',
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <head>
        {/* <link
          rel="preload"
          href="/css/all.min.css"
          as="style"
        /> */}
      </head>
      <body className={sourceSans3.className}>
        <ThemeRegistry>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              minHeight: "100vh",
            }}
          >
            <Suspense fallback={null}>
              <Header />
            </Suspense>
            {children}
            <Note />
            <Footer />
          </Box>
        </ThemeRegistry>

        <Script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}