export const metadata = {
  title: 'EgoVoid',
  description: 'DEAL WITH YOUR PAST, ACCEPT IT FOR WHAT IT IS AND MOVE ON, OTHERWISE YOU ARE GONNA CARRY THAT WEIGHT',
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
