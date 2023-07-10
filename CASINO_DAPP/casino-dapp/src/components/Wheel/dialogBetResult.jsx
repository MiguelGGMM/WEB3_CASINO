import * as React from 'react'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'

export default function ResponsiveDialog({
  visible,
  content,
  title,
  fatherId = '',
  dialogStyle = {},
  openButton = false,
  closeButton = false,
}) {
  const [open, setOpen] = React.useState(false)
  const [, /* pNode */ setPNode] = React.useState(undefined)
  const [contentD, setContent] = React.useState('')
  const [titleD, setTitle] = React.useState('')
  const [buttonsState, setButtonsState] = React.useState({
    openButton: false,
    closeButton: false,
  })
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'))

  const handleClickOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  React.useEffect(() => {
    setOpen(visible)
    if (fatherId) {
      setPNode(fatherId)
    }
  }, [visible, fatherId])

  React.useEffect(() => {
    setContent(content)
  }, [content])

  React.useEffect(() => {
    setTitle(title)
  }, [title])

  React.useEffect(() => {
    setButtonsState({
      openButton: openButton,
      closeButton: closeButton,
    })
  }, [openButton, closeButton])

  return (
    <div>
      {buttonsState.openButton && (
        <Button variant="outlined" onClick={handleClickOpen}>
          Open responsive dialog
        </Button>
      )}
      <Dialog
        //PaperProps={{styles: dialogStyle}}
        // container={document.getElementById(pNode)} // Not working
        sx={dialogStyle}
        fullScreen={fullScreen}
        open={open}
        onClose={handleClose}
        aria-labelledby="responsive-dialog-title"
      >
        <DialogTitle id="responsive-dialog-title">{titleD}</DialogTitle>
        <DialogContent>
          <DialogContentText>{contentD}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleClose}>
            X
          </Button>
          {buttonsState.closeButton && (
            <Button onClick={handleClose} autoFocus>
              Agree
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </div>
  )
}
