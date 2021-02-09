import React, { useState } from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { Text } from 'react-native-paper'
import Background from '../components/Background'
import Logo from '../components/Logo'
import Header from '../components/Header'
import Button from '../components/Button'
import TextInput from '../components/TextInput'
import BackButton from '../components/BackButton'
import { theme } from '../core/theme'
import { emailValidator } from '../helpers/emailValidator'
import { passwordValidator } from '../helpers/passwordValidator'
import { nameValidator } from '../helpers/nameValidator'
import { identityNumberValidator } from '../helpers/identityNumberValidator'
import { signInUser } from '../api/auth-api'
import Toast from '../components/Toast'

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState({ value: '', error: '' })
  const [surname, setSurname] = useState({ value: '', error: '' })
  const [identityNumber, setIdentityNumber] = useState({ value: '', error: '' })
  const [email, setEmail] = useState({ value: '', error: '' })
  const [password, setPassword] = useState({ value: '', error: '' })
  const [loading, setLoading] = useState()
  const [error, setError] = useState()

  const onSignUpPressed = async () => {
    const nameError = nameValidator(name.value)
    const surnameError = nameValidator(surname.value)
    const identityNumberError = identityNumberValidator(identityNumber.value)
    const emailError = emailValidator(email.value)
    const passwordError = passwordValidator(password.value)
    if (emailError || passwordError || nameError || surnameError || identityNumberError) {
      setName({ ...name, error: nameError })
      setSurname({ ...surname, error: surnameError })
      setIdentityNumber({ ...identityNumber, error: identityNumberError })
      setEmail({ ...email, error: emailError })
      setPassword({ ...password, error: passwordError })
      return
    }
    setLoading(true)
    const response = await signInUser({
      name: name.value,
      surname: surname.value,
      identityNumber: identityNumber.value,
      email: email.value,
      password: password.value
    })
    if (response.error) {
      setError(response.error)
    }
    setLoading(false)
  }

  return (
    <Background>
      <BackButton goBack={navigation.goBack} />
      <Logo />
      <Header>Hesap Oluşturun</Header>
      <TextInput
        label="İsim"
        returnKeyType="next"
        value={name.value}
        onChangeText={(text) => setName({ value: text, error: '' })}
        error={!!name.error}
        errorText={name.error}
      />
      <TextInput
        label="Soyisim"
        returnKeyType="next"
        value={surname.value}
        onChangeText={(text) => setSurname({ value: text, error: '' })}
        error={!!surname.error}
        errorText={surname.error}
      />
      <TextInput
        label="TC Kimlik Numarası"
        returnKeyType='next'
        keyboardType='numeric'
        value={identityNumber.value}
        onChangeText={(text) => setIdentityNumber({ value: text, error: '' })}
        error={!!identityNumber.error}
        errorText={identityNumber.error}
      />
      <TextInput
        label="Email Adresi"
        returnKeyType="next"
        value={email.value}
        onChangeText={(text) => setEmail({ value: text, error: '' })}
        error={!!email.error}
        errorText={email.error}
        autoCapitalize="none"
        autoCompleteType="email"
        textContentType="emailAddress"
        keyboardType="email-address"
      />
      <TextInput
        label="Şifre"
        returnKeyType="done"
        value={password.value}
        onChangeText={(text) => setPassword({ value: text, error: '' })}
        error={!!password.error}
        errorText={password.error}
        secureTextEntry
      />
      <Button
        loading={loading}
        mode="contained"
        onPress={onSignUpPressed}
        style={{ marginTop: 24 }}
      >
        Kayıt Ol
      </Button>
      <View style={styles.row}>
        <Text>Hesabınız Var Mı?</Text>
        <TouchableOpacity onPress={() => navigation.replace('LoginScreen')}>
          <Text style={styles.link}>Giriş Yap</Text>
        </TouchableOpacity>
      </View>
      <Toast message={error} onDismiss={() => setError('')} />
    </Background>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginTop: 4,
  },
  link: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
})

export default RegisterScreen
