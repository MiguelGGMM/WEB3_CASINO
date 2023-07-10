import { useRef, useEffect /* useState */, useState } from 'react'
import config from '../../config'
import { notify } from 'react-notify-toast'
import { useWeb3 } from '../../hooks/useWeb3'
import {
  // ConnectButton,
  // ConnectButtonImage,
  // Container,
  MainContainer,
} from './styles'

const truncateAddress = (address) => {
  return address.slice(0, 6) + '...' + address.slice(-4)
}

export default function ConnectWallet() {
  /* const [loading, setLoading] = useState(false); */
  const {
    getAddress,
    getChainId,
    getProvider,
    /* getSigner */
    open,
    /* switchNetwork, */
    switchNetworkAsync,
    disconnect,
    /* connector,        */
    // chains,
    isConnected,
    /* pendingChainId */
  } = useWeb3()

  /* const label = isConnected ? 'Press for disconnect' : 'Press for connect' */
  const intervalSwitch = useRef()
  const reqFlag = useRef(false)
  const [address, setAddress] = useState('')

  const switchNetworkWithWarning = () => {
    setTimeout(() => {
      if (!reqFlag.current && switchNetworkAsync) {
        notify.show(
          `You need to switch your network in order to use the dapp!`,
          'custom',
          3000,
          { background: 'red', text: 'white' },
        )
        reqFlag.current = true
        switchNetworkAsync?.(config.NEXT_PUBLIC_CHAIN_ID)
          .then(() => {
            reqFlag.current = false
          })
          .catch(() => {
            reqFlag.current = false
          })
      }
    }, 1000)
  }

  useEffect(() => {
    if (intervalSwitch.current) {
      clearInterval(intervalSwitch.current)
    }
    intervalSwitch.current = setInterval(() => {
      //If not connected to our network we switch
      if (isConnected && getChainId) {
        getChainId().then((chainId) => {
          if (chainId != config.NEXT_PUBLIC_CHAIN_ID) {
            switchNetworkWithWarning()
          }
        })
      }
      //If user switches to a different network we switch again
      if (getProvider) {
        getProvider().then((provider) => {
          provider.on('chainChanged', (chainId) => {
            if (parseInt(chainId) != config.NEXT_PUBLIC_CHAIN_ID) {
              switchNetworkWithWarning()
            }
          })
        })
      }

      if (getAddress) {
        getAddress().then((_address) => {
          setAddress(_address)
        })
      }
    }, 1000)
  })

  async function onOpen() {
    /* setLoading(true); */
    await open({ route: 'ConnectWallet' })
    /* setLoading(false); */
  }

  function onClick() {
    if (isConnected) {
      disconnect()
    } else {
      onOpen()
    }
  }

  return (
    <MainContainer>
      <div
        className="button"
        href="#"
        onClick={onClick}
        title={isConnected ? 'Press for disconnect' : 'Press for connect'}
        // {signerAddress ? handleClickAddress : handleClickConnect}
        style={{ cursor: 'pointer', fontSize: '1em' }}
      >
        {isConnected && address ? truncateAddress(address) : 'CONNECT'}
      </div>
    </MainContainer>
  )
}
