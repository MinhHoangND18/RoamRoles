import ThemeRegistry from "@/components/ThemeRegistry";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Note from "@/components/Notes";
import { Box } from "@mui/material";
import { Source_Sans_3 } from "next/font/google";
const sourceSans3 = Source_Sans_3({ subsets: ["latin"] });
import Script from "next/script";

export const metadata = {
  title: "RoamRoles",
  description: "Job board for digital nomads",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className={sourceSans3.className}>
        <ThemeRegistry>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              minHeight: "100vh",
            }}
          >
            <Header />

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