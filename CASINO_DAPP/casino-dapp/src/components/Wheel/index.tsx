import React, { useState /* useRef, useCallback */ } from 'react'
import Image from 'next/image'
//import Rodal from 'rodal'; //replaced by dialogBetResult
import ResponsiveDialog from './dialogBetResult'
import Confetti from './confeti'
// import styles from './stylesModule.scss'
import { FormContainer, ButtonAction } from '../../styles/wheel'
import { /* Checkbox, FormControlLabel, */ makeStyles } from '@material-ui/core'
//import { notify } from "react-notify-toast";
import dynamic from 'next/dynamic'
import { RouletteService } from '@/src/services/RouletteService'
import { CasinoTreasuryService } from '@/src/services/CasinoTreasuryService'
import { useWeb3 } from '../../hooks/useWeb3'
import RoulettePaid from './roulettePaid'
//https://www.npmjs.com/package/react-custom-roulette#multi-spin
import { Snackbar } from '@mui/material'
import CommonService from '../../services/CommonService'
import { betType, betState, prizeType } from '../../ts/const'
import { prizeTypeText, winPrefix } from '../../ts/types'
import {
  prizeTypeKeys,
  customDollarPrizeSubtypeKeys,
} from '../../betsConfig/types'
import { ContractTransaction } from 'ethers'
import { web3Error } from '@/src/ts/types'
import contractConfig from '@/src/betsConfig/contractConfig'
import wrapper from '../../../redux/store'
import { SET_BALANCES } from '../../../redux/types/balances.types'
import getOptions from '@/src/betsConfig'

const OperationsBox = dynamic(() => import('./operationsBox'), {
  ssr: false,
})

//Images
import loadingGif from '@assets/img/spin/loading.gif'
import walletIcon from '@assets/img/icons/wallet.png'
import depositIcon from '@assets/img/icons/deposit.png'
import { Web3Provider } from '@ethersproject/providers'
//const refreshButton = "assets/img/spin/redo.png";

const ROULETTE_OPTIONS = getOptions()

const DEFAULT_DATA_PROFITS = {
  PROFITS_LEFT_TODAY: '0',
  PROFITS_LEFT_WEEK: '0',
  PROFITS_MAX_TODAY: '0',
  PROFITS_MAX_WEEK: '0',
}

const DEFAULT_DATA_BETS = {
  PENDING_BETS_USER: [] as Array<string>,
  PENDING_CLAIM_USER: [] as Array<string>,
}

const WheelLayout = (_props: any) => {
  const { store, props } = wrapper.useWrappedStore({
    USER_TOKENS: '0',
    USER_TOKENS_VALUE: '0',
    USER_TOKENS_IWALLET: '0',
    USER_TOKENS_VALUE_IWALLET: '0',
  })
  const [tokenBox /* setTokenBox */] = useState({
    name: 'Ethereum',
    symbol: '$ETH',
    depositVal: 0,
    withdrawVal: 0,
  })

  const [rouletteLoading, setRouletteLoading] = React.useState(true)
  const [modalVisible, isModalVisible] = React.useState(false)
  const [messageNode, setMessageNode]: any = React.useState(null)
  const [backgroundColorDB, setBackgroundColorDB] = React.useState('black')
  ///////////////////////////
  const [enabledConfirmButton, setEnabledConfirmButton] = React.useState(false)
  const [fireConfettiTrigger, setFireConfettiTrigger] = React.useState(false)
  // User data
  const { /* getAddress, */ getProvider, connector, isConnected } = useWeb3()
  const [dataBalances, setDataBalances] = useState({
    ...(store.getState().balances ?? props),
  })
  const [dataProfits, setDataProfits] = useState({ ...DEFAULT_DATA_PROFITS })
  const [dataBets, setDataBets] = useState({ ...DEFAULT_DATA_BETS })
  const [dataBetPaid, setDataBetPaid] = useState<null | any>(null)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    type: 'success',
  })

  // DATA LOADS AN RELOADS
  let THREAD_RELOAD_USERDATA: ReturnType<typeof setInterval> | undefined =
    undefined

  const onWin = (
    prizeText: prizeTypeKeys | customDollarPrizeSubtypeKeys,
    icon: any,
    backgroundColor: any,
  ) => {
    const pType = prizeType[prizeText as prizeTypeKeys]
    const isCustomDollarPrice =
      contractConfig.customDollarPriceEnabled.includes(
        prizeText as customDollarPrizeSubtypeKeys,
      )

    if (isCustomDollarPrice || pType != prizeType.none) {
      if (
        !isCustomDollarPrice &&
        prizeText != prizeTypeText[prizeType.freeSpin]
      ) {
        const audio = new Audio('/assets/media/sounds/winner.mp3')
        audio.play()
        setFireConfettiTrigger(true)
      }
    } else {
      const audio = new Audio('/assets/media/sounds/lose.mp3')
      audio.play()
    }

    let prize = ''
    if (pType >= 0) {
      prize = prizeTypeText[pType]
    } else {
      prize = prizeText as string
    }

    const titleMesage =
      pType != prizeType.none ? 'Congratulations!' : 'We are sorry!'
    const prefixBody = pType != prizeType.none ? winPrefix : ''

    // Win modal
    showModal(
      true,
      <div style={{ maxHeight: '120 !important' }}>
        <h1
          style={{
            fontSize: '3em',
            alignItems: 'center',
            justifyContent: 'center',
            display: 'flex',
          }}
        >
          {titleMesage}
          <img
            src={icon}
            style={{ maxHeight: 50, marginLeft: 10 }}
            alt="prizeIcon"
          />
        </h1>
        <p
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            display: 'flex',
            marginLeft: '3px',
            marginRight: '3px',
          }}
        >
          You {`${prefixBody}`}{' '}
          <span
            style={{
              fontWeight: 800,
              color: '#fff',
              marginLeft: '3px',
              marginRight: '3px',
            }}
          >{`${prize}`}</span>
          Claim your bet.
        </p>
      </div>,
      backgroundColor,
    )
    setTimeout(() => {
      setFireConfettiTrigger(false)
    }, 2000)
  }

  const showModal = (visible: any, node: any, backgroundColor: any) => {
    isModalVisible(visible)
    setMessageNode(node)
    setBackgroundColorDB(backgroundColor)
  }

  const updateRouletteVisibility = (show: boolean) => {
    setRouletteLoading(show ? false : true)
  }

  const runWithValidation = (_function: (provider: Web3Provider) => void) => {
    if (getProvider) {
      getProvider().then((provider) => {
        if (provider) {
          provider.getNetwork().then((network) => {
            CommonService.checkNetwork(network.chainId).then((validNetwork) => {
              if (!validNetwork) {
                /* return */
              } else {
                _function(provider)
              }
            })
          })
        }
      })
    }
  }

  const reloadUserDataBalances = () => {
    const ifError = (err: any) => {
      setDataBalances({ ...store.getState().balances })
      setSnackbarError(err)
      console.log(err, new Error().stack)
    }
    runWithValidation((provider: Web3Provider) => {
      // Balances data (recharge on load and after deposit/withdraw)
      Promise.all([
        CasinoTreasuryService.getTokensAmount(provider).then((userTokens) => {
          dataBalances.USER_TOKENS = (
            parseFloat(userTokens.toString()) /
            10 ** 18
          ).toFixed(5)
        }),
        CommonService.getETHValue(dataBalances.USER_TOKENS).then(
          (userTokensValue) => {
            dataBalances.USER_TOKENS_VALUE = userTokensValue.toString()
          },
        ),
        CasinoTreasuryService.getTokensAmountIWallet(provider).then(
          (userTokensIWallet) => {
            dataBalances.USER_TOKENS_IWALLET = (
              parseFloat(userTokensIWallet.toString().toString()) /
              10 ** 18
            ).toFixed(5)
          },
        ),
        CommonService.getETHValue(dataBalances.USER_TOKENS_IWALLET).then(
          (userTokensValueIWallet) => {
            dataBalances.USER_TOKENS_VALUE_IWALLET =
              userTokensValueIWallet.toString()
          },
        ),
      ])
        .then(() => {
          store.dispatch({ type: SET_BALANCES, balances: dataBalances })
          setDataBalances({ ...dataBalances })
        })
        .catch(ifError)
    })
  }

  const reloadUserDataProfits = () => {
    const ifError = (err: any) => {
      setDataProfits({ ...DEFAULT_DATA_PROFITS })
      setSnackbarError(err)
      console.log(err, new Error().stack)
    }
    runWithValidation((provider: Web3Provider) => {
      Promise.all([
        RouletteService.profitsMadeToday(provider).then((profitsLeftToday) => {
          dataProfits.PROFITS_LEFT_TODAY = Math.max(
            parseInt(profitsLeftToday),
            0,
          ).toString()
        }),
        RouletteService.profitsMadeWeek(provider).then((profitsLeftWeek) => {
          dataProfits.PROFITS_LEFT_WEEK = Math.max(
            parseInt(profitsLeftWeek),
            0,
          ).toString()
        }),
        RouletteService.profitsMaxToday(provider).then((profitsMaxToday) => {
          dataProfits.PROFITS_MAX_TODAY = profitsMaxToday.toString()
        }),
        RouletteService.profitsMaxWeek(provider).then((profitsMaxWeek) => {
          dataProfits.PROFITS_MAX_WEEK = profitsMaxWeek.toString()
        }),
      ])
        .then(() => {
          setDataProfits({ ...dataProfits })
        })
        .catch(ifError)
    })
  }

  const reloadUserDataBetsData = (_function?: () => void) => {
    const ifError = (err: any) => {
      setDataBets({ ...DEFAULT_DATA_BETS })
      setSnackbarError(err)
      console.log(err, new Error().stack)
    }
    runWithValidation((provider: Web3Provider) => {
      Promise.all([
        RouletteService.pendingBets(provider).then((pendingBetsUser) => {
          dataBets.PENDING_BETS_USER = pendingBetsUser.map((_a) =>
            _a.toString(),
          )
        }),
        RouletteService.pendingClaimBets(provider).then((pendingClaimUser) => {
          dataBets.PENDING_CLAIM_USER = pendingClaimUser.map((_a) =>
            _a.toString(),
          )
        }),
      ])
        .then(() => {
          setDataBets({ ...dataBets })
          if (_function) {
            _function()
          }
        })
        .catch(ifError)
    })
  }

  const reloadUserData = () => {
    const ifError = (err: any) => {
      setSnackbarError(err)
      console.log(err, new Error().stack)
    }
    runWithValidation((/* provider: Web3Provider */) => {
      Promise.all([
        reloadUserDataBalances(),
        reloadUserDataProfits(),
        reloadUserDataBetsData(),
      ])
        .then(() => {
          CommonService.refreshETHPriceCache()
        })
        .catch(ifError)
    })
  }

  const waitAndReload = (
    req: ContractTransaction,
    untilPendingBets = false,
    snackbarMsg = '',
  ) => {
    req.wait().then(() => {
      if (!untilPendingBets) {
        forceReload()
      } else {
        forceReloadUntilPending()
      }
      if (snackbarMsg) {
        setSnackbarSuccess(snackbarMsg)
      }
    })
  }

  const setSnackbarError = (err: web3Error | unknown) => {
    const _err: web3Error = err as any // I do not care, because all web3Error properties are nullable
    updateRouletteVisibility(false)
    setSnackbar({
      open: true,
      message: RouletteService.getErrorMessage(_err) ?? _err.toString(),
      type: 'error',
    })
    setTimeout(() => updateRouletteVisibility(true), 1000)
  }

  const setSnackbarSuccess = (msg: string, ts = 1000) => {
    updateRouletteVisibility(false)
    setSnackbar({
      open: true,
      message: msg,
      type: 'success',
    })
    setTimeout(() => updateRouletteVisibility(true), ts)
  }

  const forceReloadUntilPending = () => {
    if (THREAD_RELOAD_USERDATA) {
      clearInterval(THREAD_RELOAD_USERDATA)
    }
    THREAD_RELOAD_USERDATA = setInterval(() => {
      updateRouletteVisibility(false)
      const afterReload = () => {
        if (dataBets.PENDING_CLAIM_USER.length > 0) {
          setTimeout(() => updateRouletteVisibility(true), 1000)
          clearInterval(THREAD_RELOAD_USERDATA)
        }
      }

      reloadUserDataBetsData(afterReload)
    }, 5000)
  }

  const forceReload = (ts = 100) => {
    setTimeout(() => {
      reloadUserData()
    }, ts)
  }

  const betsDisabled = () => {
    return dataBets.PENDING_CLAIM_USER && dataBets.PENDING_CLAIM_USER.length > 0
  }

  React.useEffect(() => {
    //updateRouletteVisibility(false);
    setFireConfettiTrigger(false)
    forceReload()
    setTimeout(() => updateRouletteVisibility(true), 1000)
  }, [connector, isConnected])

  return (
    <div id="wheel-container" className="container-fluid py-4">
      <SnackbarElement
        open={snackbar.open}
        message={snackbar.message}
        autoHideDuration={5000}
        // {snackbar.autoHideDuration ? snackbar.autoHideDuration : 10000}
        onClose={() => {
          snackbar.open = false
          snackbar.message = ''
          updateRouletteVisibility(false)
          setSnackbar({ ...snackbar })
          setTimeout(() => updateRouletteVisibility(true), 1000)
          // setSnackbar(snackbar);
        }}
        type={snackbar.type}
      />
      <div className="row mt-4 pb-4 position-relative">
        <div className="col-8-1">
          <div className="border-radius-xs tw-mb-0">
            <div className="card-body p-3 -tw-mt-7 tw-flex">
              <div className="tw-flex tw-justify-center tw-flex-col">
                <h6 className="font-weight-bolder tw-flex tw-text-base tw-text-[#ffffff]">
                  <Image
                    priority={true}
                    className="tw-h-5 tw-w-5 tw-mr-2 tw-align-text-top"
                    src={walletIcon}
                    alt="wallet-icon"
                  />
                  <span className="tw-text-[#f7db2d] tw-pr-1">Wallet:</span>{' '}
                  {` ${dataBalances.USER_TOKENS} $ETH (${dataBalances.USER_TOKENS_VALUE}$)`}
                </h6>
                <h6 className="font-weight-bolder tw-flex tw-text-base tw-text-[#ffffff]">
                  <Image
                    priority={true}
                    className="tw-h-5 tw-w-5 tw-mr-2 tw-align-text-top"
                    src={depositIcon}
                    alt="deposit-icon"
                  />
                  <span className="tw-text-[#f7db2d] tw-pr-1">Deposit:</span>{' '}
                  {` ${dataBalances.USER_TOKENS_IWALLET} $ETH (${dataBalances.USER_TOKENS_VALUE_IWALLET}$)`}
                </h6>
              </div>
            </div>
          </div>

          <div className="bg-gradient-primary tw-rounded-xl">
            <div className="card-body p-3 tw-pb-0">
              <div className="row">
                <div className="col-lg-12">
                  <button
                    className="tw-bg-[#FFD700] tw-text-black tw-font-bold tw-rounded-lg tw-p-2"
                    onClick={() => {
                      updateRouletteVisibility(false)
                      forceReload()
                      setTimeout(() => updateRouletteVisibility(true), 1000)
                    }}
                  >
                    {'Refresh'}
                  </button>

                  <Confetti fireConfettiTrigger={fireConfettiTrigger} />

                  <div id="rowRoulettes">
                    <div
                      className={`col tw-overflow-visible tw-flex-col tw-justify-center tw-items-center tw-mb-7 ${
                        rouletteLoading ? 'd-flex' : 'd-none'
                      }`} /* style={{display: rouletteLoading ? "flex" : "none" }} */
                    >
                      <Image src={loadingGif} alt="loadingGif" />
                      <div className="tw-h-9"></div>
                    </div>

                    <div
                      className={`col tw-overflow-visible tw-flex-col tw-justify-center tw-items-center ${
                        rouletteLoading ? 'd-none' : 'd-flex'
                      }`} /* style={{display: rouletteLoading ? "none" : "flex" }} */
                    >
                      <div className="tw-mt-7">
                        <RoulettePaid
                          bet={dataBetPaid}
                          onWin={onWin}
                          ROULETTE_OPTIONS={ROULETTE_OPTIONS}
                        />
                      </div>
                      <div className="tw-text-center">
                        Profits Today: {dataProfits.PROFITS_LEFT_TODAY} /{' '}
                        {dataProfits.PROFITS_MAX_TODAY}
                      </div>
                      <div className="tw-text-center tw-mb-0">
                        Profits Weekly: {dataProfits.PROFITS_LEFT_WEEK} /{' '}
                        {dataProfits.PROFITS_MAX_WEEK}
                      </div>
                      <div className="tw-inline-flex tw-flex-row tw-justify-center tw-items-center">
                        {contractConfig &&
                          contractConfig.betsEnabled.map((betA) => {
                            return (
                              <button
                                key={betA}
                                disabled={betsDisabled()}
                                className="tw-bg-[#FFD700] tw-text-black tw-mt-5 tw-font-bold tw-rounded-lg tw-p-2 tw-mr-2 tw-cursor-pointer"
                                onClick={() => {
                                  if (getProvider) {
                                    getProvider().then((provider) => {
                                      if (provider) {
                                        RouletteService.performPaidBet(
                                          betA,
                                          provider,
                                        )
                                          .then((ans) => {
                                            waitAndReload(
                                              ans,
                                              true,
                                              `Paid ${betA}$ Bet Performed Successfully, Good Luck!`,
                                            )
                                          })
                                          .catch((err) => {
                                            setSnackbarError(err)
                                          })
                                      }
                                    })
                                  }
                                }}
                              >
                                {`BET ${betA}$`}
                              </button>
                            )
                          })}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="col tw-overflow-visible tw-flex tw-justify-center tw-items-center">
                      <ResponsiveDialog
                        visible={modalVisible}
                        content={messageNode}
                        title={''}
                        fatherId={'wheel-container'}
                        dialogStyle={{
                          '& .MuiPaper-root': { background: backgroundColorDB },
                          boxShadow: 'none',
                        }}
                      />
                    </div>
                  </div>

                  <div className="tw-mt-3">
                    <div className="col tw-overflow-hidden tw-flex tw-justify-center tw-items-center">
                      {dataBets.PENDING_CLAIM_USER &&
                        dataBets.PENDING_CLAIM_USER.length > 0 && (
                          <button
                            className="tw-cursor-pointer tw-bg-[#FFD700] tw-text-[black] tw-font-bold tw-rounded-lg tw-p-2 tw-pl-2 tw-pr-2 tw-mr-2"
                            disabled={enabledConfirmButton}
                            title={
                              enabledConfirmButton ? 'Already spinned' : ''
                            }
                            onClick={() => {
                              if (getProvider) {
                                getProvider().then((provider) => {
                                  if (
                                    provider &&
                                    dataBets.PENDING_CLAIM_USER.length >= 1
                                  ) {
                                    const betClaim =
                                      dataBets.PENDING_CLAIM_USER[0]
                                    RouletteService.getBetData(
                                      provider,
                                      betClaim,
                                    ).then((betData) => {
                                      if (betData.state == betState.solved) {
                                        if (betData._type == betType.paid) {
                                          updateRouletteVisibility(false)
                                          setDataBetPaid(betData)
                                          setEnabledConfirmButton(true)
                                          setTimeout(
                                            () =>
                                              updateRouletteVisibility(true),
                                            1000,
                                          )
                                          const audio = new Audio(
                                            '/assets/media/sounds/roulette.mp3',
                                          )
                                          setTimeout(() => {
                                            audio.play()
                                          }, 2000)
                                        }
                                      }
                                    })
                                  }
                                })
                              }
                            }}
                          >
                            {'SPIN'}
                          </button>
                        )}
                      {dataBets.PENDING_CLAIM_USER &&
                        dataBets.PENDING_CLAIM_USER.length > 0 && (
                          <button
                            className="tw-cursor-pointer tw-bg-[#FFD700] tw-text-[black] tw-font-bold tw-rounded-lg tw-p-2 tw-pl-2 tw-pr-2 tw-mr-2"
                            disabled={!enabledConfirmButton}
                            title={!enabledConfirmButton ? 'Spin first' : ''}
                            onClick={() => {
                              if (getProvider) {
                                getProvider().then((provider) => {
                                  if (
                                    provider &&
                                    dataBets.PENDING_CLAIM_USER.length >= 1
                                  ) {
                                    const betClaim =
                                      dataBets.PENDING_CLAIM_USER[0]
                                    RouletteService.claimBet(betClaim, provider)
                                      .then((ans) => {
                                        updateRouletteVisibility(false)
                                        isModalVisible(false)
                                        setMessageNode('')
                                        setEnabledConfirmButton(false)
                                        RouletteService.getPrizeFromBetIndex(
                                          provider,
                                          betClaim,
                                        ).then((_ans) => {
                                          waitAndReload(
                                            ans,
                                            false,
                                            `You Bet with id ${betClaim} was Claimed, you ${_ans}`,
                                          )
                                        })
                                        setTimeout(
                                          () => updateRouletteVisibility(true),
                                          1000,
                                        )
                                      })
                                      .catch((err) => {
                                        setSnackbarError(err)
                                      })
                                  }
                                })
                              }
                            }}
                          >
                            {'CONFIRM'}
                          </button>
                        )}
                      {dataBets.PENDING_BETS_USER &&
                        dataBets.PENDING_BETS_USER.length > 0 && (
                          <button
                            className="tw-cursor-pointer tw-bg-[#FFD700] tw-text-[black] tw-font-bold tw-rounded-lg tw-p-2 tw-pl-2 tw-pr-2 tw-mr-2"
                            onClick={() => {
                              if (getProvider) {
                                getProvider().then((provider) => {
                                  if (
                                    provider &&
                                    dataBets.PENDING_BETS_USER.length >= 1
                                  ) {
                                    const betCancel =
                                      dataBets.PENDING_BETS_USER[0]
                                    RouletteService.cancelBet(
                                      betCancel,
                                      provider,
                                    )
                                      .then((ans) => {
                                        waitAndReload(
                                          ans,
                                          false,
                                          `You Bet with id ${betCancel} was Cancelled, if it was a paid bet your money was returned`,
                                        )
                                      })
                                      .catch((err) => {
                                        setSnackbarError(err)
                                      })
                                  }
                                })
                              }
                            }}
                          >
                            {'CANCEL BET'}
                          </button>
                        )}
                    </div>
                  </div>

                  <div className="d-flex flex-column tw-relative tw-overflow-visible">
                    <FormContainer className="tw-pl-0 tw-pr-0">
                      <div className="row tw-justify-center tw-pt-0">
                        <div className="col-xl-4 col-sm-6 mb-xl-0 mb-4">
                          <div className=" tw-flex tw-justify-center tw-items-center tw-flex-col tw-mt-2 tw-w-full tw-m-0">
                            <OperationsBox
                              index={0}
                              token={tokenBox}
                              getETHValue={CommonService.getETHValue}
                              operation={'Deposit'}
                              allowDecimals={true}
                              min={1}
                              step={0.001}
                              // disableLoading={true}
                              disabledInputs={false}
                              onGotPath={({ val }: any) => {
                                tokenBox.depositVal = val.value
                              }}
                            />
                            <ButtonAction
                              onClick={() => {
                                if (getProvider) {
                                  getProvider().then((provider) => {
                                    if (provider) {
                                      try {
                                        CasinoTreasuryService.deposit(
                                          provider,
                                          Math.floor(
                                            tokenBox.depositVal * 10 ** 18,
                                          ).toString(),
                                        )
                                          .then((ans) => {
                                            waitAndReload(ans)
                                          })
                                          .catch((err) => {
                                            setSnackbarError(err)
                                          })
                                      } catch (err) {
                                        setSnackbarError(err)
                                      }
                                    }
                                  })
                                }
                              }}
                              className="tw-opacity-100 tw-mt-1 tw-pointer-events-auto"
                            >
                              DEPOSIT
                            </ButtonAction>
                          </div>
                        </div>

                        <div className="col-xl-4 col-sm-6 mb-xl-0 mb-4">
                          <div className=" tw-flex tw-justify-center tw-items-center tw-flex-col tw-mt-2 tw-w-full tw-m-0">
                            <OperationsBox
                              index={1}
                              token={tokenBox}
                              getETHValue={CommonService.getETHValue}
                              operation={'Withdraw'}
                              allowDecimals={true}
                              min={1}
                              step={0.001}
                              // disableLoading={true}
                              disabledInputs={false}
                              onGotPath={({ val }: any) => {
                                tokenBox.withdrawVal = val.value
                              }}
                            />
                            <ButtonAction
                              onClick={() => {
                                if (getProvider) {
                                  getProvider().then((provider) => {
                                    if (provider) {
                                      CasinoTreasuryService.withdraw(
                                        provider,
                                        Math.floor(
                                          tokenBox.withdrawVal * 10 ** 18,
                                        ).toString(),
                                      )
                                        .then((ans) => {
                                          waitAndReload(ans)
                                        })
                                        .catch((err) => {
                                          setSnackbarError(err)
                                        })
                                    }
                                  })
                                }
                              }}
                              className="tw-opacity-100 tw-mt-1 tw-pointer-events-auto"
                            >
                              WITHDRAW
                            </ButtonAction>
                          </div>
                        </div>
                      </div>
                    </FormContainer>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const SnackbarElement = (props: any) => {
  const { onClose } = props

  return (
    <Snackbar
      {...props}
      ContentProps={{
        style: {
          backgroundColor:
            props.type == 'success'
              ? 'green'
              : props.type == 'error'
              ? 'red'
              : props.type == 'warning'
              ? 'yellow'
              : 'black',
        },
      }}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      action={
        <button
          onClick={onClose}
          className={[(useStyles as _useStyles).snackbar_action_button].join(
            ' ',
          )}
        >
          Close
        </button>
      }
    />
  )
}

type _useStyles = {
  snackbar_action_button: any
}
const useStyles: unknown = makeStyles((theme) => ({
  snackbar_action_button: {
    // @extend .button;
    // @include mainFont();
    color: '#57cc75 !important',
    background: '#1f943d !important',
    textShadow: 'none !important',
    fontSize: '0.5em !important',
  },
}))

export default WheelLayout
