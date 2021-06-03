import React, { useEffect, useState } from 'react'
import { View, StyleSheet, TouchableOpacity, Keyboard, Text, Alert, ActivityIndicator } from 'react-native'
import Background from '../components/Background'
import Logo from '../components/Logo'
import Header from '../components/Header'
import Paragraph from '../components/Paragraph'
import Button from '../components/Button'
import TextInput from '../components/TextInput'
import { logoutUser } from '../api/auth-api'

import { Card } from 'react-native-paper';
import Checkbox from 'expo-checkbox';
import LocationDetector from '../components/LocationDetector'
import SignatureCapture from '../components/SignatureCapture'
import { theme } from '../core/theme'
import { getQuestions, getCurrentUser, sendReport, getSignatureAndLocationInformations } from '../DBHelper/DbActions'
import { useSelector, useDispatch } from "react-redux";
import { increaseAnswerCounter, resetUserStates, fillAnswers } from '../redux/actions/userActions'
import store from '../redux/store'

const UserDashboard = ({ navigation }) => {

  const [data, setData] = React.useState({
    forms: [],
    answerCount: [],
    progress: 0
  })

  const dispatch = useDispatch()

  let reportUploadingStatus = useSelector((status) => status.userReducer.statusOfUploading)
  let uploadCounter = useSelector((status) => status.userReducer.counterOfUploads)
  let assetCounter = useSelector((status) => status.userReducer.counterOfAssetAnswers)
  let answerCounter = useSelector((status) => status.userReducer.counterOfAnswers)

  let haveSignature, haveLocation, questions, answerMethods

  store.subscribe(() => {
    haveSignature = store.getState().userReducer.haveSignature
    haveLocation = store.getState().userReducer.haveLocation
    questions = store.getState().userReducer.questions
    answerMethods = store.getState().userReducer.answerMethods
  })

  async function callAtFirst() {
    try {
      await getQuestions()
      await getCurrentUser()
      await getSignatureAndLocationInformations()
      if (questions.length != data.forms.length) {
        CallCreateQuestionForm()
      }
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
    data.answerCount = []
    data.progress = 0
    dispatch(resetUserStates())
    setData({
      forms: [],
      answerCount: [],
      progress: 0
    })
    await callAtFirst()
  }
  function answerInputChange(val, index) {
    dispatch(fillAnswers(val, index))
  }
  function setPhotoAnswer(index) {
    navigation.navigate('CameraScreenPhoto', { questionIndex: index })
  }
  function setVideoAnswer(index) {
    navigation.navigate('CameraScreenVideo', { questionIndex: index })
  }
  function setVoiceAnswer(index) {
    navigation.navigate('AudioRecordScreen', { questionIndex: index })
  }
  function TextInputCounter() {
    dispatch(increaseAnswerCounter())
  }

  function QuestionForm(index) {
    if (answerMethods[index].text == true) {
      data.forms.push(
        <View style={{ width: "100%", marginTop: "1%" }} key={index + " Text"}>
          <Text>
            Soru {(index + 1)}: {questions[index]}
          </Text>
          <TextInput
            placeholder="Cevabınız"
            key={index}
            //onChangeText={(text) => answerInputChange(text, index)}
            onEndEditing={(e) => { e.nativeEvent.text.length > 0 && TextInputCounter(); answerInputChange(e.nativeEvent.text, index); }}
          />
        </View>
      )
    }
    if (answerMethods[index].photo == true) {
      answerMethods[index].text ? data.forms.push(
        <View style={{ width: "100%" }} key={index + " Photo"}>
          <Button mode="outlined" style={{ backgroundColor: "lightblue" }} key={index + " Photo"} onPress={() => setPhotoAnswer(index)}>
            Fotoğraf Çek
      </Button>
        </View>) :
        data.forms.push(
          <View style={{ width: "100%", marginTop: "1%" }} key={index + " Photo"}>
            <Text>
              Soru {(index + 1)}: {questions[index]}
            </Text>
            <Button mode="outlined" style={{ backgroundColor: "lightblue" }} key={index + " Photo"} onPress={() => setPhotoAnswer(index)}>
              Fotoğraf Çek
        </Button>
          </View>
        )
    }
    if (answerMethods[index].voice == true) {
      answerMethods[index].text || answerMethods[index].photo ? data.forms.push(
        <View style={{ width: "100%" }} key={index + " Voice"}>
          <Button mode="outlined" style={{ backgroundColor: "lightblue" }} key={index + " Voice"} onPress={() => setVoiceAnswer(index)}>
            Ses Kaydet
      </Button>
        </View>) :
        data.forms.push(
          <View style={{ width: "100%", marginTop: "1%" }} key={index + " Voice"}>
            <Text>
              Soru {(index + 1)}: {questions[index]}
            </Text>
            <Button mode="outlined" style={{ backgroundColor: "lightblue" }} key={index + " Voice"} onPress={() => setVoiceAnswer(index)}>
              Ses Kaydet
        </Button>
          </View>
        )
    }
    if (answerMethods[index].video == true) {
      answerMethods[index].text || answerMethods[index].photo
        || answerMethods[index].voice ? data.forms.push(
          <View style={{ width: "100%" }} key={index + " Video"}>
            <Button mode="outlined" style={{ backgroundColor: "lightblue" }} key={index + " Video"} onPress={() => setVideoAnswer(index)}>
              Video Çek
      </Button>
          </View>) :
        data.forms.push(
          <View style={{ width: "100%", marginTop: "1%" }} key={index + " Video"}>
            <Text>
              Soru {(index + 1)}: {questions[index]}
            </Text>
            <Button mode="outlined" style={{ backgroundColor: "lightblue" }} key={index + " Video"} onPress={() => setVideoAnswer(index)}>
              Video Çek
        </Button>
          </View>
        )
    }
    if (index == questions.length - 1) {
      if (haveSignature || haveLocation) {
        data.forms.push(
          <Card style={{ flex: 1, width: "100%", marginTop: "2%" }} key={index}>
            <View style={{ flex: 1 }}>
              <Card.Title title={"İmza ve Konum Bilgisi"} />
            </View>
            <Card.Content>
              <View style={{ flex: 1, flexDirection: "row" }}>
                <View style={{ flex: 1, marginTop: "2%", marginRight: "1%" }}>
                  {haveSignature ? <SignatureCapture /> : <Button mode="outlined" disabled="true" style={{ backgroundColor: "gray" }} >
                    İmza Ekleme Gerekli Değil
                  </Button>}
                  {haveLocation ?
                    <LocationDetector /> : <Button mode="outlined" disabled="true" style={{ backgroundColor: "gray" }} >
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
    if (questions.length > 0 && data.forms.length != questions.length) {
      CreateQuestionForm()
    }
    else
      reset()
  }
  const CreateQuestionForm = () => {
    for (let i = 0; i < questions.length; i++)
      QuestionForm(i)
    setData({
      ...data,
      forms: data.forms
    })
  }
  useEffect(() => {
    reset()
  }, [])

  return (
    <Background>
      {reportUploadingStatus ? (
        <Background>
          <Logo />
          <Header>Yükleme İşlemi</Header>
          <Paragraph>
            Veriler veritabanına yükleniyor, lütfen yükleme bitene kadar bekleyin...
          </Paragraph>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Paragraph>{uploadCounter}/{assetCounter} yükleniyor...</Paragraph>
        </Background>
      ) : (
        <Background>
          <Logo />
          <Header>Denetçi Ekranı</Header>
          <Paragraph>
            Raporlama
      </Paragraph>
          {data.forms}
          <Button mode="contained" style={{ marginTop: "4%" }} onPress={() => { sendReport(answerCounter) }}>
            Cevapları Gönder
      </Button>
          <Button mode="outlined" style={{ backgroundColor: "red" }} onPress={logoutUser}>
            Çıkış Yap
      </Button>
        </Background>
      )
      }
    </Background >
  )
}

export default UserDashboard
