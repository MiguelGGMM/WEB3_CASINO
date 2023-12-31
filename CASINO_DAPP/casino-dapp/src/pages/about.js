import React from 'react'
import Link from 'next/link'

import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles'

const Index = () => {
  const classes = useStyles()

  return (
    <main className={classes.main}>
      <div>
        <Typography variant="h3">Web3 Casino starter template</Typography>
        <Typography variant="h6">
          Next.js + Material UI + dark mode + Web3 Casino starter template.
          Boilerplate to get starter quickly.
        </Typography>
      </div>
      <Link href="/">
        <a className={classes.text}>Home</a>
      </Link>
    </main>
  )
}

const useStyles = makeStyles((/* theme */) => ({
  main: {
    width: '100%',
    margin: '100px auto',
    maxWidth: 1100,
    textAlign: 'center',
  },
  text: {
    fontSize: 18,
  },
}))

export default Index
