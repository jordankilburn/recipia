import firebase from "gatsby-plugin-firebase"
import { v4 as uuidv4 } from "uuid"

const updateMealPlan = async (mealPlan, board) => {
  if (board === null) return
  console.log("updating meal plan")
  await firebase
    .firestore()
    .collection(`users/${board}/mealPlans`)
    .doc(mealPlan.id)
    .set(mealPlan).catch(err=>console.log(err))
}

const addMealPlan = async board => {
  if (board === null) return
  const newPlan = {
    id: "defaultPlan",//uuidv4(),
    leadingSunday: "11/09/20",
    days: {
      Sunday: null,
      Monday: null,
      Tuesday: null,
      Wednesday: null,
      Thursday: null,
      Friday: null,
      Saturday: null,
    },
  }
  console.log("adding meal plan")
  await firebase
    .firestore()
    .collection(`users/${board}/mealPlans`)
    .doc(newPlan.id)
    .set(newPlan)
}

const addRecipe = async (recipe, board) => {
  if (board === null) return
  console.log("adding recipe to ", board)
  await firebase
    .firestore()
    .collection(`users/${board}/recipes`)
    .doc(recipe.id)
    .set(recipe)
}

const updateRecipe = async (recipe, board) => {
  if (board === null) return

  console.log("updating recipe")
  await firebase
    .firestore()
    .collection(`users/${board}/recipes`)
    .doc(recipe.id)
    .update(recipe, { merge: true })
  // }
}

const deleteRecipe = async (recipe, board) => {
  if (board === null) return
  console.log("deleting recipe")
  await firebase
    .firestore()
    .collection(`users/${board}/recipes`)
    .doc(recipe.id)
    .delete()
}

const setLocalStorage = async () => {
  const user = firebase.auth().currentUser
  if (user === null) return
  const snapshot = await firebase
    .firestore()
    .collection("users")
    .doc(user.uid)
    .get()
  let recipiaUser = snapshot.data()
  if (recipiaUser !== undefined && typeof window !== "undefined") {
    localStorage.setItem("recipiaUser", JSON.stringify(recipiaUser))
  }
}

const getLocalStorage = () => {
  if (typeof window !== "undefined") {
    let recipiaUser = JSON.parse(localStorage.getItem("recipiaUser"))
    return recipiaUser === undefined ? null : recipiaUser
  }
}

export {
  setLocalStorage,
  getLocalStorage,
  addRecipe,
  updateRecipe,
  deleteRecipe,
  updateMealPlan,
  addMealPlan,
}
