import React from 'react'
import { StyleSheet } from 'react-native'
import Checkbox from 'expo-checkbox';

const CheckBox = ({ isChecked, onChange, index }) => (
    <Checkbox
        value={isChecked}
        onChange={onChange}
        key={index}
        color={isChecked ? '#4630EB' : undefined}
    />
)

const styles = StyleSheet.create({
    checkbox: {
        margin: 8,
    },
})

export default CheckBox