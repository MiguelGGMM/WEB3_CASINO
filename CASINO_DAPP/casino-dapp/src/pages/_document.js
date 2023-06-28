import * as React from "react";
import Document, { Html, Head, Main, NextScript } from "next/document";

import { ServerStyleSheets } from "@material-ui/core/styles";

export default class MyDocument extends Document {
    render() {
        return (
            <Html lang="en" style={{ minHeight: "100%", position: "relative" }}>
                {/* SEO Part */}
                <Head>
                    <link rel="manifest" href="./manifest.json" />
                    <meta name="msapplication-TileColor" content="#ffffff" />
                    <meta name="msapplication-TileImage" content="./ms-icon-144x144.png" />
                    <meta name="theme-color" content="#ffffff" />
                    <link href="https://fonts.googleapis.com/css?family=Open+Sans:300,400,600,700" rel="stylesheet" />
                    <link href="/assets/css/nucleo-icons.css" rel="stylesheet" />
                    <link href="/assets/css/nucleo-svg.css" rel="stylesheet" />

                    <script src="https://kit.fontawesome.com/42d5adcbca.js" crossOrigin="anonymous"></script>
                    <link href="/assets/css/nucleo-svg.css" rel="stylesheet" />
                    <link href="/assets/css/global.css" rel="stylesheet" />
                    <link href="/assets/css/tailwind.css" rel="stylesheet" />
                    <link href="/assets/css/tailwind-output.css" rel="stylesheet" />
                    <link href="/assets/css/global-responsive.css" rel="stylesheet" />
                    <link href="/assets/css/animations.css" rel="stylesheet" />

                    <link id="pagestyle" href="/assets/css/soft-design-system.css?v=1.0.9" rel="stylesheet" />
                    <link id="pagestyle" href="/assets/css/soft-ui-dashboard.css?v=1.0.7" rel="stylesheet" />
                </Head>
                <body
                    style={{
                        height: "100%",
                        // backgroundColor: `${this.props.backgroundColor}`,
                    }}
                    className='g-sidenav-show  bg-gray-100'
                >
                    <Main />
                    <NextScript />
                    <style jsx global>{`
                        #__next {
                        height: "100%";
                        }
                    `}</style>

                    <script src="/assets/js/core/popper.min.js"></script>
                    <script src="/assets/js/core/bootstrap.min.js"></script>
                    <script src="/assets/js/plugins/perfect-scrollbar.min.js"></script>
                    <script src="/assets/js/plugins/smooth-scrollbar.min.js"></script>
                    <script src="/assets/js/plugins/chartjs.min.js"></script>
                    <script async defer src="https://buttons.github.io/buttons.js"></script>
                    <script src="/assets/js/soft-ui-dashboard.js"></script>
                </body>
            </Html>
        );
    }
}

MyDocument.getInitialProps = async (ctx) => {
    const sheets = new ServerStyleSheets();
    const originalRenderPage = ctx.renderPage;

    ctx.renderPage = () =>
        originalRenderPage({
            enhanceApp: (App) => (props) => sheets.collect(<App {...props} />),
        });

    const initialProps = await Document.getInitialProps(ctx);
    // initialProps.backgroundColor = "#152a38";
    return {
        ...initialProps,
        // Styles fragment is rendered after the app and page rendering finish.
        styles: [
            ...React.Children.toArray(initialProps.styles),
            sheets.getStyleElement(),
        ],
    };
};
