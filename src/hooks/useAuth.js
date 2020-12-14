import * as React from "react"
import "firebase/firestore"
import firebase from "gatsby-plugin-firebase"

const isBrowser = typeof window !== "undefined"

let auth, db

if (isBrowser) {
  auth = firebase.auth()
  // db = firebase.database()
}

const useAuth = () => {
  const [isLoading, setIsLoading] = React.useState(true)
  const [profile, setProfile] = React.useState(null)

  React.useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user && typeof window !== "undefined") {
        let recipiaUser = localStorage.getItem("recipiaUser")
        if (recipiaUser) {
          recipiaUser = JSON.parse(recipiaUser)
          setProfile({ uid: user.uid, ...recipiaUser })
        } else setProfile(null)
      } else {
        setProfile(null)
      }
      setIsLoading(false)
    })

    // Unsubscribe to the listener when unmounting
    return () => {
      unsubscribe()
    }
  }, [])

  return {
    isLoading,
    isLoggedIn: !!profile,
    profile,
  }
}

const logout = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("recipiaUser")
    auth.signOut()
    window.location.reload()
  }
}

export { auth, logout }
export default useAuth
