import './globals.css';
import Navigation from './components/Navigation';

export const metadata = {
  title: 'Wellcom',
  description: 'Wellcom Company Website',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <Navigation />
        {children}
      </body>
    </html>
  );
}
