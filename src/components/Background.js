import React from 'react'
import { ImageBackground, ScrollView, StyleSheet, View, KeyboardAvoidingView } from 'react-native'
import { theme } from '../core/theme'

const Background = ({ children }) => (
  <ImageBackground
    source={require('../assets/background_dot.png')}
    resizeMode="repeat"
    style={styles.background}
  >
    <ScrollView contentContainerStyle={{flexGrow: 1, justifyContent: 'center' }}>
      <KeyboardAvoidingView style={styles.container}>
        {children}
      </KeyboardAvoidingView>
    </ScrollView>
  </ImageBackground>
)

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
  },
  container: {
    flex: 1,
    padding: 20,
    width: '100%',
    maxWidth: 340,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
  },
})

export default Background
