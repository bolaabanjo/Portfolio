import "@once-ui-system/core/css/styles.css";
import "@once-ui-system/core/css/tokens.css";
import "@/resources/custom.css";
import "katex/dist/katex.min.css";
import { Analytics } from "@vercel/analytics/next"

import classNames from "classnames";
import {
  Background,
  Column,
  Flex,
  Meta,
  opacity,
  RevealFx,
  SpacingToken,
} from "@once-ui-system/core";
import { Footer, Header, RouteGuard, Providers } from "@/components";
import { baseURL, effects, fonts, style, dataStyle, home } from "@/resources";

import { Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
};

export async function generateMetadata() {
  return Meta.generate({
    title: home.title,
    description: home.description,
    baseURL: baseURL,
    path: home.path,
    image: home.image,
  });
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={classNames(
        fonts.heading.variable,
        fonts.body.variable,
        fonts.label.variable,
        fonts.code.variable
      )}
    >
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: `
              {
                "@context": "https://schema.org",
                "@type": "Person",
                "name": "Bola Banjo",
                "alternateName": "Bola Roy Banjo",
                "url": "https://bolabanjo.com",
                "image": "https://bolabanjo.com/images/square.png",
                "description": "Bola Banjo is the Co-Founder and CEO of Cencori Inc, a deep technology company dedicated to building infrastructure the world builds AI on.",
                "jobTitle": "Co-Founder and CEO",
                "worksFor": {
                  "@type": "Organization",
                  "name": "Cencori Inc",
                  "url": "https://cencori.com"
                },
                "birthDate": "2003-12-17",
                "sameAs": [
                  "https://x.com/bolaabanjo",
                  "https://www.linkedin.com/in/bolaabanjo",
                  "https://github.com/bolaabanjo"
                ],
                "knowsAbout": [
                  "Artificial intelligence",
                  "Systems design",
                  "Software Engineering",
                  "Mechanical Engineering",
                  "Robotics",
                  "Product strategy"
                ],
                "mainEntityOfPage": {
                  "@type": "WebPage",
                  "@id": "https://bolabanjo.com"
                },
                "contactPoint": {
                  "@type": "ContactPoint",
                  "contactType": "business",
                  "email": "mailto:hey@bolabanjo.xyz"
                }
              }
            `,
          }}
        />
        <script
          id="theme-init"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const root = document.documentElement;
                  const defaultTheme = ${JSON.stringify(style.theme)};
                  const config = ${JSON.stringify({
                    brand: style.brand,
                    accent: style.accent,
                    neutral: style.neutral,
                    solid: style.solid,
                    "solid-style": style.solidStyle,
                    border: style.border,
                    surface: style.surface,
                    transition: style.transition,
                    scaling: style.scaling,
                    "viz-style": dataStyle.variant,
                  })};
                  
                  Object.entries(config).forEach(([key, value]) => {
                    root.setAttribute('data-' + key, value);
                  });

                  const resolveTheme = (themeValue) => {
                    if (!themeValue || themeValue === 'system') {
                      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                    }
                    return themeValue;
                  };

                  const savedTheme = localStorage.getItem('data-theme');
                  if (!savedTheme && defaultTheme !== 'system') {
                    localStorage.setItem('data-theme', defaultTheme);
                  }
                  const resolvedTheme = resolveTheme(savedTheme || defaultTheme);
                  root.setAttribute('data-theme', resolvedTheme);

                  const styleKeys = Object.keys(config);
                  styleKeys.forEach(key => {
                    const value = localStorage.getItem('data-' + key);
                    if (value) {
                      root.setAttribute('data-' + key, value);
                    }
                  });
                } catch (e) {
                  console.error('Failed to initialize theme:', e);
                  document.documentElement.setAttribute('data-theme', 'light');
                }
              })();
            `,
          }}
        />
      </head>

      <body style={{
        margin: 0,
        padding: 0,
        width: "100%",
        height: "100%",
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
        backgroundColor: "var(--page-background)",
      }}>
        <Providers>
          <Column
            as="main"
            className="layout-main"
            background="page"
            fillWidth
            style={{ minHeight: "100vh" }}
            margin="0"
            padding="0"
            horizontal="center"
          >
            <RevealFx fill position="absolute">
              <Background
                mask={{
                  x: effects.mask.x,
                  y: effects.mask.y,
                  radius: effects.mask.radius,
                  cursor: effects.mask.cursor,
                }}
                gradient={{
                  display: effects.gradient.display,
                  opacity: effects.gradient.opacity as opacity,
                  x: effects.gradient.x,
                  y: effects.gradient.y,
                  width: effects.gradient.width,
                  height: effects.gradient.height,
                  tilt: effects.gradient.tilt,
                  colorStart: effects.gradient.colorStart,
                  colorEnd: effects.gradient.colorEnd,
                }}
                dots={{
                  display: effects.dots.display,
                  opacity: effects.dots.opacity as opacity,
                  size: effects.dots.size as SpacingToken,
                  color: effects.dots.color,
                }}
                grid={{
                  display: effects.grid.display,
                  opacity: effects.grid.opacity as opacity,
                  color: effects.grid.color,
                  width: effects.grid.width,
                  height: effects.grid.height,
                }}
                lines={{
                  display: effects.lines.display,
                  opacity: effects.lines.opacity as opacity,
                  size: effects.lines.size as SpacingToken,
                  thickness: effects.lines.thickness,
                  angle: effects.lines.angle,
                  color: effects.lines.color,
                }}
              />
            </RevealFx>

            <Flex fillWidth minHeight="16" s={{ hide: true }} />
            <Header />
            <Flex zIndex={0} fillWidth padding="l" horizontal="center" flex={1} className="layout-content">
              <Flex horizontal="center" fillWidth minHeight="0">
                <RouteGuard>{children}</RouteGuard>
              </Flex>
            </Flex>
            <Footer />
          </Column>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
