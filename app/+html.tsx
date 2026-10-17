import { ScrollViewStyleReset } from "expo-router/html";
import { type PropsWithChildren } from "react";

/**
 * Root HTML template for Expo Router Web.
 * Uses platform system typography and preloads Ionicons to avoid font flashes.
 */
export default function RootHtml({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />
        <meta name="description" content="Track expenses, check your budget, and review your spending with Ledgerly." />
        <meta name="theme-color" content="#E84A3F" />
        <title>Ledgerly — Expense Tracker</title>

        {/* Reset styles */}
        <ScrollViewStyleReset />

        {/* Preload vector icon font */}
        <link
          rel="preload"
          href="https://cdn.jsdelivr.net/npm/@expo/vector-icons@15.1.1/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />

        <style
          dangerouslySetInnerHTML={{
            __html: `
              /* Ensure full height and smooth text rendering */
              html, body {
                height: 100%;
                margin: 0;
                padding: 0;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
                background-color: #F8F9FD;
                font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              }
              #root {
                display: flex;
                height: 100%;
                flex: 1;
              }

              /* Default font-family for all text and form inputs */
              *, input, button, textarea, select {
                font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              }

              /* Global @font-face declarations for Ionicons (both lowercase and uppercase keys) */
              @font-face {
                font-family: 'ionicons';
                src: url('/assets/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf') format('truetype'),
                     url('https://cdn.jsdelivr.net/npm/@expo/vector-icons@15.1.1/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf') format('truetype');
                font-weight: normal;
                font-style: normal;
                font-display: swap;
              }
              @font-face {
                font-family: 'Ionicons';
                src: url('/assets/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf') format('truetype'),
                     url('https://cdn.jsdelivr.net/npm/@expo/vector-icons@15.1.1/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf') format('truetype');
                font-weight: normal;
                font-style: normal;
                font-display: swap;
              }

              /* Interactive element cursor and tap styling */
              button, [role="button"] {
                cursor: pointer;
                -webkit-tap-highlight-color: transparent;
              }
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
