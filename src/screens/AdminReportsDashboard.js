import React, { useEffect, useState } from 'react'
import Background from '../components/Background'
import Logo from '../components/Logo'
import Header from '../components/Header'
import Paragraph from '../components/Paragraph'
import Button from '../components/Button'
import { logoutUser } from '../api/auth-api'
import { Collapse, CollapseHeader, CollapseBody, AccordionList } from 'accordion-collapse-react-native';
import { View, StyleSheet, TouchableOpacity, Keyboard, Text, Alert } from 'react-native'
import firebase from 'firebase/app'
import 'firebase/auth'
import "firebase/firestore";
import { Card } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { useSelector, useDispatch } from "react-redux";
import store from '../redux/store'
import { getReports } from '../DBHelper/DbActions'
import { resetReport } from '../redux/actions/adminActions'

const AdminReportDashboard = () => {
    const [data, setData] = React.useState({
        collapses: []
    })

    const dispatch = useDispatch()

    let reports, user, userInfos;

    store.subscribe(() => {
        reports = store.getState().adminReducer.reports
        user = store.getState().adminReducer.usersWhoHaveReported
        userInfos = store.getState().adminReducer.userInfosWhoHaveReported
    })

    async function CallAtFirst() {
        try {
            await reset()
            await getReports()
            createCollapse()
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
        dispatch(resetReport())
        setData({
            ...data,
            collapses: data.collapses
        })
    }

    function collapse(report, index) {
        return (
            <Card style={{ flex: 1, width: "100%", marginTop: "2%" }} key={index}>
                <Card.Title title={userInfos[index]} />
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
        for (let i = 0; i < reports.length; i++)
            data.collapses.push(collapse(reports[i], i))
        setData({
            ...data,
            collapses: data.collapses
        })
    }
    useFocusEffect(
        React.useCallback(() => {
            CallAtFirst()
        }, [])
    );
    return (
        <Background>
            <Logo />
            <Header>Yönetici Paneli</Header>
            <Paragraph>
                Yapılan Raporlamalar
            </Paragraph>
            {data.collapses}
            <Button mode="outlined" style={{ backgroundColor: "red" }} onPress={logoutUser}>
                Çıkış Yap
            </Button>
        </Background>
    )
}
export default AdminReportDashboard
