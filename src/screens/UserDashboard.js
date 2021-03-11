import React, { useEffect, useState } from 'react'
import { View, StyleSheet, TouchableOpacity, Keyboard, Text, Alert } from 'react-native'
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
import LocationDetector from '../components/LocationDetector'
import { useSelector, useDispatch } from 'react-redux'

const UserDashboard = ({ navigation }) => {
  const [data, setData] = React.useState({
    questions: [],
    forms: [],
    answerMethods: [],
    answers: [],
    currentUser: [],
    answerCount: [],
    signatureAndLocation: { signature: false, location: false },
  })

  let address = useSelector(state => {
    return state
  })

  async function getQuestions() {
    try {
      data.questions = []
      data.answerMethods = []
      data.forms = []
      data.answers = []
      data.answerCount = []
      var tempQuestions = await firebase.firestore().collection('Questions').orderBy("createdAt", "asc").get()
      data.currentUser = await firebase.firestore().collection('Users').doc(firebase.auth().currentUser.uid).get()
      tempQuestions.docs.map(doc => doc.data().status ? data.questions.push(doc.id) : "");
      tempQuestions.docs.map(doc => doc.data().status ? data.answerMethods.push(doc.data()) : "");
      data.questions.map(data => setData(previousData => ({ ...previousData, questions: previousData.questions.concat(data) })))
      data.answerMethods.map(data => setData(previousData => ({ ...previousData, answerMethods: previousData.answerMethods.concat(data) })))

      if (data.questions.length != data.forms.length) {
        await getSignatureAndLocationInformations()
        CallCreateQuestionForm()
      }
    } catch (e) {
      Alert.alert(
        'Hata',
        "Sorular Alınırken Hata Oluştu - " + e,
        [
          //{ text: 'Cancel', onPress: () => console.log('Cancel Pressed!') },
          { text: 'Tamam', onPress: getQuestions },
        ],
        { cancelable: false }
      )
    }
  }
  function answerInputChange(val, index) {
    if (data.answerMethods[index].photo || data.answerMethods[index].voice || data.answerMethods[index].video) {
      if (data.answers[index] == 'undefined' || data.answers[index] == null)
        data.answers[index] = []
      data.answers[index] += val
    }
    else
      data.answers[index] = val
    setData({
      ...data,
      answers: data.answers,
    })
  }
  function answerCounter() {
    let counter = 0
    for (let i = 0; i < data.answerMethods.length; i++) {
      if (data.answerMethods[i].photo)
        counter++
      if (data.answerMethods[i].text)
        counter++
      if (data.answerMethods[i].voice)
        counter++
      if (data.answerMethods[i].video)
        counter++
    }
    if (data.signatureAndLocation.location)
      counter++
    if (data.signatureAndLocation.signature)
      counter++
    return counter
  }
  async function sendReport() {
    try {
      var currentTime = new Date()
      currentTime.setHours(currentTime.getHours() + 3)
      answerCounter()
      if (data.answerCount.length >= answerCounter()) {
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
          if (i == data.answers.length - 1) {
            if (data.signatureAndLocation.location) {
              await firebase.firestore()
                .collection('Reports')
                .doc(data.currentUser.data().name + " " + data.currentUser.data().surname + " " + data.currentUser.data().identityNumber)
                .collection("Reports")
                .doc(currentTime.toUTCString() + ' Tarihli Rapor')
                .set({
                  Adres: address
                }, { merge: true })
            }
            if (data.signatureAndLocation.signature) {

            }
          }
        }
        Alert.alert(
          'Teşekkürler',
          'Raporlama Başarılı',
          [
            //{ text: 'Cancel', onPress: () => console.log('Cancel Pressed!') },
            { text: 'Tamam', onPress: getQuestions },
          ],
          { cancelable: false }
        )
      } else {
        Alert.alert(
          'Hata',
          'Tüm Cevap Seçenekleri Eksiksiz Doldurulmalı',
          [
            { text: 'Tamam' },
          ],
          { cancelable: false }
        )
      }
    }
    catch (e) {
      alert("Raporlama Başarısız " + e)
    }
  }
  function setPhotoAnswer(index) {
    if (data.answerMethods[index].text || data.answerMethods[index].video || data.answerMethods[index].voice) {
      navigation.navigate('CameraScreenPhoto')
      if (data.answers[index] == 'undefined' || data.answers[index] == null)
        data.answers[index] = []
      data.answers[index] += " - Fotoğraf Cihaza Kaydedildi - "
    }
    else {
      navigation.navigate('CameraScreenPhoto')
      data.answers[index] = " Fotoğraf Cihaza Kaydedildi "
    }
    data.answerCount.push('')
  }
  function setVideoAnswer(index) {
    if (data.answerMethods[index].text || data.answerMethods[index].photo || data.answerMethods[index].voice) {
      navigation.navigate('CameraScreenVideo')
      if (data.answers[index] == 'undefined' || data.answers[index] == null)
        data.answers[index] = []
      data.answers[index] += " - Video Cihaza Kaydedildi -"
    }
    else {
      navigation.navigate('CameraScreenVideo'),
        data.answers[index] = " - Video Cihaza Kaydedildi -"
    }
    data.answerCount.push('')
  }
  function setVoiceAnswer(index) {
    if (data.answerMethods[index].text || data.answerMethods[index].photo || data.answerMethods[index].video) {
      navigation.navigate('AudioRecordScreen')
      if (data.answers[index] == 'undefined' || data.answers[index] == null)
        data.answers[index] = []
      data.answers[index] += " - Ses Kaydı Cihaza Kaydedildi -"
    }
    else {
      navigation.navigate('AudioRecordScreen')
      data.answers[index] = " - Ses Kaydı Cihaza Kaydedildi -"
    }
    data.answerCount.push('')
  }
  function TextInputCounter() {
    data.answerCount.push('')
  }
  function locationCounter() {
    data.answerCount.push('')
    console.log('girdim')
  }
  async function getSignatureAndLocationInformations() {
    const signatureAndLocation = await firebase.firestore().collection('SignatureAndLocationInformation')
      .doc("Informations").get()
    data.signatureAndLocation.location = signatureAndLocation.data().location
    data.signatureAndLocation.signature = signatureAndLocation.data().signature
    setData({
      ...data,
      signatureAndLocation: data.signatureAndLocation
    })
  }
  function QuestionForm(index) {
    if (data.answerMethods[index].text == true) {
      data.forms.push(
        <View style={{ width: "100%", marginTop: "1%" }} key={index + " Text"}>
          <Text>
            Soru {(index + 1)}: {data.questions[index]}
          </Text>
          <TextInput
            placeholder="Cevabınız"
            key={index}
            //onChangeText={(text) => answerInputChange(text, index)}
            onEndEditing={(e) => { answerInputChange(e.nativeEvent.text, index); TextInputCounter() }}
          />
        </View>
      )
    }
    if (data.answerMethods[index].photo == true) {
      data.answerMethods[index].text ? data.forms.push(
        <View style={{ width: "100%" }} key={index + " Photo"}>
          <Button mode="outlined" style={{ backgroundColor: "lightblue" }} key={index + " Photo"} onPress={() => setPhotoAnswer(index)}>
            Fotoğraf Çek
      </Button>
        </View>) :
        data.forms.push(
          <View style={{ width: "100%", marginTop: "1%" }} key={index + " Photo"}>
            <Text>
              Soru {(index + 1)}: {data.questions[index]}
            </Text>
            <Button mode="outlined" style={{ backgroundColor: "lightblue" }} key={index + " Photo"} onPress={() => setPhotoAnswer(index)}>
              Fotoğraf Çek
        </Button>
          </View>
        )
    }
    if (data.answerMethods[index].voice == true) {
      data.answerMethods[index].text || data.answerMethods[index].photo ? data.forms.push(
        <View style={{ width: "100%" }} key={index + " Voice"}>
          <Button mode="outlined" style={{ backgroundColor: "lightblue" }} key={index + " Voice"} onPress={() => setVoiceAnswer(index)}>
            Ses Kaydet
      </Button>
        </View>) :
        data.forms.push(
          <View style={{ width: "100%", marginTop: "1%" }} key={index + " Voice"}>
            <Text>
              Soru {(index + 1)}: {data.questions[index]}
            </Text>
            <Button mode="outlined" style={{ backgroundColor: "lightblue" }} key={index + " Voice"} onPress={() => setVoiceAnswer(index)}>
              Ses Kaydet
        </Button>
          </View>
        )
    }
    if (data.answerMethods[index].video == true) {
      data.answerMethods[index].text || data.answerMethods[index].photo
        || data.answerMethods[index].voice ? data.forms.push(
          <View style={{ width: "100%" }} key={index + " Video"}>
            <Button mode="outlined" style={{ backgroundColor: "lightblue" }} key={index + " Video"} onPress={() => setVideoAnswer(index)}>
              Video Çek
      </Button>
          </View>) :
        data.forms.push(
          <View style={{ width: "100%", marginTop: "1%" }} key={index + " Video"}>
            <Text>
              Soru {(index + 1)}: {data.questions[index]}
            </Text>
            <Button mode="outlined" style={{ backgroundColor: "lightblue" }} key={index + " Video"} onPress={() => setVideoAnswer(index)}>
              Video Çek
        </Button>
          </View>
        )
    }
    if (index == data.questions.length - 1) {
      if (data.signatureAndLocation.signature || data.signatureAndLocation.location) {
        data.forms.push(
          <Card style={{ flex: 1, width: "100%", marginTop: "2%" }} key={index}>
            <View style={{ flex: 1 }}>
              <Card.Title title={"İmza ve Konum Bilgisi"} />
            </View>
            <Card.Content>
              <View style={{ flex: 1, flexDirection: "row" }}>
                <View style={{ flex: 1, marginTop: "2%", marginRight: "1%" }}>
                  {data.signatureAndLocation.signature ? <Button mode="outlined" style={{ backgroundColor: "lime" }} >
                    İmza Ekle
                  </Button> : <Button mode="outlined" disabled="true" style={{ backgroundColor: "gray" }} >
                    İmza Ekleme Gerekli Değil
                  </Button>}
                  {data.signatureAndLocation.location ?
                    <LocationDetector locationCounter={locationCounter} /> : <Button mode="outlined" disabled="true" style={{ backgroundColor: "gray" }} >
                      Konum Ekleme Gerekli Değil
                  </Button>}
                </View>
              </View>
            </Card.Content>
          </Card>
        )
      }
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
      QuestionForm(i)
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

      {/* <View
        style={{
          borderWidth: 0.5,
          borderColor: 'gray',
          margin: 10,
          width: "100%"
        }}
      /> */}
      <Button mode="contained" style={{ marginTop: "4%" }} onPress={sendReport}>
        Cevapları Gönder
    </Button>
      <Button mode="outlined" style={{ backgroundColor: "red" }} onPress={logoutUser}>
        Çıkış Yap
    </Button>
    </Background>
  )
}

export default UserDashboard
