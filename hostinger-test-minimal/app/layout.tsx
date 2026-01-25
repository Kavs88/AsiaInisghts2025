export const metadata = {
  title: 'Next.js Test App',
  description: 'Minimal test app for Hostinger',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}


