import firebase from 'firebase/app'
import 'firebase/auth'
import "firebase/firestore";

export const logoutUser = () => {
  firebase.auth().signOut()
}

export const signInUser = async ({ name, surname, identityNumber, email, password}) => {
  try {
    const user = await firebase
      .auth()
      .createUserWithEmailAndPassword(email, password)
    firebase.firestore()
      .collection('Users')
      .doc(firebase.auth().currentUser.uid)
      .set({
        email: email,
        name: name,
        surname: surname,
        identityNumber: identityNumber,
        uid: firebase.auth().currentUser.uid
      })

    firebase.auth().currentUser.updateProfile({
      displayName: name,
    })
    return { user }
  } catch (error) {
    return {
      error: error.message,
    }
  }
}

export const loginUser = async ({ email, password }) => {
  try {
    const user = await firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
    return { user }
  } catch (error) {
    return {
      error: error.message,
    }
  }
}

export const sendEmailWithPassword = async (email) => {
  try {
    await firebase.auth().sendPasswordResetEmail(email)
    return {}
  } catch (error) {
    return {
      error: error.message,
    }
  }
}
