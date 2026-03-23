import './globals.css'

export const metadata = {
  title: 'My AI News',
  description: 'Personalized news aggregator',
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
