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

const AdminReportDashboard = () => {
    const [data, setData] = React.useState({
        reports: [],
        users: [],
        collapses: [],
    })
    async function getReports() {
        try {
            data.users = []
            data.reports = []
            var tempUsers = await firebase.firestore().collection('Reports').get()
            tempUsers.docs.map(doc => data.users.push(doc.id));
            if (data.users.length > 0) {
                for (let i = 0; i < data.users.length; i++) {
                    var tempReports = await firebase.firestore().collection('Reports').doc(data.users[i]).collection('Reports').get()
                    tempReports.docs.map(doc => data.reports.push(doc));
                }
                if (data.reports.length > 0) {
                    createCollapse()
                }
            }
        } catch (e) {
            console.log("Raporların Alınması Sırasında Hata " + e)
        }
    }
    function collapse(report, index) {
        return (
            <Card style={{ flex: 1, width: "100%", marginTop: "2%" }} key={index}>
                <Card.Title title={data.users[index]} />
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
        for (let i = 0; i < data.reports.length; i++)
            data.collapses.push(collapse(data.reports[i], i))
        setData({
            ...data,
            collapses: data.collapses
        })
    }
    useEffect(() => {
        getReports()
    }, [])

    return (
        <Background>
            <Logo />
            <Header>Yönetici Paneli</Header>
            <Paragraph>
                Yapılan Raporlamalar
            </Paragraph>
            {data.collapses}
            <Button mode="outlined" onPress={logoutUser}>
                Çıkış Yap
            </Button>
        </Background>
    )
}
export default AdminReportDashboard
