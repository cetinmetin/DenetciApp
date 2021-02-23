import React, { useEffect, useState } from 'react'
import { View, StyleSheet, TouchableOpacity, TouchableHighlight, Keyboard, Text } from 'react-native'
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
import { Icon } from 'react-native-elements'
import { Feather } from '@expo/vector-icons';

const AdminDashboard = () => {
  const [data, setData] = React.useState({
    questions: [],
    forms: [],
    answerMethods: [],
    timestamp: []
  })

  async function getQuestions() {
    try {
      data.questions = []
      data.answerMethods = []
      data.forms = []
      data.timestamp = []
      var tempQuestions = await firebase.firestore().collection('Questions').orderBy("createdAt", "asc").get()
      tempQuestions.docs.map(doc => data.questions.push(doc.id));
      tempQuestions.docs.map(doc => data.answerMethods.push(doc.data()));
      tempQuestions.docs.map(doc => data.timestamp.push(doc.data()))
      data.questions.map(data => setData(previousData => ({ ...previousData, questions: previousData.questions.concat(data) })))
      data.answerMethods.map(data => setData(previousData => ({ ...previousData, answerMethods: previousData.answerMethods.concat(data) })))
      data.timestamp.map(data => setData(previousData => ({ ...previousData, timestamp: previousData.timestamp.concat(data) })))

      if (data.questions.length != data.forms.length) {
        CallCreateQuestionForm()
      }
    } catch (e) {
      alert("Sorular Alınırken Hata Oluştu - " + e)
    }
  }
  async function updateQuestions() {
    try {
      var documentsToBeDeleted = await firebase.firestore().collection('Questions').get()
      var documentsToBeDeletedArray = []
      documentsToBeDeleted.docs.map(doc => documentsToBeDeletedArray.push(doc.id));
      for (let i = 0; i < documentsToBeDeletedArray.length; i++) {
        firebase.firestore().collection("Questions").doc(documentsToBeDeletedArray[i]).delete()
      }
      for (let i = 0; i < data.questions.length; i++) {
        firebase.firestore().collection("Questions").doc(data.questions[i])
          .set({
            text: data.answerMethods[i].text,
            photo: data.answerMethods[i].photo,
            createdAt: data.timestamp[i].createdAt
          });
      }
      getQuestions()
    } catch (e) {
      alert("Soru Güncelleme Sırasında Hata Oluştu - " + e)
    }
  }
  function questionInputChange(val, index) {
    data.questions[index] = val
    setData({
      ...data,
      questions: data.questions
    })
  }
  function addQuestion() {
    var currentTime = new Date()
    data.answerMethods.push({ text: false, photo: false })
    data.questions.push('')
    data.timestamp.push({ createdAt: currentTime })
    setData({
      ...data,
      questions: data.questions,
      answerMethods: data.answerMethods,
      timestamp: data.timestamp
    })
    CreateQuestionForm()
  }
  function deleteQuestion(index) {
    data.answerMethods.splice(index, 1)
    data.questions.splice(index, 1)
    data.timestamp.splice(index, 1)
    setData({
      ...data,
      questions: data.questions,
      answerMethods: data.answerMethods,
      timestamp: data.timestamp
    })
    CreateQuestionForm()
  }
  function questionDown(index) {
    if (index < (data.questions.length - 1)) {
      var tempTime = data.timestamp[(index + 1)].createdAt.seconds
      data.timestamp[(index + 1)].createdAt.seconds = data.timestamp[index].createdAt.seconds
      data.timestamp[index].createdAt.seconds = tempTime
      updateQuestions()
    }
  }
  function questionUp(index) {
    if (index > 0) {
      var tempTime = data.timestamp[(index - 1)].createdAt.seconds
      data.timestamp[(index - 1)].createdAt.seconds = data.timestamp[index].createdAt.seconds
      data.timestamp[index].createdAt.seconds = tempTime
      updateQuestions()
    }
  }
  function QuestionForm(index) {
    return (
      <Card style={{ flex: 1, width: "100%", marginTop: "2%" }} key={index}>
        <View style={{ flexDirection: "row" }}>
          <View style={{ flex: 1 }}>
            <Card.Title title={"Soru " + (index + 1)} />
          </View>
          <View style={{ flex: 0.25, marginTop: "4%", marginRight: "5.3%" }}>
            <TouchableOpacity style={{
              alignItems: 'center', justifyContent: 'center',
              backgroundColor: "#4630EB",
              borderRadius: 3,
              marginLeft: "2%",
              paddingVertical: "3%"
            }} onPress={() => { questionUp(index) }} underlayColor='transparent'>
              <Feather name="arrow-up-circle" size={24} color="white" />
            </TouchableOpacity>
          </View>
          <View style={{ flex: 0.25, marginTop: "4%", marginRight: "5.3%" }}>
            <TouchableOpacity style={{
              alignItems: 'center', justifyContent: 'center',
              backgroundColor: "#4630EB",
              borderRadius: 3,
              marginLeft: "2%",
              paddingVertical: "3%"
            }} onPress={() => { questionDown(index) }} underlayColor='transparent'>
              <Feather name="arrow-down-circle" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
        <Card.Content>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ flex: 4 }}>
              <TextInput
                //label={"Soru " + (index + 1)}
                // onSubmitEditing={Keyboard.dismiss}
                // autoCorrect={false}
                placeholder={data.questions[index]}
                key={index}
                //value={data.questions[index]}
                onChangeText={(text) => questionInputChange(text, index)}
              />
            </View>
            <View style={{ flex: 0.72, marginTop: "2%" }}>
              <TouchableOpacity style={{
                alignItems: 'center', justifyContent: 'center',
                backgroundColor: "red",
                borderRadius: 3,
                marginLeft: "2%",
                paddingVertical: "40%"
              }} onPress={() => { deleteQuestion(index) }} underlayColor='transparent'>
                <Icon name="delete" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View>
              <Text>Cevap Seçeneği:</Text>
            </View>
            <View>
              <Checkbox
                value={data.answerMethods[index].text}
                onChange={() => {
                  data.answerMethods[index].text = !data.answerMethods[index].text;
                  setData({ ...data, answerMethods: data.answerMethods });
                  updateQuestions()
                }}
                key={index}
                color={data.answerMethods[index].text ? '#4630EB' : undefined}
              />
            </View>
            <View>
              <Text>Metin</Text>
            </View>
            <View>
              <Checkbox
                value={data.answerMethods[index].photo}
                onChange={() => {
                  data.answerMethods[index].photo = !data.answerMethods[index].photo;
                  setData({ ...data, answerMethods: data.answerMethods });
                  updateQuestions()
                }}
                key={index}
                color={data.answerMethods[index].photo ? '#4630EB' : undefined}
              />
            </View>
            <View>
              <Text>Fotoğraf</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    )
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
      <Header>Yönetici Paneli</Header>
      <Paragraph>
        Soru Ekleme ve Düzenleme
    </Paragraph>
      {data.forms}
      <Button mode="outlined" onPress={addQuestion}>
        Soru Ekle
    </Button>
      <Button mode="outlined" onPress={updateQuestions}>
        Soruları Kaydet/Güncelle
    </Button>
      <Button mode="outlined" onPress={logoutUser}>
        Çıkış Yap
    </Button>
    </Background>
  )
}
export default AdminDashboard
