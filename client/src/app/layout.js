// src/app/layout.js
import './globals.css';
import { ThemeProvider } from '../context/ThemeContext';
import { StudentProvider } from '../context/StudentContext';
import { AuthProvider } from '../context/AuthContext';

export const metadata = {
  title: 'Student Progress Dashboard',
  description: 'Track student Codeforces progress and activity',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <AuthProvider>
            <StudentProvider>
              {children}
            </StudentProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
