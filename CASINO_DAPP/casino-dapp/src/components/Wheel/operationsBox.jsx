import React, { useEffect, useState } from 'react'

import { makeStyles } from '@material-ui/core/styles'
import { InputAmount } from '../../styles/wheel'
import { CircularProgress } from '@material-ui/core'

const OperationsBox = ({
  index,
  token,
  getETHValue,
  onGotPath,
  operation,
  allowDecimals,
  min,
  step,
  // disableLoading, // To Do
  disabledInputs,
}) => {
  const classes = useStyles()
  const [value, setValue] = useState(null)
  const [loading, isLoading] = useState(false)
  const [ethValue, setEthValue] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      onUpdateValue()
    }, 100)

    return () => clearTimeout(timer)
  }, [value])

  useEffect(() => {
    setValue(token?.value)
  }, [token?.value])

  const onUpdateValue = () => {
    if (value > 0) {
      if (onGotPath) {
        onGotPath({
          val: { value },
        })
      }
    } else {
      onGotPath({
        val: { value },
      })
    }
  }

  const updateEthValue = async () => {
    if (!value || value == parseInt(0)) {
      setEthValue(0)
    } else {
      const ethValue = await getETHValue(value)
      setEthValue(ethValue)
    }
  }

  const getPrecision = () => {
    if (step <= 1) {
      return Math.log10(1 / step) + 1
    }
    return 2
  }

  return (
    <div style={{ width: '100%', marginTop: 10 }}>
      <h5
        className="gradient-orange-text"
        style={{
          fontWeight: 800,
          color: 'white',
          margin: '0',
          textAlign: 'center',
        }}
      >
        {operation}{' '}
        {ethValue > 0 &&
          `$${parseFloat(ethValue.toPrecision(getPrecision()))} in`}{' '}
        {token.symbol}
      </h5>
      <div
        className={`row`}
        id={`box-index-${index}`}
        style={{
          width: '100%',
          position: 'relative',
          margin: 'auto',
          marginTop: 5,
          marginBottom: 10,
        }}
      >
        {loading && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(0,0,0,.85)',
              borderRadius: 10,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 9999,
            }}
          >
            <CircularProgress style={{ color: '#F8B320' }} />
          </div>
        )}
        <div className={['col-12', classes.container].join(' ')}>
          <div className={classes.fromContainer}>
            <InputAmount
              disabled={disabledInputs}
              id={`bridge-token-index-${index}`}
              value={value}
              placeholder={`Enter amount`}
              max={10000000}
              min={min}
              step={step}
              // type={'number'}
              onKeyDown={(evt) => {
                if ((!allowDecimals && evt.key === '.') || evt.key === ',') {
                  evt.preventDefault()
                }
              }}
              // onkeypress={(evt) => {return evt.charCode >= 48 && evt.charCode <= 57}}
              onChange={(evt) => {
                setValue(evt.target.value)
              }}
              onKeyUp={() => {
                updateEthValue()
              }}
              style={{ border: 0, color: '#222', height: '100%' }}
            />
            <div
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                height: '100%',
                width: 80,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: 'rgba(22,22,22,.8)',
              }}
            >
              <p style={{ margin: 0, fontWeight: 800, color: 'white' }}>
                {token.symbol}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const useStyles = makeStyles({
  container: {
    width: '100%',
    display: 'flex',
    flex: 1,
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 50,
    padding: 0,
    borderRadius: 10,
    '@media only screen and (max-width: 768px)': {
      gap: 15,
    },
  },
  fromContainer: {
    position: 'relative',
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    '& input': {
      width: '100%',
    },
    '& label': {
      fontSize: 14,
      fontWeight: 800,
      color: 'white',
    },
    overflow: 'hidden',
    '@media only screen and (max-width: 768px)': {
      width: '100%',
      minWidth: '100%',
    },
  },
  networkContainer: {
    display: 'flex',
    flex: 0.5,
    /* cursor: 'pointer', */
    transition: 'all 0.1s ease-in',
    webkitTransition: 'all 0.1s ease-in',
    cursor: 'pointer',
    '&:hover': {
      transform: 'translateY(-5px)',
    },
    '@media only screen and (max-width: 768px)': {
      width: '100%',
      minWidth: '100%',
    },
  },
  tokenContainer: {
    display: 'flex',
    flex: 0.5,
    transition: 'all 0.1s ease-in',
    webkitTransition: 'all 0.1s ease-in',
    cursor: 'pointer',
    '&:hover': {
      transform: 'translateY(-5px)',
    },
    '@media only screen and (max-width: 768px)': {
      width: '100%',
      minWidth: '100%',
    },
  },
  /* Box */
  box: {
    boxShadow: 'rgba(0, 0, 0, 0.1) 0px 5px 15px',
    width: '100%',
    border: '3px solid rgba(255,255,255,.2)',
    padding: 10,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    textAlign: 'center',
  },
})

export default OperationsBox
