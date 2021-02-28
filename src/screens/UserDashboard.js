import React, { useEffect, useState } from 'react'
import { View, StyleSheet, TouchableOpacity, Keyboard, Text } from 'react-native'
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
import { Card } from 'react-native-paper';
import Checkbox from 'expo-checkbox';

const UserDashboard = ({ navigation }) => {
  const [data, setData] = React.useState({
    questions: [],
    forms: [],
    answerMethods: [],
    answers: [],
    currentUser: []
  })
  async function getQuestions() {
    try {
      data.questions = []
      data.answerMethods = []
      data.forms = []
      data.answers = []
      var tempQuestions = await firebase.firestore().collection('Questions').orderBy("createdAt", "asc").get()
      data.currentUser = await firebase.firestore().collection('Users').doc(firebase.auth().currentUser.uid).get()
      tempQuestions.docs.map(doc => data.questions.push(doc.id));
      tempQuestions.docs.map(doc => data.answerMethods.push(doc.data()));
      data.questions.map(data => setData(previousData => ({ ...previousData, questions: previousData.questions.concat(data) })))
      data.answerMethods.map(data => setData(previousData => ({ ...previousData, answerMethods: previousData.answerMethods.concat(data) })))
      if (data.questions.length != data.forms.length) {
        CallCreateQuestionForm()
      }
    } catch (e) {
      alert("Sorular Alınırken Hata Oluştu - " + e)
    }
  }
  function answerInputChange(val, index) {
    data.answers[index] = val
    setData({
      ...data,
      answers: data.answers
    })
  }
  async function sendReport() {
    try {
      var currentTime = new Date()
      currentTime.setHours(currentTime.getHours() + 3)
      if (data.questions.length == data.answers.length) {
        for (let i = 0; i < data.answers.length; i++) {
          //veritabanında field oluşturma
          await firebase.firestore()
            .collection('Reports')
            .doc(data.currentUser.data().name + " " + data.currentUser.data().surname + " " + data.currentUser.data().identityNumber)
            .set({ isim: data.currentUser.data().name })
          //field oluşturduktan sonra raporu günderme
          await firebase.firestore()
            .collection('Reports')
            .doc(data.currentUser.data().name + " " + data.currentUser.data().surname + " " + data.currentUser.data().identityNumber)
            .collection("Reports")
            .doc(currentTime.toUTCString() + ' Tarihli Rapor')
            .set({
              ["Soru" + (i + 1)]: data.questions[i],
              ["Cevap" + (i + 1)]: data.answers[i]
            }, { merge: true })
        }
      } else {
        alert("Tüm Alanları Eksiksiz Doldurun")
      }
    }
    catch (e) {
      alert("Raporlama Başarısız " + e)
    }
  }
  function setPhotoAnswer(index) {
    if (data.answerMethods[index].photo == true && data.answerMethods[index].text == true) {
      //kamera açma ve fotoğraf çekme işlemleri
      navigation.navigate('CameraScreen')
      /*.then(*/data.answers[index] += " - Fotoğraf Cihaza Kaydedildi - "
    }
    else {
      //kamera açma ve fotoğraf çekme işlemleri
      navigation.navigate('CameraScreen')
      /*.then(*/data.answers[index] = " Fotoğraf Cihaza Kaydedildi "
    }
  }
  function QuestionForm(index) {
    if (data.answerMethods[index].text == true && data.answerMethods[index].photo == false) {
      return (
        <View style={{width: "100%", marginTop: "2%" }} key={index}>
          <Text>
            Soru {(index + 1)}: {data.questions[index]}
          </Text>
          <TextInput
            placeholder="Cevabınız"
            key={index}
            onChangeText={(text) => answerInputChange(text, index)}
          />
        </View>
      )
    }
    else if (data.answerMethods[index].text == false && data.answerMethods[index].photo == true) {
      return (
        <View style={{width: "100%", marginTop: "2%" }} key={index}>
          <Text>
            Soru {(index + 1)}: {data.questions[index]}
          </Text>
          <Button mode="outlined" style={{backgroundColor:"lime"}} onPress={() => setPhotoAnswer(index)}>
            Fotoğraf Çek
        </Button>
        </View>
      )
    }
    else {
      return (
        <View style={{width: "100%", marginTop: "2%" }} key={index}>
          <Text>
            Soru {(index + 1)}: {data.questions[index]}
          </Text>
          <TextInput
            placeholder="Cevabınız"
            key={index}
            onChangeText={(text) => answerInputChange(text, index)}
          />
          <Button mode="outlined" style={{backgroundColor:"lime"}} onPress={() => setPhotoAnswer(index)}>
            Fotoğraf Çek
        </Button>
        </View>
      )
    }
  }
  const CallCreateQuestionForm = () => {
    if (data.questions.length > 0 && data.forms.length != data.questions.length) {
      data.forms = []
      CreateQuestionForm()
    }
    else
      getQuestions()
  }
  const CreateQuestionForm = () => {
    data.forms = []
    for (let i = 0; i < data.questions.length; i++)
      data.forms.push(QuestionForm(i))
    setData({
      ...data,
      forms: data.forms
    })
  }
  useEffect(() => {
    getQuestions()
  }, [])
  return (
    <Background>
      <Logo />
      <Header>Denetçi Ekranı</Header>
      <Paragraph>
        Raporlama
    </Paragraph>
      {data.forms}
      <Button mode="outlined" style={{backgroundColor:"lime"}} onPress={sendReport}>
        Cevapları Gönder
    </Button>
      <Button mode="outlined" style={{backgroundColor:"red"}} onPress={logoutUser}>
        Çıkış Yap
    </Button>
    </Background>
  )
}

export default UserDashboard
