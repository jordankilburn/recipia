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

import { addRecipe, updateRecipe, deleteRecipe } from "../firebase"

const useStyles = makeStyles(theme => ({
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
    borderRadius: "4px",
    height: "70%",
    display: "flex",
    alignSelf: "center",
    color: "#CC2936",
    cursor: "pointer",
    background: "rgba(0, 0, 0, 0.04)",
    "&:hover": {
      background: "rgba(0, 0, 0, 0.09)",
    },
  },
  addIcon: {
    borderRadius: "4px",
    height: "70%",
    display: "flex",
    alignSelf: "center",
    color: "green",
    cursor: "pointer",
    background: "rgba(0, 0, 0, 0.04)",
    "&:hover": {
      background: "rgba(0, 0, 0, 0.09)",
    },
  },
  input: {
    width: "90%",
    borderRadius: 4,
    border: "1px solid transparent",
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
  deleteButton: {
    textTransform: "none",
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

export default ({ children, newRecipe, recipe, board, newTag }) => {
  const classes = useStyles()

  const [open, setOpen] = React.useState(false)
  const [tagAdder, setTagAdder] = React.useState("")
  const [displayTagAdder, setDisplayTagAdder] = React.useState(false)
  const [thisRecipe, setThisRecipe] = React.useState({})

  React.useEffect(() => {
    if (open)
      setTimeout(() => {
        const textArea = document.querySelector("textarea")
        if (textArea) {
          textArea.style.height = "inherit"
          textArea.style.height = `${textArea.scrollHeight + 30}px`
        }
      }, 100)
  }, [open])

  const handleKeyDown = e => {
    e.target.style.height = "inherit"
    e.target.style.height = `${e.target.scrollHeight + 30}px`
    // In case you have a limitation
    // e.target.style.height = `${Math.min(e.target.scrollHeight, limit)}px`;
  }

  const handleClickOpen = () => {
    if (newRecipe) {
      const recipe2add = {
        id: uuidv4(),
        title: "New Recipe",
        description: "",
        tags: newTag ? [newTag] : ["None"],
      }
      setThisRecipe(recipe2add)
      addRecipe(recipe2add, board)
      setOpen(true)
    } else if (recipe) {
      setThisRecipe(recipe)
      setOpen(true)
    }
  }

  const hasRecipeChanged = (a, b) => {
    if (a !== b) return true
    for (var key in a) {
      if (a[key] !== b[key]) {
        return true
      }
    }
    return false
  }

  const changeRecipeinDB = () => {
    if (hasRecipeChanged(thisRecipe, recipe)) updateRecipe(thisRecipe, board)
  }

  const handleClose = () => {
    if (thisRecipe && thisRecipe.tags && recipe && recipe.tags) {
      if (thisRecipe.tags !== recipe.tags) updateRecipe(thisRecipe, board)
    }
    setOpen(false)
  }

  const changeRecipe = e => {
    e.preventDefault()
    let changedRecipe = { ...thisRecipe }
    changedRecipe[e.target.name] = e.target.value
    setThisRecipe(changedRecipe)
  }

  const removeTag = tag => {
    let changedRecipe = { ...thisRecipe }
    changedRecipe.tags = thisRecipe.tags.filter(t => t !== tag)
    if (changedRecipe.tags.length < 1) return //must have at lease 1 tag
    setThisRecipe(changedRecipe)
  }

  const addTag = () => {
    if (tagAdder === "") return setDisplayTagAdder(false)
    let changedRecipe = { ...thisRecipe }
    changedRecipe.tags = [...thisRecipe.tags, tagAdder]
    setThisRecipe(changedRecipe)
    setTagAdder("")
    setDisplayTagAdder(false)
  }

  const addDate = () => {
    let changedRecipe = { ...thisRecipe }
    const todaysDate = new Date().toLocaleDateString()
    if (thisRecipe.history) {
      if (thisRecipe.history.find(h => h.d == todaysDate)) return
      changedRecipe.history = [
        { d: todaysDate },
        ...(thisRecipe && thisRecipe.history),
      ]
    } else {
      changedRecipe.history = [{ d: todaysDate }]
    }
    setThisRecipe(changedRecipe)
    updateRecipe(changedRecipe, board)
  }

  // const removeDate = history => {
  //   let changedRecipe = { ...thisRecipe }
  //   changedRecipe.history = thisRecipe.history.filter(h => h.d !== history.d)
  //   setThisRecipe(changedRecipe)
  //   updateRecipe(changedRecipe, board)
  // }

  const deleteThisRecipe = () => {
    thisRecipe && deleteRecipe(thisRecipe, board)
    setOpen(false)
  }

  return (
    <>
      <span style={{ cursor: "pointer" }} onClick={handleClickOpen}>
        {children}
      </span>
      {open && (
        <Dialog
          fullWidth
          fullScreen
          maxWidth="md"
          open={open}
          onClose={handleClose}
        >
          <DialogTitle id="alert-dialog-title">
            <b>
            <input
              className={classes.input}
              variant="outlined"
              id="title"
              name="title"
              value={thisRecipe.title}
              placeholder="Recipe Name"
              onChange={changeRecipe}
              onBlur={changeRecipeinDB}
            /></b>
            <IconButton
              aria-label="close"
              className={classes.closeButton}
              onClick={handleClose}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent dividers>
            <Grid container spacing={3}>
              {" "}
              <Grid item xs={12} sm={9}>
                <textarea
                  className={classes.textarea}
                  style={{ minHeight: "50vh", height: "unset" }}
                  variant="outlined"
                  id="description"
                  name="description"
                  placeholder="How to make it :)"
                  value={thisRecipe.description}
                  onFocus={handleKeyDown}
                  onKeyDown={handleKeyDown}
                  onPaste={handleKeyDown}
                  onCut={handleKeyDown}
                  onChange={changeRecipe}
                  onBlur={changeRecipeinDB}
                  //implement Rich Text Editor...
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <Grid container spacing={3}>
                  <Grid item xs={6} sm={12}>
                   <b> Categories:</b>
                    <br />
                    <div className={classes.categoryEntry}>
                      <AddIcon
                        className={classes.addIcon}
                        onClick={() => setDisplayTagAdder(true)}
                      />
                      {displayTagAdder && (
                        <input
                          style={{ width: "100%", border: "1px solid grey" }}
                          className={classes.input}
                          variant="outlined"
                          id="tag"
                          name="addTag"
                          value={tagAdder}
                          onChange={e => setTagAdder(e.target.value)}
                          onBlur={addTag}
                          onKeyDown={e => e.key === "Enter" && addTag()}
                        />
                      )}
                      <br />
                    </div>
                    {thisRecipe.tags &&
                      thisRecipe.tags.map(tag => {
                        if (tag)
                          return (
                            <div key={tag} className={classes.categoryEntry}>
                              <CancelIcon
                                className={classes.cancelIcon}
                                onClick={() => removeTag(tag)}
                              />
                              {tag}
                              <br />
                            </div>
                          )
                      })}
                    
                  </Grid>
                  <Grid item xs={6} sm={12}>
                    <b>History:</b>
                    <br />
                    <div className={classes.categoryEntry}>
                      <AddIcon className={classes.addIcon} onClick={addDate} />
                    </div>
                    {thisRecipe.history &&
                      thisRecipe.history.map((history, i) => {
                        if (history.d)
                          return (
                            <div key={i} className={classes.categoryEntry}>
                              {/* <CancelIcon
                                className={classes.cancelIcon}
                                onClick={() => removeDate(history)}
                              /> */}
                              {history.d}
                              <br />
                            </div>
                          )
                      })}
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button
              className={classes.saveButton}
              variant="outlined"
              color="primary"
              onClick={handleClose}
            >
              Save
            </Button>
            <div className={classes.grow} />
            <Button
              className={classes.deleteButton}
              variant="outlined"
              color="primary"
              onClick={deleteThisRecipe}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  )
}
