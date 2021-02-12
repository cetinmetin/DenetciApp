import React, { useEffect, useState } from 'react'
import { View, StyleSheet, TouchableOpacity, Keyboard, } from 'react-native'
import Background from '../components/Background'
import Logo from '../components/Logo'
import Header from '../components/Header'
import Paragraph from '../components/Paragraph'
import Button from '../components/Button'
import TextInput from '../components/TextInput'
import { logoutUser } from '../api/auth-api'
import firebase from 'firebase/app'
import 'firebase/auth'
import "firebase/firestore";

const AdminDashboard = () => {
  const [data, setData] = React.useState({
    questions: [],
    forms: [],
    newQuestions: [],
    answerMethods: []
  })
  async function getQuestions() {
    try {
      data.questions = []
      data.answerMethods = []
      data.forms = []
      var tempQuestions = await firebase.firestore().collection('Questions').get()
      tempQuestions.docs.map(doc => data.questions.push(doc.id));
      tempQuestions.docs.map(doc => data.answerMethods.push(doc.data().Qmethod));
      data.questions.map(data => setData(previousData => ({ ...previousData, questions: previousData.questions.concat(data) })))
      data.answerMethods.map(data => setData(previousData => ({ ...previousData, answerMethods: previousData.answerMethods.concat(data) })))
      if (data.questions.length != data.forms.length) {
        CallFormCreater()
      }
    } catch (e) {
      alert("Sorular Alınırken Hata Oluştu - " + e)
    }
  }
  async function updateQuestions() {
    var documentsToBeDeleted = await firebase.firestore().collection('Questions').get()
    var documentsToBeDeletedArray = []
    documentsToBeDeleted.docs.map(doc => documentsToBeDeletedArray.push(doc.id));
    for (let i = 0; i < documentsToBeDeletedArray.length; i++) {
      firebase.firestore().collection("Questions").doc(documentsToBeDeletedArray[i]).delete()
    }
    for (let i = 0; i < data.questions.length; i++) {
      firebase.firestore().collection("Questions").doc(data.questions[i])
        .set({
          Qmethod: "picture"
        });
      console.log(data.questions[i])
    }
    getQuestions()

  }
  function questionInputChange(val, index) {
    data.questions[index] = val
    setData({
      ...data,
      questions: data.questions
    })
  }
  function QuestionForm(index) {
    return (
      <TextInput
        //label={"Soru " + (index + 1)}
        // onSubmitEditing={Keyboard.dismiss}
        // autoCorrect={false}
        placeholder={data.questions[index]}
        key={index}
        //value={data.questions[index]}
        onChangeText={(text) => questionInputChange(text, index)}
      />
    )
  }
  const CallFormCreater = () => {
    if (data.questions.length > 0 && data.forms.length != data.questions.length)
      CreateQuestionForm()
    else
      getQuestions()
  }
  const CreateQuestionForm = () => {
    //console.log(data.questions.length + " createform")
    data.forms = []
    for (let i = 0; i < data.questions.length; i++) {
      data.forms.push(QuestionForm(i))
    }
    data.forms.map(data => setData(previousData => ({ ...previousData, forms: previousData.forms.concat(data) })))
  }
  useEffect(() => {
    getQuestions()
  }, [])

  return (
    <Background>
      <Logo />
      <Header>Yönetici Paneli</Header>
      <Paragraph>
        Soru Ekleme ve Düzenleme
    </Paragraph>
      {data.forms}
      <Button mode="outlined" onPress={updateQuestions}>
        Soru Ekle
    </Button>
      <Button mode="outlined" onPress={logoutUser}>
        Soruları Kaydet/Güncelle
    </Button>
      <Button mode="outlined" onPress={logoutUser}>
        Çıkış Yap
    </Button>
    </Background>
  )
}
export default AdminDashboard
