import React, { useState, useEffect } from "react"
import SEO from "../components/seo"

import { makeStyles } from "@material-ui/core/styles"
import Paper from "@material-ui/core/Paper"
import Grid from "@material-ui/core/Grid"
import { MuiThemeProvider } from "@material-ui/core/styles"
import RefreshIcon from "@material-ui/icons/Refresh"
import theme from "../components/theme"
import Modal from "../components/modal"
import AppBar from "../components/appbar"
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd"

import useAuth from "../hooks/useAuth"
import useRecipes from "../hooks/useRecipes"
import { updateRecipe, updateMealPlan, addMealPlan } from "../firebase"
import useMealPlan from "../hooks/useMealPlan"

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
    display: "flex",
    height: "100%",
  },
  topbar: {
    marginBottom: theme.spacing(1),
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  botbar: {
    marginTop: theme.spacing(1),
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  addIcon: {
    borderRadius: "4px",
    margin: 0,
    cursor: "pointer",
    padding: theme.spacing(1, 2),
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(0, 0, 0, 0.04)",
    "&:hover": {
      background: "rgba(0, 0, 0, 0.09)",
    },
  },
  category: {
    display: "flex",
    flexDirection: "column",
    maxHeight: "100%",
    position: "relative",
    whiteSpace: "normal",
    backgroundColor: "#ebecf0",
    padding: theme.spacing(2),
    textAlign: "left",
    color: theme.palette.text.secondary,
  },
  entries: {
    overflowY: "auto",
  },
  paper: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    padding: theme.spacing(1.5),
    textAlign: "left",
    color: "black",
    width: "100%",
  },
  paperWeekly: {
    margin: 0,
    boxShadow: "none",
  },
  dropzone: {
    textAlign: "left",
    color: "black",
    width: "100%",
    boxShadow: "none",
    border: "2px dashed grey",
  },
  holder: {
    display: "flex",
    whiteSpace: "nowrap",
    marginBottom: "8px",
    overflowX: "auto",
    overflowY: "hidden",
    paddingBottom: "8px",
    position: "absolute",
    top: "116px",
    bottom: 0,
  },
  item: {
    width: "333px",
    boxSizing: "border-box",
    display: "inline-block",
    verticalAlign: "top",
    whiteSpace: "nowrap",
    padding: theme.spacing(2),
  },
  input: {
    width: "100%",
    padding: "4px 8px",
    fontSize: "1.15rem",
    color: "#122932",
    borderRadius: 4,
    backgroundColor: "transparent",
    border: "1px solid transparent",
    outline: 0,
    "&:focus": {
      color: "black",
      border: "1px solid grey",
    },
  },
}))

const getItemStyle = (isDragging, draggableStyle) => ({
  transform: !isDragging ? "none" : "rotate(4deg)",
})

function getStyle(style, snapshot) {
  if (!snapshot.isDragging) return {}
  if (!snapshot.isDropAnimating) {
    return style
  }

  return {
    ...style,
    // cannot be 0, but make it super tiny
    transitionDuration: `0.001s`,
  }
}

export default () => {
  const classes = useStyles()
  let storedBoard = ""
  if (typeof window !== "undefined") {
    storedBoard = localStorage.getItem("currentBoard")
    if (storedBoard === null) storedBoard = ""
  }
  const { isLoggedIn, profile } = useAuth()
  const [searchText, setSearchText] = useState("")
  const [currentBoard, setCurrentBoard] = React.useState(storedBoard)
  const [allTags, setAllTags] = useState([""])
  const [filteredRecipes, setFilteredRecipes] = useState([])
  const [draggingDaily, setDraggingDaily] = useState(false)
  const [dailyRecipes, setDailyRecipes] = useState({})
  const { isLoadingRecipes, recipes } = useRecipes(currentBoard)
  const { isLoadingMealPlan, mealPlan } = useMealPlan(currentBoard)

  useEffect(() => {
    if (Object.keys(dailyRecipes).length == 0) return
    if (hasDayChanged(dailyRecipes, mealPlan.days)) {
      let newMealPlan = { ...mealPlan }
      Object.keys(newMealPlan.days).forEach(day => {
        newMealPlan.days[day] = dailyRecipes[day] ? dailyRecipes[day].id : null
      })

      updateMealPlan(newMealPlan, currentBoard)
    }
  }, [dailyRecipes])

  useEffect(() => {
    if (mealPlan === null) return
    if (recipes === null) return
    if (!mealPlan.days) return addMealPlan(currentBoard)
    //setup
    let newMealPlan = { ...mealPlan.days }
    Object.keys(mealPlan.days).forEach(day => {
      const foundRecipe = recipes.find(r => r && r.id === mealPlan.days[day])
      newMealPlan[day] = foundRecipe ? foundRecipe : null
    })

    setDailyRecipes({
      Sunday: newMealPlan.Sunday,
      Monday: newMealPlan.Monday,
      Tuesday: newMealPlan.Tuesday,
      Wednesday: newMealPlan.Wednesday,
      Thursday: newMealPlan.Thursday,
      Friday: newMealPlan.Friday,
      Saturday: newMealPlan.Saturday,
    })
  }, [mealPlan, recipes])

  useEffect(() => {
    if (recipes !== null) {
      let newTags = []
      recipes.forEach(recipe => {
        let prev = newTags
        newTags = newTags.concat(recipe.tags)
        newTags = [...new Set([...prev, ...recipe.tags])]
      })
      setAllTags(newTags)
    }
  }, [recipes])

  useEffect(() => {
    //run on search
    if (recipes === null) return
    let newRecipeList = recipes.filter(
      r =>
        r.tags.filter(t =>
          t.toLocaleLowerCase().includes(searchText.toLocaleLowerCase())
        ).length ||
        r.title.toLocaleLowerCase().includes(searchText.toLocaleLowerCase())
    )
    setFilteredRecipes(newRecipeList)
  }, [searchText, recipes])

  const hasDayChanged = (a, b) => {
    for (var key in a) {
      if ((a[key] === null) & (b[key] !== null)) return true
      if (a[key] && a[key].id !== b[key]) {
        return true
      }
    }
    return false
  }

  const changeTaginDB = e => {
    e.preventDefault()
    const oldTag = e.target.name
    const newTag = e.target.value
    if (oldTag === newTag) return
    const recipes2change = recipes.filter(r => r.tags.includes(oldTag))

    recipes2change.forEach(recipe => {
      let newRecipe = { ...recipe }
      newRecipe.tags = newRecipe.tags.filter(t => t !== oldTag)
      if (newRecipe.tags.includes(newTag)) return
      newRecipe.tags.push(newTag)
      updateRecipe(newRecipe, currentBoard)
    })
  }
  const onDragStart = result => {
    if (result.source.droppableId.startsWith("weekly")) setDraggingDaily(true)
  }
  const onDragEnd = result => {
    setDraggingDaily(false)
    if (
      result.destination &&
      result.destination.droppableId.startsWith("weekly")
    ) {
      //add to daily planner
      const day = result.destination.droppableId.split("_")[1]
      const recipeID = result.draggableId.split("_")[0]
      const foundRecipe = recipes.find(r => r.id === recipeID)
      let newRecipes = { ...dailyRecipes }
      newRecipes[day] = foundRecipe
      if (result.source && result.source.droppableId.startsWith("weekly")) {
        const sourceDay = result.source.droppableId.split("_")[1]
        if (sourceDay !== day) newRecipes[sourceDay] = null
      }
      setDailyRecipes(newRecipes)
    }
    if (result.source && result.source.droppableId.startsWith("weekly")) {
      if (
        result.destination &&
        result.source.droppableId == result.destination.droppableId
      )
        return
      if (
        result.destination &&
        result.destination.droppableId.startsWith("weekly")
      )
        return //handled by above
      //remove from planner
      const day = result.source.droppableId.split("_")[1]
      let newRecipes = { ...dailyRecipes }
      newRecipes[day] = null
      setDailyRecipes(newRecipes)
    }
  }

  const resetMealPlan = () => {
    setDailyRecipes({
      Sunday: null,
      Monday: null,
      Tuesday: null,
      Wednesday: null,
      Thursday: null,
      Friday: null,
      Saturday: null,
    })
  }
  return (
    <MuiThemeProvider theme={theme}>
      <SEO title="Home" />
      <div>
        <AppBar
          searchText={searchText}
          setSearchText={setSearchText}
          currentBoard={currentBoard}
          setCurrentBoard={setCurrentBoard}
        />

        {isLoggedIn && (
          <DragDropContext
            className={classes.root}
            onDragEnd={onDragEnd}
            onDragStart={onDragStart}
          >
            <div className={classes.holder}>
              <div className={classes.item}>
                <Paper className={classes.category}>
                  <div className={classes.topbar}>
                    <h4 style={{ margin: 0 }}>Weekly Plan</h4>
                    <h5 className={classes.addIcon} onClick={resetMealPlan}>
                      <RefreshIcon fontSize="default" />
                    </h5>
                  </div>
                  <Grid container spacing={1} className={classes.entries}>
                    {Object.keys(dailyRecipes).map((day, i) => (
                      <Grid key={i} item xs={12}>
                        <div>
                          {day}
                          <Paper className={classes.dropzone}>
                            <Droppable
                              isDropDisabled={
                                dailyRecipes[day] !== null && !draggingDaily
                                  ? true
                                  : false
                              }
                              droppableId={`weekly_${day}`}
                            >
                              {(provided, snapshot) => (
                                <div
                                  style={{ minHeight: "45px" }}
                                  ref={provided.innerRef}
                                  {...provided.droppableProps}
                                >
                                  {/* {provided.placeholder} */}
                                  {dailyRecipes[day] !== null && (
                                    <Draggable
                                      draggableId={`${dailyRecipes[day].id}_${day}_weekly`}
                                      index={0}
                                    >
                                      {(provided, snapshot) => (
                                        <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                          style={getStyle(
                                            provided.draggableProps.style,
                                            snapshot
                                          )}
                                        >
                                          <Modal
                                            recipe={dailyRecipes[day]}
                                            board={currentBoard}
                                          >
                                            <Paper
                                              style={getItemStyle(
                                                snapshot.isDragging,
                                                provided.draggableProps.style
                                              )}
                                              className={`${classes.paper} ${classes.paperWeekly}`}
                                            >
                                              {dailyRecipes[day].title}
                                            </Paper>
                                          </Modal>
                                        </div>
                                      )}
                                    </Draggable>
                                  )}
                                </div>
                              )}
                            </Droppable>
                          </Paper>
                        </div>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </div>

              {allTags.map(tag => {
                if (filteredRecipes.filter(r => r.tags.includes(tag)).length)
                  return (
                    <div key={tag} className={classes.item}>
                      <Paper className={classes.category}>
                        <h5 style={{margin:0}}>
                          <input
                            className={classes.input}
                            variant="outlined"
                            id="tag"
                            name={tag}
                            defaultValue={tag}
                            onBlur={changeTaginDB}
                          />
                        </h5>
                        <Droppable droppableId={tag} isDropDisabled={true}>
                          {(provided, snapshot) => (
                            <div
                              className={classes.entries}
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                            >
                              {filteredRecipes
                                .filter(r => r.tags.includes(tag))
                                .map((recipe, i) => (
                                  <Draggable
                                    key={i}
                                    draggableId={`${recipe.id}_${tag}`}
                                    index={i}
                                  >
                                    {(provided, snapshot) => (
                                      <>
                                        <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                          style={getStyle(
                                            provided.draggableProps.style,
                                            snapshot
                                          )}
                                        >
                                          <Modal
                                            recipe={recipe}
                                            board={currentBoard}
                                            style={{
                                              transform: "none !important",
                                            }}
                                          >
                                            <Paper
                                              className={classes.paper}
                                              style={getItemStyle(
                                                snapshot.isDragging,
                                                provided.draggableProps.style
                                              )}
                                            >
                                              {recipe.title}
                                            </Paper>
                                          </Modal>
                                        </div>
                                        {snapshot.isDragging && (
                                          <Modal
                                            style={{
                                              transform: "none !important",
                                            }}
                                            recipe={recipe}
                                            board={currentBoard}
                                          >
                                            <Paper className={classes.paper}>
                                              {recipe.title}
                                            </Paper>
                                          </Modal>
                                        )}
                                      </>
                                    )}
                                  </Draggable>
                                ))}
                            </div>
                          )}
                        </Droppable>
                        <div className={classes.botbar}>
                          <div> </div>
                          <div>
                            <div className={classes.addIcon}>
                              <Modal newRecipe={true} newTag={tag} board={currentBoard}>
                                Add Recipe
                              </Modal>
                            </div>
                          </div>
                        </div>
                      </Paper>
                    </div>
                  )
              })}
            </div>
          </DragDropContext>
        )}
      </div>
    </MuiThemeProvider>
  )
}
