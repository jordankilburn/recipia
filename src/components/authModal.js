import React, { Children } from "react"
import Button from "@material-ui/core/Button"
import Dialog from "@material-ui/core/Dialog"
import DialogContent from "@material-ui/core/DialogContent"
import IconButton from "@material-ui/core/IconButton"
import CloseIcon from "@material-ui/icons/Close"
import DialogTitle from "@material-ui/core/DialogTitle"
import Grid from "@material-ui/core/Grid"

import Avatar from "@material-ui/core/Avatar"
import TextField from "@material-ui/core/TextField"
import Link from "@material-ui/core/Link"
import LockOutlinedIcon from "@material-ui/icons/LockOutlined"
import Typography from "@material-ui/core/Typography"
import Container from "@material-ui/core/Container"
import firebase from "gatsby-plugin-firebase"
import useAuth, { auth } from "../hooks/useAuth"
import { setLocalStorage } from "../firebase"

import { makeStyles } from "@material-ui/core/styles"

const useStyles = makeStyles(theme => ({
  closeButton: {
    position: "absolute",
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
  paper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  submit: {
    textTransform: "none",
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.white.main,
    "&:hover": {
      backgroundColor: theme.palette.secondary.main,
      color: theme.palette.white.main,
    },
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  errorText: {
    color: theme.palette.error.main,
  },
}))

export default ({ children, showSignup }) => {
  const classes = useStyles()
  const [open, setOpen] = React.useState(false)
  const [onSignup, setOnSignUp] = React.useState(showSignup ? true : false)
  const [error, setError] = React.useState("")
  const { isLoading, isLoggedIn, profile } = useAuth()

  const handleClickOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const refreshPage = () => {
    window && window.location.reload()
  }

  const login = e => {
    setError("")
    e.preventDefault()
    firebase
      .auth()
      .signInWithEmailAndPassword(e.target.email.value, e.target.password.value)
      .then(async out => {
        await setLocalStorage(out.user)
        refreshPage()
      })
      .catch(function (error) {
        setError(error.message)
      })
  }

  const signup = e => {
    setError("")
    e.preventDefault()
    return setError("Registration is closed")
    const name = e.target.name.value
    firebase
      .auth()
      .createUserWithEmailAndPassword(
        e.target.email.value,
        e.target.password.value
      )
      .then(async out => {
        out.user.updateProfile({
          displayName: name,
        })
        const newUser = {
          name,
          email: out.user.email,
        }

        await firebase
          .firestore()
          .collection("users")
          .doc(out.user.uid)
          .set(newUser)

        await setLocalStorage(out.user)

        refreshPage()
      })
      .catch(function (error) {
        setError(error.message)
      })
  }

  return (
    <>
      <span style={{ cursor: "pointer" }} onClick={handleClickOpen}>
        {children}
      </span>
      <Dialog fullWidth maxWidth="sm" open={open} onClose={handleClose}>
        <DialogTitle id="alert-dialog-title">
          {onSignup ? "Sign up" : "Sign in"}
          <IconButton
            aria-label="close"
            className={classes.closeButton}
            onClick={handleClose}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Container component="main" maxWidth="xs">
            {/* <CssBaseline /> */}
            <div className={classes.paper}>
              <Avatar className={classes.avatar}>
                <LockOutlinedIcon />
              </Avatar>
              <Typography component="h1" variant="h5">
                {onSignup ? "Sign up" : "Sign in"}
              </Typography>
              <form
                className={classes.form}
                onSubmit={onSignup ? signup : login}
              >
                {onSignup && (
                  <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    id="name"
                    label="First Name"
                    name="name"
                    autoComplete="name"
                    autoFocus
                  />
                )}
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                />
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                />
                <small className={classes.errorText}>
                  {error ? error : null}
                </small>
                <Button
                  type="submit"
                  fullWidth
                  variant="outlined"
                  className={classes.submit}
                >
                  {onSignup ? "Sign up" : "Sign in"}
                </Button>
                <Grid container>
                  <Grid item xs>
                    <Link href="#" variant="body2">
                      Forgot password?
                    </Link>
                  </Grid>
                  <Grid item>
                    <Link
                      href="#"
                      variant="body2"
                      onClick={() => setOnSignUp(!onSignup)}
                    >
                      {onSignup
                        ? "Already have an account? Sign In"
                        : "Don't have an account? Sign Up"}
                    </Link>
                  </Grid>
                </Grid>
              </form>
            </div>
          </Container>
        </DialogContent>
        {/* <DialogActions>
          <Button onClick={handleClose}>Delete</Button>
        </DialogActions> */}
      </Dialog>
    </>
  )
}
