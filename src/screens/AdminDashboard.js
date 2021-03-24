import React, { useEffect, useState } from 'react'
import { View, StyleSheet, TouchableOpacity, TouchableHighlight, Keyboard, Text, Alert } from 'react-native'
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
import Checkbox from "react-native-checkbox-animated";
import { Icon } from 'react-native-elements'
import { Feather } from '@expo/vector-icons';

const AdminDashboard = () => {
  const [data, setData] = React.useState({
    questions: [],
    forms: [],
    answerMethods: [],
    timestamp: [],
    status: [],
    location: false,
    signature: false
  })

  async function getQuestions() {
    try {
      data.questions = []
      data.answerMethods = []
      data.forms = []
      data.timestamp = []
      data.status = []
      var tempQuestions = await firebase.firestore().collection('Questions').orderBy("createdAt", "asc").get()
      tempQuestions.docs.map(doc => data.questions.push(doc.id));
      tempQuestions.docs.map(doc => data.answerMethods.push(doc.data()));
      tempQuestions.docs.map(doc => data.timestamp.push(doc.data().createdAt))
      tempQuestions.docs.map(doc => data.status.push(doc.data().status))
      data.questions.map(data => setData(previousData => ({ ...previousData, questions: previousData.questions.concat(data) })))
      data.answerMethods.map(data => setData(previousData => ({ ...previousData, answerMethods: previousData.answerMethods.concat(data) })))
      data.timestamp.map(data => setData(previousData => ({ ...previousData, timestamp: previousData.timestamp.concat(data) })))
      data.status.map(data => setData(previousData => ({ ...previousData, status: previousData.status.concat(data) })))

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
            createdAt: data.timestamp[i],
            status: data.status[i],
            voice: data.answerMethods[i].voice,
            video: data.answerMethods[i].video
          });
      }
      Alert.alert(
        'İşlem Başarılı',
        'Sorular Güncellendi',
        [
          { text: 'Tamam' },
        ],
        { cancelable: false }
      )
      getQuestions()
    } catch (e) {
      alert("Soru Güncelleme Sırasında Hata Oluştu, Lütfen Tüm Alanları Eksiksiz Doldurun")
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
    data.answerMethods.push({ text: false, photo: false, voice: false, video: false })
    data.questions.push('')
    data.timestamp.push(currentTime)
    data.status.push(true)
    setData({
      ...data,
      questions: data.questions,
      answerMethods: data.answerMethods,
      timestamp: data.timestamp,
      status: data.status
    })
    CreateQuestionForm()
  }
  function deleteQuestion(index) {
    data.answerMethods.splice(index, 1)
    data.questions.splice(index, 1)
    data.timestamp.splice(index, 1)
    data.status.splice(index, 1)
    setData({
      ...data,
      questions: data.questions,
      answerMethods: data.answerMethods,
      timestamp: data.timestamp,
      status: data.status
    })
    CreateQuestionForm()
  }
  function questionDown(index) {
    if (index < (data.questions.length - 1)) {
      var tempTime = data.timestamp[(index + 1)].seconds
      data.timestamp[(index + 1)].seconds = data.timestamp[index].seconds
      data.timestamp[index].seconds = tempTime
      updateQuestions()
    }
  }
  function questionUp(index) {
    if (index > 0) {
      var tempTime = data.timestamp[(index - 1)].seconds
      data.timestamp[(index - 1)].seconds = data.timestamp[index].seconds
      data.timestamp[index].seconds = tempTime
      updateQuestions()
    }
  }
  function changeCheckboxText(index) {
    data.answerMethods[index].text = !data.answerMethods[index].text;
    //updateQuestions()
  }
  function changeCheckboxPhoto(index) {
    data.answerMethods[index].photo = !data.answerMethods[index].photo;
    //updateQuestions()
  }
  function changeCheckboxVoice(index) {
    data.answerMethods[index].voice = !data.answerMethods[index].voice;
    //updateQuestions()
  }
  function changeCheckboxVideo(index) {
    data.answerMethods[index].video = !data.answerMethods[index].video;
    //updateQuestions()
  }
  function activityStatus(index) {
    data.status[index] = !data.status[index]
  }
  function changeCheckboxSignature() {
    data.signature = !data.signature
    updateSignatureAndLocationInformations()
  }
  function changeCheckboxLocation() {
    data.location = !data.location
    updateSignatureAndLocationInformations()
  }
  function updateSignatureAndLocationInformations() {
    firebase.firestore().collection("SignatureAndLocationInformation").doc("Informations")
      .set({
        location: data.location,
        signature: data.signature
      });
  }
  async function getSignatureAndLocationInformations() {
    const signatureAndLocation = await firebase.firestore().collection('SignatureAndLocationInformation')
      .doc("Informations").get()
    data.location = signatureAndLocation.data().location
    data.signature = signatureAndLocation.data().signature
    setData({
      ...data,
      location: data.location,
      signature: data.signature
    })
  }
  function QuestionForm(index) {
    return (
      <Card style={{ flex: 1, width: "100%", marginTop: "2%", backgroundColor: data.status[index] ? "white" : "tomato" }} key={index}>
        <View style={{ flexDirection: "row" }}>
          <View style={{ flex: 1 }}>
            <Card.Title title={"Soru " + (index + 1)} />
          </View>
          <View style={{ flex: 0.80, marginTop: "2%", marginRight: "1%" }}>
            <Checkbox
              label={data.status[index] ? "Aktif" : "Pasif"}
              labelContainerStyle={{ marginLeft: "12%" }}
              onValueChange={() => activityStatus(index)}
              checked={data.status[index]}
              size={28}
              checkedBackgroundColor={"#4630EB"}
              checkMarkSize={20}
              checkMarkColor={"white"}
              checkPosition={"right"}
              checkboxContainerStyle={{ padding: 0, margin: 0 }}
              animationType={false}
            />
          </View>
          <View style={{ flex: 0.25, marginTop: "4%", marginRight: "1%" }}>
            <TouchableOpacity style={{
              alignItems: 'center', justifyContent: 'center',
              backgroundColor: "red",
              borderRadius: 3,
              marginLeft: "2%",
              paddingVertical: "3%"
            }} onPress={() => { deleteQuestion(index) }} underlayColor='transparent'>
              <Icon name="delete" size={24} color="white" />
            </TouchableOpacity>
          </View>
          <View style={{ flex: 0.25, marginTop: "4%", marginRight: "1%" }}>
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
          <TextInput
            //label={"Soru " + (index + 1)}
            // onSubmitEditing={Keyboard.dismiss}
            // autoCorrect={false}
            placeholder={data.questions[index]}
            key={index}
            //value={data.questions[index]}
            onChangeText={(text) => questionInputChange(text, index)}
          />
          <Paragraph>Cevaplandırma Yöntemi</Paragraph>
          <View style={{ flex: 2, flexDirection: "row" }}>
            <View style={{ flex: 1, marginTop: "2%", marginLeft: "7.5%" }}>
              <Checkbox
                label="Metin/Rakam"
                onValueChange={() => changeCheckboxText(index)}
                checked={data.answerMethods[index].text}
                size={25}
                checkedBackgroundColor={"#4630EB"}
                checkMarkSize={20}
                checkMarkColor={"white"}
                checkboxContainerStyle={{ padding: 0, margin: 0 }}
                animationType={false}
              />
              <Checkbox
                label="Fotoğraf"
                onValueChange={() => changeCheckboxPhoto(index)}
                checked={data.answerMethods[index].photo}
                size={25}
                checkedBackgroundColor={"#4630EB"}
                checkMarkSize={20}
                checkMarkColor={"white"}
                checkboxContainerStyle={{ padding: 0, margin: 0 }}
                animationType={false}
              />
            </View>
            <View style={{ flex: 1, marginTop: "2%", alignItems: "center" }}>
              <Checkbox
                label="Ses"
                onValueChange={() => changeCheckboxVoice(index)}
                checked={data.answerMethods[index].voice}
                size={25}
                checkedBackgroundColor={"#4630EB"}
                checkMarkSize={20}
                checkMarkColor={"white"}
                checkboxContainerStyle={{ padding: 0, margin: 0 }}
                containerStyle={{ width: "63%" }}
                checkPosition={"right"}
                animationType={false}
              />
              <Checkbox
                label="Video"
                onValueChange={() => changeCheckboxVideo(index)}
                checked={data.answerMethods[index].video}
                size={25}
                checkedBackgroundColor={"#4630EB"}
                checkMarkSize={20}
                checkMarkColor={"white"}
                checkboxContainerStyle={{ padding: 0, margin: 0 }}
                containerStyle={{ width: "63%" }}
                checkPosition={"right"}
                animationType={false}
              />
            </View>
          </View>
        </Card.Content>
      </Card>
    )
  }
  function signatureAndLocationInfo(index) {
    return (
      <Card style={{ flex: 1, width: "100%", marginTop: "2%" }} key={index}>
        <View style={{ flex: 1 }}>
          <Card.Title title={"İmza ve Konum Bilgisi"} />
        </View>
        <Card.Content>
          <View style={{ flex: 2, flexDirection: "row" }}>
            <View style={{ flex: 1, marginTop: "2%", marginRight: "1%" }}>
              <Checkbox
                label="İmza Gerekli"
                onValueChange={() => changeCheckboxSignature()}
                checked={data.signature}
                size={25}
                checkedBackgroundColor={"#4630EB"}
                checkMarkSize={20}
                checkMarkColor={"white"}
                checkboxContainerStyle={{ padding: 0, margin: 0 }}
                animationType={false}
              />
              <Checkbox
                label="Konum Gerekli"
                onValueChange={() => changeCheckboxLocation()}
                checked={data.location}
                size={25}
                checkedBackgroundColor={"#4630EB"}
                checkMarkSize={20}
                checkMarkColor={"white"}
                checkboxContainerStyle={{ padding: 0, margin: 0 }}
                animationType={false}
              />
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
    for (let i = 0; i < data.questions.length; i++) {
      data.forms.push(QuestionForm(i))
      if (i == (data.questions.length - 1)) {
        try {
          getSignatureAndLocationInformations()
          data.forms.push(signatureAndLocationInfo(i + 1))
        } catch {
          alert("Konum ve İmza Bilgileri Alınamadı")
        }
      }
    }
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
      <Button mode="outlined" style={{ backgroundColor: "lime" }} onPress={addQuestion}>
        Soru Ekle
    </Button>
      <Button mode="outlined" style={{ backgroundColor: "lime" }} onPress={updateQuestions}>
        Soruları Kaydet/Güncelle
    </Button>
      <Button mode="outlined" style={{ backgroundColor: "red" }} onPress={logoutUser}>
        Çıkış Yap
    </Button>
    </Background>
  )
}
export default AdminDashboard
