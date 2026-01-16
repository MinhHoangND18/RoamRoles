import "./globals.css";
import SessionWrapper from "../components/SessionWrapper";
import Script from "next/script";
import { Toaster } from 'react-hot-toast';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
      </head>
      <body>
        <SessionWrapper>
          <Toaster position="top-right" toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }} />
          {children}
        </SessionWrapper>
      </body>
    </html>
  );
}