import * as React from "react"
import firebase from "gatsby-plugin-firebase"

const useRecipes = userID => {
  const [isLoading, setIsLoading] = React.useState(true)
  const [recipes, setRecipes] = React.useState(null)
  const [currentBoard, setCurrentBoard] = React.useState("")
  React.useEffect(() => {
    let userToFind = userID
    if (!userToFind || userToFind == "") return

    if (userToFind === currentBoard) return
    setCurrentBoard(userToFind)
    const unsubscribe = firebase
      .firestore()
      .collection(`users/${userToFind}/recipes`)
      .onSnapshot(
        snapshot => {
          if (snapshot.size) {
            let foundRecipes = []
            snapshot.forEach(recipe => {
              foundRecipes.push(recipe.data())
            })
            setRecipes(foundRecipes)
          } else {
            setRecipes([])
          }
          setIsLoading(false)
        },
        error => {
          console.log(error)
          setRecipes([])
          setIsLoading(false)
        }
      )

    return () => {
      unsubscribe()
    }
  }, [userID])

  return {
    isLoading,
    recipes,
  }
}

export default useRecipes
