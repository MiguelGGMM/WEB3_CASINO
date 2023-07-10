import * as React from 'react'
import Document, { Html, Head, Main, NextScript } from 'next/document'
import { ServerStyleSheets } from '@material-ui/core/styles'

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="en" style={{ minHeight: '100%', position: 'relative' }}>
        {/* SEO Part */}
        <Head>
          <link rel="manifest" href="./manifest.json" />
          <meta name="msapplication-TileColor" content="#ffffff" />
          <meta
            name="msapplication-TileImage"
            content="./ms-icon-144x144.png"
          />
          <meta name="theme-color" content="#ffffff" />
          <link
            href="https://fonts.googleapis.com/css?family=Open+Sans:300,400,600,700&display=optional"
            rel="stylesheet"
          />

          {/* https://web.dev/efficiently-load-third-party-javascript/ */}
          <script
            async
            src="https://kit.fontawesome.com/42d5adcbca.js"
            crossOrigin="anonymous"
          ></script>
        </Head>

        <body
          style={{
            height: '100%',
            // backgroundColor: `${this.props.backgroundColor}`,
          }}
          className="g-sidenav-show  bg-gray-100"
        >
          <Main />
          <NextScript />
          {/* <style jsx global>{`
                        #__next {
                        height: "100%";
                        }
                    `}</style> */}

          <script async src="/assets/js/core/popper.min.js"></script>
          <script async src="/assets/js/core/bootstrap.min.js"></script>
          <script
            async
            src="/assets/js/plugins/perfect-scrollbar.min.js"
          ></script>
          <script
            async
            src="/assets/js/plugins/smooth-scrollbar.min.js"
          ></script>
          <script async src="/assets/js/plugins/chartjs.min.js"></script>
          <script async src="https://buttons.github.io/buttons.js"></script>
          <script async src="/assets/js/soft-ui-dashboard.js"></script>
        </body>
      </Html>
    )
  }
}

MyDocument.getInitialProps = async (ctx) => {
  const sheets = new ServerStyleSheets()
  const originalRenderPage = ctx.renderPage

  ctx.renderPage = () =>
    originalRenderPage({
      enhanceApp: (App) => (props) => sheets.collect(<App {...props} />),
    })

  const initialProps = await Document.getInitialProps(ctx)
  // initialProps.backgroundColor = "#152a38";
  return {
    ...initialProps,
    // Styles fragment is rendered after the app and page rendering finish.
    styles: [
      ...React.Children.toArray(initialProps.styles),
      sheets.getStyleElement(),
    ],
  }
}
