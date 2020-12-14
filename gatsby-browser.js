import "firebase/auth"
import "firebase/firestore"
import "firebase/functions"
import "firebase/database"
import firebase from "gatsby-plugin-firebase"

if (process.env.NODE_ENV === "development") {
    firebase.functions().useFunctionsEmulator("http://localhost:5001")
  }

/**
 * Implement Gatsby's Browser APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/browser-apis/
 */

// You can delete this file if you're not using it
