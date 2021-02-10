import React, { useEffect, useState } from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
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
import { render } from 'react-dom'

const AdminDashboard = () => {
  const [data, setData] = React.useState({
    questions: [],
    forms: []
  })
  async function getQuestions() {
    try {
      data.questions = []
      var tempQuestions = await firebase.firestore().collection('Questions').get()
      tempQuestions.docs.map(doc => data.questions.push(doc));
      data.questions.map(data => setData(previousData => ({ ...previousData, questions: previousData.questions.concat(data) })))
      //console.log(data.questions.length)
      if (data.questions.length != data.forms.length) {
        CallFormCreater()
      }
    } catch (e) {
      alert("Sorular Alınırken Hata Oluştu - " + e)
    }
  }
  function QuestionForm(index) {
    return (
      <TextInput
        label="soru"
        returnKeyType="next"
        key={index}
        value={data.questions[index].id}
      //onChangeText={(text) => setName({ value: text, index })}
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
      <Button mode="outlined" onPress={logoutUser}>
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
