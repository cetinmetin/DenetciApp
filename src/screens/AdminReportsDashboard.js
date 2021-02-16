import React from 'react'
import Background from '../components/Background'
import Logo from '../components/Logo'
import Header from '../components/Header'
import Paragraph from '../components/Paragraph'
import Button from '../components/Button'
import { logoutUser } from '../api/auth-api'

const AdminReportDashboard = () => (
    <Background>
        <Logo />
        <Header>Yönetici Paneli</Header>
        <Paragraph>
            Yapılan Raporlamalar
  </Paragraph>
        <Button mode="outlined" onPress={logoutUser}>
            Çıkış Yap
  </Button>
    </Background>
)

export default AdminReportDashboard
