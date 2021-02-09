import React from 'react'
import Background from '../components/Background'
import Logo from '../components/Logo'
import Header from '../components/Header'
import Paragraph from '../components/Paragraph'
import Button from '../components/Button'
import { logoutUser } from '../api/auth-api'

const Dashboard = () => (
  <Background>
    <Logo />
    <Header>Sorular</Header>
    <Paragraph>
      Raporlama
    </Paragraph>
    <Button mode="outlined" onPress={logoutUser}>
      Çıkış Yap
    </Button>
  </Background>
)

export default Dashboard
