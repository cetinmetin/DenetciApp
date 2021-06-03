import React, { useEffect, useState } from 'react'
import { View, StyleSheet, TouchableOpacity, TouchableHighlight, Keyboard, Text, Alert } from 'react-native'
import Background from '../components/Background'
import Logo from '../components/Logo'
import Header from '../components/Header'
import Paragraph from '../components/Paragraph'
import Button from '../components/Button'
import TextInput from '../components/TextInput'
import { logoutUser } from '../api/auth-api'
import { Card } from 'react-native-paper';
import Checkbox from "react-native-checkbox-animated";
import { Icon } from 'react-native-elements'
import { Feather } from '@expo/vector-icons';
import { useSelector, useDispatch } from "react-redux";
import store from '../redux/store'
import {
  getQuestions, updateQuestions, updateSignatureAndLocationInformations,
  getSignatureAndLocationInformations, getTimeStampAndStatusForQuestions
} from '../DBHelper/DbActions'
import { questionToDown, questionToUp, resetAdminStates } from '../redux/actions/adminActions'
import { resetUserStates } from '../redux/actions/userActions'

const AdminDashboard = () => {
  const [data, setData] = React.useState({
    forms: [],
    questions: [],
    answerMethods: [],
    haveSignature: false,
    haveLocation: false,
    timeStamp: []
  })

  const dispatch = useDispatch()

  const getStatesFromStore = () => {
    data.questions = store.getState().userReducer.questions
    data.answerMethods = store.getState().userReducer.answerMethods
    data.haveSignature = store.getState().userReducer.haveSignature
    data.haveLocation = store.getState().userReducer.haveLocation
    data.timeStamp = store.getState().adminReducer.timeStamps
  }

  async function callAtFirst() {
    try {
      await reset()
      await getQuestions()
      await getSignatureAndLocationInformations()
      await getTimeStampAndStatusForQuestions()
      await getStatesFromStore()
      CallCreateQuestionForm()
    } catch (e) {
      Alert.alert(
        'Hata',
        "Uygulama Başlatılırken Hata Oluştu - " + e,
        [
          { text: 'Tamam' },
        ],
        { cancelable: false }
      )
    }
  }

  async function reset() {
    data.forms = []
    data.questions = []
    data.answerMethods = []
    data.haveSignature = false
    data.haveLocation = false
    data.timeStamp = []
    dispatch(resetAdminStates())
    dispatch(resetUserStates())
    setData({
      ...data,
      forms: data.forms,
      questions: data.questions,
      answerMethods: data.answerMethods,
      haveSignature: false,
      haveLocation: false,
      timeStamp: data.timeStamp
    })
  }

  function questionInputChange(val, index) {
    data.questions[index] = val
  }

  function addQuestion() {
    var currentTime = new Date()
    data.answerMethods.push({ text: false, photo: false, voice: false, video: false, status: true })
    data.questions.push('')
    data.timeStamp.push(currentTime)
    CreateQuestionForm()
  }

  function deleteQuestion(index) {
    data.answerMethods.splice(index, 1)
    data.questions.splice(index, 1)
    data.timeStamp.splice(index, 1)
    CreateQuestionForm()
  }

  async function questionDown(index) {
    if (index < (data.questions.length - 1)) {
      dispatch(questionToDown(index))
      await updateQuestions(data.questions, data.answerMethods, data.timeStamp)
      callAtFirst()
    }
  }

  async function questionUp(index) {
    if (index > 0) {
      dispatch(questionToUp(index))
      await updateQuestions(data.questions, data.answerMethods, data.timeStamp)
      callAtFirst()
    }
  }

  function changeCheckboxText(index) {
    data.answerMethods[index].text = !data.answerMethods[index].text;
  }
  function changeCheckboxPhoto(index) {
    data.answerMethods[index].photo = !data.answerMethods[index].photo;
  }
  function changeCheckboxVoice(index) {
    data.answerMethods[index].voice = !data.answerMethods[index].voice;
  }
  function changeCheckboxVideo(index) {
    data.answerMethods[index].video = !data.answerMethods[index].video;
  }
  function activityStatus(index) {
    data.answerMethods[index].status = !data.answerMethods[index].status
  }
  function changeCheckboxSignature() {
    data.haveSignature = !data.haveSignature
    updateSignatureAndLocationInformations(data.haveLocation, data.haveSignature)
  }
  function changeCheckboxLocation() {
    data.haveLocation = !data.haveLocation
    updateSignatureAndLocationInformations(data.haveLocation, data.haveSignature)
  }
  function QuestionForm(index) {
    return (
      <Card style={{ flex: 1, width: "100%", marginTop: "2%", backgroundColor: data.answerMethods[index].status ? "white" : "tomato" }} key={index}>
        <View style={{ flexDirection: "row" }}>
          <View style={{ flex: 1 }}>
            <Card.Title title={"Soru " + (index + 1)} />
          </View>
          <View style={{ flex: 0.80, marginTop: "2%", marginRight: "1%" }}>
            <Checkbox
              label={data.answerMethods[index].status ? "Aktif" : "Pasif"}
              labelContainerStyle={{ marginLeft: "12%" }}
              onValueChange={() => activityStatus(index)}
              checked={data.answerMethods[index].status}
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
            placeholder={data.questions[index]}
            key={index}
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
                checked={data.haveSignature}
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
                checked={data.haveLocation}
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
      CreateQuestionForm()
    }
  }
  const CreateQuestionForm = () => {
    var formsTemp = []
    for (let i = 0; i < data.questions.length; i++) {
      formsTemp.push(QuestionForm(i))
      if (i == (data.questions.length - 1)) {
        try {
          formsTemp.push(signatureAndLocationInfo(i + 1))
        } catch {
          alert("Konum ve İmza Bilgileri Alınamadı")
        }
      }
    }
    setData({
      ...data,
      forms: formsTemp
    })
  }
  useEffect(() => {
    callAtFirst()
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
      <Button mode="outlined" style={{ backgroundColor: "lime" }} onPress={async () => {
        await updateQuestions(data.questions, data.answerMethods, data.timeStamp)
        await callAtFirst()
      }}>
        Soruları Kaydet/Güncelle
    </Button>
      <Button mode="outlined" style={{ backgroundColor: "red" }} onPress={logoutUser}>
        Çıkış Yap
    </Button>
    </Background >
  )
}
export default AdminDashboard
