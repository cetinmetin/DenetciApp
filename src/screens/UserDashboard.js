import React from 'react'
import Background from '../components/Background'
import Logo from '../components/Logo'
import Header from '../components/Header'
import Paragraph from '../components/Paragraph'
import Button from '../components/Button'
import { logoutUser } from '../api/auth-api'

const UserDashboard = () => (
  <Background>
    <Logo />
    <Header>Denetçi Ekranı</Header>
    <Paragraph>
      Raporlama
    </Paragraph>
    <Button mode="outlined" onPress={logoutUser}>
      Çıkış Yap
    </Button>
  </Background>
)

export default UserDashboard
