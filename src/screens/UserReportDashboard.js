import React, { useEffect, useState } from 'react'
import Background from '../components/Background'
import Logo from '../components/Logo'
import Header from '../components/Header'
import Paragraph from '../components/Paragraph'
import Button from '../components/Button'
import { logoutUser } from '../api/auth-api'
import { Collapse, CollapseHeader, CollapseBody, AccordionList } from 'accordion-collapse-react-native';
import { View, StyleSheet, TouchableOpacity, Keyboard, Text, Alert } from 'react-native'
import { Card } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { getMyReports, getCurrentUser } from '../DBHelper/DbActions'
import { useSelector, useDispatch } from "react-redux";
import { resetMyReports } from '../redux/actions/userActions'
import store from '../redux/store'

const UserReportDashboard = () => {
  const [data, setData] = React.useState({
    collapses: []
  })

  const dispatch = useDispatch()

  let myReports;

  store.subscribe(() => {
    myReports = store.getState().userReducer.myReports
  })

  async function CallAtFirst() {
    try {
      await getMyReports()
      await getCurrentUser()
      if (myReports.length > 0) {
        createCollapse()
      }
    } catch (e) {
      Alert.alert(
        'Hata',
        "Raporlar Alınırken Hata Oluştu - " + e,
        [
          { text: 'Tamam' },
        ],
        { cancelable: false }
      )
    }
  }
  async function reset() {
    data.collapses = []
    dispatch(resetMyReports())
    setData({
      collapses: data.collapses
    })
    await CallAtFirst()
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
    var collapsesTemp = []
    for (let i = 0; i < myReports.length; i++)
      collapsesTemp.push(collapse(myReports[i], i))
    setData({
      ...data,
      collapses: collapsesTemp
    })
  }
  useFocusEffect(
    React.useCallback(() => {
      reset()
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
      <Button mode="outlined" style={{ backgroundColor: "red" }} onPress={logoutUser}>
        Çıkış Yap
    </Button>
    </Background>
  )
}

export default UserReportDashboard
