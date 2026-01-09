import ThemeRegistry from '@/components/ThemeRegistry';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Note from '@/components/Notes';
import { Box } from '@mui/material';
import { Source_Sans_3 } from 'next/font/google';

const sourceSans3 = Source_Sans_3({ subsets: ['latin'] });

export const metadata = {
  title: 'RoamRoles',
  description: 'Job board for digital nomads',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className={sourceSans3.className}>
        <ThemeRegistry>
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />
            
            {children} 
            
            <Note />
            <Footer />
          </Box>
        </ThemeRegistry>
      </body>
    </html>
  );
}
