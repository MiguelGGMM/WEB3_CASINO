import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { betState, prizeType } from '../../ts/const'

const Wheel = dynamic(
  () => import('react-custom-roulette').then((mod) => mod.Wheel),
  {
    ssr: false,
  },
)

const Roulette = ({ _props }) => {
  const { ROULETTE_OPTIONS, COLOR, bet, onWin, pointer } = _props

  useEffect(() => {
    if (
      bet &&
      bet.prizeWon != undefined &&
      bet.customPrizeDollarAmountWonType != undefined &&
      bet.NFTwonType != undefined &&
      bet.state == betState.solved
    ) {
      let _prizeType = bet.prizeWon
      let prizeSubtype = 0
      if (_prizeType == prizeType.customPrizeDollarAmount) {
        prizeSubtype = bet.customPrizeDollarAmountWonType
      }
      if (_prizeType == prizeType.NFT) {
        prizeSubtype = bet.NFTwonType
      }
      let _n = 0
      for (const option of ROULETTE_OPTIONS) {
        if (
          option.prizeType == _prizeType &&
          option.prizeSubtype == prizeSubtype
        ) {
          let newPrizeNumber = _n
          setPrizeNumber(newPrizeNumber)
          setMustSpin(true)
          break
        }
        _n++
      }
    }
  }, [bet])

  const [mustSpin, setMustSpin] = useState(false)
  const [prizeNumber, setPrizeNumber] = useState(0)

  // const handleSpinClick = () => {
  //   if (!mustSpin) {
  //     const newPrizeNumber = Math.floor(Math.random() * ROULETTE_OPTIONS.length);
  //     setPrizeNumber(newPrizeNumber);
  //     setMustSpin(true);
  //   }
  // }

  return (
    <>
      <Wheel
        mustStartSpinning={mustSpin}
        prizeNumber={prizeNumber}
        data={ROULETTE_OPTIONS}
        onStopSpinning={() => {
          // SHOW PRIZE
          setMustSpin(false)
          let optionSelected = ROULETTE_OPTIONS[prizeNumber]
          onWin(
            optionSelected.option,
            optionSelected.image.uri,
            optionSelected.style.backgroundColor,
          )
        }}
        spinDuration={1.5}
        // startingOptionIndex={0}
        //backgroundColors={['#ffffff', '#ffffff']}
        textColors={['#ffffff']}
        outerBorderColor={COLOR}
        innerBorderColor={COLOR}
        radiusLineColor={COLOR}
        outerBorderWidth={['5']}
        //innerRadius={['11']}
        //innerBorderWidth={['5']}
        radiusLineWidth={['5']}
        //fontFamily={['Russo One']}
        fontSize={['25']}
        //perpendicularText={['false']}
        textDistance={['60']}
        pointerProps={{ src: pointer }}
      />
    </>
  )
}

export default Roulette
