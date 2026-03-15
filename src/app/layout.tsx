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
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet" />
        <style>{`
          *, *::before, *::after {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          html, body {
            width: 100%;
            min-height: 100%;
            background-color: #000000;
            overflow-x: hidden;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          :root {
            --violet: #8b5cf6;
            --violet-dim: #6d28d9;
            --violet-glow: rgba(139, 92, 246, 0.15);
            --violet-border: rgba(139, 92, 246, 0.4);
            --text-primary: #f0e6ff;
            --text-dim: #9ca3af;
            --bg-card: rgba(15, 10, 25, 0.95);
            --bg-input: rgba(20, 12, 35, 0.9);
            --font-display: 'Cinzel', serif;
            --font-body: 'Crimson Text', serif;
          }
          ::selection {
            background: var(--violet);
            color: white;
          }
          ::-webkit-scrollbar {
            width: 4px;
          }
          ::-webkit-scrollbar-track {
            background: #000;
          }
          ::-webkit-scrollbar-thumb {
            background: var(--violet-dim);
            border-radius: 2px;
          }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  )
}
