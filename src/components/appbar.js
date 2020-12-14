import React from "react"
import { fade, makeStyles } from "@material-ui/core/styles"
import AppBar from "@material-ui/core/AppBar"
import Paper from "@material-ui/core/Paper"
import Grid from "@material-ui/core/Grid"
import Toolbar from "@material-ui/core/Toolbar"
import Typography from "@material-ui/core/Typography"
import InputBase from "@material-ui/core/InputBase"
import IconButton from "@material-ui/core/IconButton"
import Menu from "@material-ui/core/Menu"
import FormControl from "@material-ui/core/FormControl"
import Select from "@material-ui/core/Select"
import MenuItem from "@material-ui/core/MenuItem"
import MoreVertIcon from "@material-ui/icons/MoreVert"
import SearchIcon from "@material-ui/icons/Search"
import LogoutIcon from "@material-ui/icons/ExitToApp"
import AuthModal from "./authModal"
import ShareModal from "./shareModal"

import useAuth, { logout } from "../hooks/useAuth"

import Modal from "./modal"

const useStyles = makeStyles(theme => ({
  formControl: {
    minWidth: 120,
    border: "none",
  },
  selectEmpty: {
    color: "white",
  },
  root: {
    flexGrow: 1,
    padding: "1rem",
    marginTop: 48,
    position: "fixed",
    width: "100%",
  },
  category: {
    backgroundColor: "#ebecf0",
    padding: "0.5rem 0",
    textAlign: "left",
    color: theme.palette.text.secondary,
  },
  signup: {
    backgroundColor: "#ebecf0",
    color: "black",
    padding: "0.5rem",
    textAlign: "center",
  },
  grow: {
    flexGrow: 1,
  },
  addButton: {
    position: "relative",
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    "&:hover": {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    height: 35,
  },
  search: {
    position: "relative",
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    "&:hover": {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(1),
    marginLeft: 0,
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      marginLeft: theme.spacing(1),
      width: "auto",
    },
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: "100%",
    position: "absolute",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  addIcon: {
    padding: theme.spacing(0, 2),
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  inputRoot: {
    color: "inherit",
    width: "100%",
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "20ch",
    },
  },

  appbar: {
    backgroundColor: "#2C514C",
  },
  icon: {
    fill: "white",
  },
}))

export default ({
  setSearchText,
  searchText,
  currentBoard,
  setCurrentBoard,
}) => {
  const { isLoggedIn, profile } = useAuth()
  const [anchorEl, setAnchorEl] = React.useState(null)

  const classes = useStyles()

  React.useEffect(() => {
    if (profile && currentBoard === "") {
      setCurrentBoard(profile.uid)
      if (typeof window !== "undefined")
        localStorage.setItem("currentBoard", profile.uid)
    }
  }, [profile])

  const searching = e => {
    setSearchText(e.target.value)
  }

  const changeBoard = e => {
    e.preventDefault()
    setCurrentBoard(e.target.value)
    if (typeof window !== "undefined")
      localStorage.setItem("currentBoard", e.target.value)
  }

  return (
    <div className={classes.grow}>
      <AppBar position="fixed" className={classes.appbar}>
        <Toolbar variant="dense">
          {profile ? (
            <FormControl className={classes.formControl}>
              <Select
                value={currentBoard}
                onChange={changeBoard}
                displayEmpty
                className={classes.selectEmpty}
                disableUnderline
                inputProps={{
                  classes: {
                    icon: classes.icon,
                  },
                }}
              >
                <MenuItem default value={profile.uid}>
                  <Typography variant="h6" noWrap>
                    {profile && profile.name}'s Recipes
                  </Typography>
                </MenuItem>
                {profile.sharedFrom &&
                  Object.keys(profile.sharedFrom).map(userId => {
                    return (
                      <MenuItem key={userId} value={userId}>
                        <Typography variant="h6" noWrap>
                          {profile.sharedFrom[userId]}'s Recipes
                        </Typography>
                      </MenuItem>
                    )
                  })}
              </Select>
            </FormControl>
          ) : (
            "All Our Recipes"
          )}

          <div className={classes.grow} />

          {isLoggedIn ? (
            <>
              <div>
                <IconButton
                  aria-label="more"
                  aria-controls="long-menu"
                  aria-haspopup="true"
                  onClick={event => setAnchorEl(event.currentTarget)}
                >
                  <MoreVertIcon style={{ color: "white" }} />
                </IconButton>
                <Menu
                  id="long-menu"
                  anchorEl={anchorEl}
                  keepMounted
                  open={Boolean(anchorEl)}
                  onClose={() => setAnchorEl(null)}
                  PaperProps={{
                    style: {
                      maxHeight: 200,
                      width: "20ch",
                    },
                  }}
                >
                  <MenuItem onClick={() => setAnchorEl(null)}>
                    <div className={classes.addButton}>
                      <Modal newRecipe={true} board={currentBoard}>
                        <div className={classes.addIcon}>Add Recipe</div>
                      </Modal>
                    </div>
                  </MenuItem>
                  <MenuItem onClick={() => setAnchorEl(null)}>
                    <div className={classes.addButton}>
                      <ShareModal>
                        <div className={classes.addIcon}>Share</div>
                      </ShareModal>
                    </div>
                  </MenuItem>
                  <MenuItem onClick={() => setAnchorEl(null)}>
                    <div className={classes.addButton}>
                      <div className={classes.addIcon} onClick={logout}>
                        Logout
                        <LogoutIcon style={{ marginLeft: 5 }} />
                      </div>
                    </div>
                  </MenuItem>
                </Menu>
              </div>
            </>
          ) : (
            <AuthModal>
              <div className={classes.addIcon}>Login</div>
            </AuthModal>
          )}
        </Toolbar>
      </AppBar>
      {isLoggedIn ? (
        <div className={classes.root}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={5} md={5}>
              <Paper className={classes.category}>
                <div className={classes.search}>
                  <div className={classes.searchIcon}>
                    <SearchIcon />
                  </div>
                  <InputBase
                    placeholder="Search…"
                    classes={{
                      root: classes.inputRoot,
                      input: classes.inputInput,
                    }}
                    onChange={searching}
                    value={searchText}
                  />
                </div>
              </Paper>
            </Grid>
          </Grid>
        </div>
      ) : (
        <div className={classes.root}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper className={classes.signup}>
                <AuthModal showSignup={true}>
                  <div>Click Here to Sign Up</div>
                </AuthModal>
              </Paper>
            </Grid>
          </Grid>
        </div>
      )}
    </div>
  )
}
