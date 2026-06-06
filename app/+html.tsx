import { ScrollViewStyleReset } from 'expo-router/html'
import { PropsWithChildren } from 'react'

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <title>May Low A Kyway Pay</title>
        <meta charSet="utf-8" />
        <meta content="width=device-width, initial-scale=1, viewport-fit=cover" name="viewport" />
        <meta content="#009688" name="theme-color" />
        <meta content="yes" name="apple-mobile-web-app-capable" />
        <meta content="default" name="apple-mobile-web-app-status-bar-style" />
        <meta content="MLAKP" name="apple-mobile-web-app-title" />
        <meta content="yes" name="mobile-web-app-capable" />
        <meta
          content="Split group expenses, track balances, and settle payments with your private groups."
          name="description"
        />
        <link href="/apple-touch-icon.png" rel="apple-touch-icon" />
        <link href="/site.webmanifest" rel="manifest" />
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  )
}
