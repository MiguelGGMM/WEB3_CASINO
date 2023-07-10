import React, { useState, useEffect } from 'react'
import Head from 'next/head'

import CssBaseline from '@material-ui/core/CssBaseline'
import { ThemeProvider, makeStyles } from '@material-ui/core/styles'
import { SessionProvider } from 'next-auth/react'
import { CookiesProvider } from 'react-cookie'

// REDUX -> https://redux.js.org/introduction/getting-started
import wrapper from '../../redux/store'
import { Provider } from 'react-redux'

import { darkTheme /* lightTheme */ } from '../utils/theme'
//import Navbar from "../components/Navbar/Navbar";
//import SideMenu from "../components/SideMenu/SideMenu";
// import Notifications from "react-notify-toast";
//import { createWrapper } from "next-redux-wrapper";
import Notifications from 'react-notify-toast'
import '../utils/fonts.css'
//import { BottomNavigation, BottomNavigationAction } from "@material-ui/core";

//import { useRouter } from 'next/router'
import 'swiper/swiper.min.css'

///////////////// web3modal for new wallet connection //////////////////
import config from '../config'
import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum'
import { Web3Modal } from '@web3modal/react'
import { configureChains, createConfig, WagmiConfig } from 'wagmi'
import { arbitrum } from 'wagmi/chains'

// 1. Get projectID at https://cloud.walletconnect.com
if (!config.NEXT_PUBLIC_PROJECT_ID) {
  throw new Error('You need to provide NEXT_PUBLIC_PROJECT_ID env variable')
}
const projectId = config.NEXT_PUBLIC_PROJECT_ID

// 2. Configure wagmi client
const chains = [arbitrum]
const { publicClient } = configureChains(chains, [w3mProvider({ projectId })])
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ version: 1, chains, projectId }),
  publicClient,
})

// 3. Configure modal ethereum client
const ethereumClient = new EthereumClient(wagmiConfig, chains)
///////////////// web3modal for new wallet connection //////////////////

/* Root stylesheet */
import '@assets/css/nucleo-icons.css'
import '@assets/css/nucleo-svg.css'
import '@assets/css/global.css'
import '@assets/css/tailwind.css'
import '@assets/css/tailwind-output.css'
import '@assets/css/global-responsive.css'
import '@assets/css/animations.css'
import '@assets/css/soft-design-system.css?v=1.0.9'
import '@assets/css/soft-ui-dashboard.css?v=1.0.7'
//import '@assets/css/soft-ui-dashboard.css?v=1.0.7';

const App = ({ Component, ...rest }) => {
  const [ready, setReady] = useState(false)
  const [, /* darkMode */ setDarkMode] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [height, setHeight] = useState()
  const [width, setWidth] = useState()
  /* const [value, setValue] = React.useState(-1) */
  // const store = createStore(reducers);
  const { store, props } = wrapper.useWrappedStore(rest)
  const { pageProps } = props

  /* const router = useRouter() */
  const classes = useStyles()

  /* const backgroundColor = 'black' */

  useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector('#jss-server-side')
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles)
    }
    // Setup darkmode
    setDarkMode(
      localStorage.getItem('mode') ? parseInt(localStorage.getItem('mode')) : 0,
    )
    // Naive check for mobile
    setIsMobile(
      navigator.userAgent.match(/(iPad)|(iPhone)|(iPod)|(android)|(webOS)/i),
    )
    setHeight(window.innerHeight)
    setWidth(window.innerWidth)
    setReady(true)
  }, [])

  //   const toggleMode = () => {
  //     localStorage.setItem('mode', (1 - darkMode).toString())
  //     setDarkMode(1 - darkMode)
  //   }

  const muiTheme = darkTheme //darkMode ? lightTheme : darkTheme;

  return (
    <>
      {ready ? (
        <WagmiConfig config={wagmiConfig}>
          <React.Fragment>
            <Head>
              <title>WEB3 CASINO</title>
              <meta name="title" content="web3-casino-dapp" />
              <meta name="description" content="Dashboard App" />

              <meta httpEquiv="cache-control" content="no-cache" />
              <meta httpEquiv="expires" content="0" />
              <meta httpEquiv="pragma" content="no-cache" />

              {/* <meta property="og:type" content="website" />
                            <meta property="og:title" content="web3-casino-dapp" />
                            <meta property="og:description" content="Dashboard App" />
                            <meta property="og:url" content="" />
                            <meta property="og:image" content="" />

                            <meta property="twitter:card" content="" />
                            <meta property="twitter:title" content="" />
                            <meta property="twitter:description" content="" />
                            <meta name="twitter:site" content="" />

                            <meta property="twitter:image" content="" /> */}
              <meta
                name="viewport"
                content="minimum-scale=1, initial-scale=1, width=device-width"
              />
            </Head>
            {/* Developing mode only */}
            <React.StrictMode>
              <ThemeProvider theme={muiTheme}>
                <Notifications />
                {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
                <CssBaseline />
                {/* <div className={classes.layer} /> */}
                <div
                  className={classes.main}
                  style={{ height: width < 1280 ? height : '100%' }}
                >
                  <div className={classes.content}>
                    <Provider store={store}>
                      <SessionProvider session={pageProps && pageProps.session}>
                        <CookiesProvider>
                          <Component {...pageProps} isMobile={isMobile} />
                        </CookiesProvider>
                      </SessionProvider>
                    </Provider>
                  </div>
                </div>
              </ThemeProvider>
            </React.StrictMode>
          </React.Fragment>
        </WagmiConfig>
      ) : null}
      <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
    </>
  )
}

const useStyles = makeStyles((theme) => ({
  root: {
    width: 500,
    position: 'fixed',
    zIndex: '999',
    bottom: 0,
    padding: '0 40px',
    background: '#1b1b1b',
    [theme.breakpoints.down('md')]: {
      width: '100%',
    },
  },
  sideMenu: {
    width: '15%',
    zIndex: 2,
    padding: '25px 0',
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
  main: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    // backgroundImage: 'url("/img/background-grey.png")',
    // backgroundRepeat: "no-repeat",
    // backgroundSize: "cover",
    height: '100%',
    [theme.breakpoints.down('md')]: {
      justifyContent: 'center',
      height: '100vh',
    },
  },
  content: {
    width: '100%',
    /* zIndex: 2,
        padding: "0 15px", */
  },
  layer: {
    // backgroundColor: "rgba(2, 3, 6, 0.7)",
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
}))

export default App
//export default createWrapper().useWrappedStore(App);
