"use client";

import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "@/src/themes/theme"

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
