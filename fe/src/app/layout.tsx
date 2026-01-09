import Header from '@/src/components/Header';
import Footer from '@/src/components/Footer';
import Note from '@/src/components/Notes';
import { Box } from '@mui/material';
import { Source_Sans_3 } from 'next/font/google'

const sourceSans3 = Source_Sans_3({ subsets: ['latin'] })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Header />
          
          <Box component="main" sx={{ py: 5 }}>
            {children}
          </Box>
          <Note/>
          <Footer />
        </Box>
      </body>
    </html>
  );
}