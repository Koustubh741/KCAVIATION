export const metadata = {
  title: 'AeroIntel Backend API',
  description: 'AI-Powered Aviation Intelligence Backend',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}



