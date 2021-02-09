import React from 'react'
import Background from '../components/Background'
import Logo from '../components/Logo'
import Header from '../components/Header'
import Paragraph from '../components/Paragraph'
import Button from '../components/Button'
import TextInput from '../components/TextInput'
import { logoutUser } from '../api/auth-api'

const AdminDashboard = () => (
  <Background>
    <Logo />
    <Header>Yönetici Paneli</Header>
    <Paragraph>
      Soru Ekleme ve Düzenleme
    </Paragraph>
    <TextInput
        label="Soru"
        onChangeText={(text) => setName({ value: text, error: '' })}
      />
      <TextInput
        label="Soru"
        onChangeText={(text) => setSurname({ value: text, error: '' })}
      />
    <Button mode="outlined" onPress={logoutUser}>
      Soru Ekle
    </Button>
    <Button mode="outlined" onPress={logoutUser}>
      Soruları Kaydet/Güncelle
    </Button>
    <Button mode="outlined" onPress={logoutUser}>
      Çıkış Yap
    </Button>
  </Background>
)

export default AdminDashboard
