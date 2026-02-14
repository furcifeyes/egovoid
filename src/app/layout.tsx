export const metadata = {
  title: 'EgoVoid',
  description: 'Il tuo io è un mito da decostruire',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  )
}
