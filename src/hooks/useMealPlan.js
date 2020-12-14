import * as React from "react"
import firebase from "gatsby-plugin-firebase"

const useMealPlan = userID => {
  const [isLoading, setIsLoading] = React.useState(true)
  const [mealPlan, setMealPlan] = React.useState(null)
  React.useEffect(() => {
    let userToFind = userID
    if (!userToFind || userToFind == "") return
    const unsubscribe = firebase
      .firestore()
      .collection(`users/${userToFind}/mealPlans`)
      .doc("defaultPlan")
      .onSnapshot(
        snapshot => {
          if (snapshot.exists) {
            setMealPlan(snapshot.data())
          } else {
            setMealPlan({})
          }
          setIsLoading(false)
        },
        error => {
          console.log(error)
          setMealPlan({})
          setIsLoading(false)
        }
      )

    return () => {
      unsubscribe()
    }
  }, [userID])

  return {
    isLoading,
    mealPlan,
  }
}

export default useMealPlan
