import React, { Children } from "react"
import Button from "@material-ui/core/Button"
import Dialog from "@material-ui/core/Dialog"
import DialogActions from "@material-ui/core/DialogActions"
import DialogContent from "@material-ui/core/DialogContent"
import IconButton from "@material-ui/core/IconButton"
import CloseIcon from "@material-ui/icons/Close"
import CancelIcon from "@material-ui/icons/Cancel"
import AddIcon from "@material-ui/icons/Add"
import DialogTitle from "@material-ui/core/DialogTitle"
import Grid from "@material-ui/core/Grid"
import TextField from "@material-ui/core/TextField"
import { makeStyles } from "@material-ui/core/styles"
import { v4 as uuidv4 } from "uuid"
import firebase from "gatsby-plugin-firebase"


const useStyles = makeStyles(theme => ({
  errorText: {
    color: theme.palette.error.main,
  },
  grow: {
    flexGrow: 1,
  },
  closeButton: {
    position: "absolute",
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
  categoryEntry: {
    display: "flex",
    height: "25px",
    margin: "0.25rem",
  },
  cancelIcon: {
    height: "70%",
    display: "flex",
    alignSelf: "center",
    color: "#CC2936",
    cursor: "pointer",
  },
  addIcon: {
    height: "70%",
    display: "flex",
    alignSelf: "center",
    color: "green",
    cursor: "pointer",
  },
  input: {
    margin: "1rem",
    borderRadius: 4,
    border: "1px solid grey",
    outline: 0,
    "&:focus": {
      border: "1px solid grey",
    },
  },
  textarea: {
    resize: "none",
    width: "100%",
    height: "100%",
    borderRadius: 4,
    border: "1px solid transparent",
    outline: 0,
    "&:focus": {
      border: "1px solid grey",
    },
  },
  saveButton: {
    textTransform: "none",
    backgroundColor: "green",
    color: "white",
    "&:hover": {
      backgroundColor: "green",
      color: "white",
    },
  },
}))

export default ({ children }) => {
  const classes = useStyles()
  const [open, setOpen] = React.useState(false)
  const [friendsEmail, setFriendsEmail] = React.useState("")
  const [error, setError] = React.useState("")
  const [output, setOutput] = React.useState("")

  const handleClickOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const shareRecipes = () => {
    setError("")
    setOutput("")
    firebase
      .functions()
      .httpsCallable("shareWithUser")(friendsEmail)
      .then(function (result) {
        // Read result of the Cloud Function.
        setOutput(result.data)
        // ...
      }).catch((err)=>{
        setError(err.message)
      })
  }

  return (
    <>
      <span style={{ cursor: "pointer" }} onClick={handleClickOpen}>
        {children}
      </span>
      {open && (
        <Dialog fullWidth maxWidth="xs" open={open} onClose={handleClose}>
          <DialogTitle id="alert-dialog-title">
            Share With a Friend :)
            <IconButton
              aria-label="close"
              className={classes.closeButton}
              onClick={handleClose}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent dividers style={{ textAlign: "center" }}>
            <input
              className={classes.input}
              placeholder="Friend's Email"
              variant="outlined"
              id="friendsEmail"
              name="friendsEmail"
              value={friendsEmail}
              onChange={e => setFriendsEmail(e.target.value)}
            /><br/>
            <small className={classes.errorText}>
                  {error ? error : null}
                </small>
                <div>{output}</div>
          </DialogContent>
          <DialogActions>
            <Button
              className={classes.saveButton}
              variant="outlined"
              color="primary"
              onClick={shareRecipes}
            >
              Share Recipes
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  )
}
