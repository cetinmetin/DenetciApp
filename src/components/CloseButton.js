import React from 'react'
import { TouchableOpacity, Image, StyleSheet } from 'react-native'
import { getStatusBarHeight } from 'react-native-status-bar-height'

const CloseButton = ({ close }) => (
    <TouchableOpacity onPress={close} style={styles.container}>
        <Image style={styles.image} source={require('../assets/close.png')} />
    </TouchableOpacity>
)

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: getStatusBarHeight() - 10,
        right: 15,
    },
    image: {
        width: 24,
        height: 24,
    },
})

export default CloseButton
