import React, { useEffect, useState } from 'react'
import Background from '../components/Background'
import Logo from '../components/Logo'
import Header from '../components/Header'
import Paragraph from '../components/Paragraph'
import Button from '../components/Button'
import { logoutUser } from '../api/auth-api'
import { Collapse, CollapseHeader, CollapseBody, AccordionList } from 'accordion-collapse-react-native';
import { View, StyleSheet, TouchableOpacity, Keyboard, Text } from 'react-native'
import firebase from 'firebase/app'
import 'firebase/auth'
import "firebase/firestore";
import { Card } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';

const UserReportDashboard = () => {
  const [data, setData] = React.useState({
    myReports: [],
    currentUser: [],
    collapses: [],
  })
  async function getMyReports() {
    try {
      data.myReports = []
      data.currentUser = []
      data.currentUser = await firebase.firestore().collection('Users').doc(firebase.auth().currentUser.uid).get()
      var tempMyReports = await firebase.firestore().collection('Reports').doc(data.currentUser.data().name + " " + data.currentUser.data().surname + " " + data.currentUser.data().identityNumber).collection('Reports').get()
      tempMyReports.docs.map(doc => data.myReports.push(doc));
      setData({
        myReports: data.myReports
      })
      if (data.myReports.length > 0) {
        createCollapse()
      }
    } catch (e) {
      console.log("Raporların Alınması Sırasında Hata " + e)
    }
  }
  function collapse(report, index) {
    return (
      <Card style={{ flex: 1, width: "100%", marginTop: "2%" }} key={index}>
        <Card.Title title={"Rapor " + (index + 1)} />
        <Card.Content>
          <Collapse>
            <CollapseHeader>
              <View>
                <Text>{report.id}</Text>
              </View>
            </CollapseHeader>
            <CollapseBody>
              <Text>{JSON.stringify(report.data(), Object.keys(report.data()).sort(), 1).replace(/[{}",]/g, '')}</Text>
            </CollapseBody>
          </Collapse>
        </Card.Content>
      </Card>
    )
  }
  function createCollapse() {
    data.collapses = []
    for (let i = 0; i < data.myReports.length; i++)
      data.collapses.push(collapse(data.myReports[i], i))
    setData({
      ...data,
      collapses: data.collapses
    })
  }
  useFocusEffect(
    React.useCallback(() => {
      getMyReports()
    }, [])
  );
  return (
    <Background>
      <Logo />
      <Header>Denetçi Ekranı</Header>
      <Paragraph>
        Yaptığım Raporlamalar
    </Paragraph>
      {data.collapses}
      <Button mode="outlined" style={{backgroundColor:"red"}} onPress={logoutUser}>
        Çıkış Yap
    </Button>
    </Background>
  )
}

export default UserReportDashboard
