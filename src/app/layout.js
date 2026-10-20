import './globals.css';
export const metadata={title:'Online Course API',description:'Online course service'};
// Fix: system fonts avoid a remote-font dependency during deployment.
export default function RootLayout({children}){return <html lang="en"><body>{children}</body></html>;}
