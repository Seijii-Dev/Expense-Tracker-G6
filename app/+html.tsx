import { ScrollViewStyleReset } from "expo-router/html";
import { type PropsWithChildren } from "react";

/**
 * Root HTML template for Expo Router Web.
 * Injects required font-face definitions and preloads so vector icon glyphs
 * render with 100% fidelity without missing glyph boxes or system font fallbacks.
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
        <meta name="description" content="Ledgerly — Smart Spending & Savings Tracker" />
        <meta name="theme-color" content="#18362D" />
        <title>Ledgerly — Smart Spending & Savings Tracker</title>

        {/* Reset styles */}
        <ScrollViewStyleReset />

        {/* Preload vector icon font to prevent FOUC / missing glyphs on Web */}
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
                background-color: #F8FAF9;
              }
              #root {
                display: flex;
                height: 100%;
                flex: 1;
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

              /* Smooth transition for interactive elements on web */
              button, [role="button"] {
                transition: transform 0.15s ease, opacity 0.15s ease;
              }
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
