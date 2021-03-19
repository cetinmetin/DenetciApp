import React, { Component, useState } from 'react';
import { View, StyleSheet, Alert, Text } from 'react-native';
import SignaturePad from 'react-native-signature-pad';
import Modal from 'react-native-modal';
import Button from '../components/Button'
import CloseButton from '../components/CloseButton'
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from "expo-file-system";
import * as Permissions from 'expo-permissions';


const SignatureCapture = ({ signatureCounter }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [newSignature, setNewSignature] = useState(null)
  const signaturePadError = (error) => {
    console.error(error);
  };

  const askPermissionsForSavePhoto = async () => {
    await Permissions.askAsync(Permissions.CAMERA);
    await Permissions.askAsync(Permissions.CAMERA_ROLL);
  };
  const signaturePadChange = ({ base64DataUrl }) => {
    setNewSignature(base64DataUrl)
  };
  const saveSignature = async () => {
    try {
      await askPermissionsForSavePhoto();
      const base64Code = newSignature.split("data:image/png;base64,")[1];
      const filename = FileSystem.documentDirectory + "signature.png";
      await FileSystem.writeAsStringAsync(filename, base64Code, {
        encoding: FileSystem.EncodingType.Base64,
      });
      await MediaLibrary.saveToLibraryAsync(filename);
      signatureCounter()
      setModalVisible(false)
      Alert.alert(
        'İşlem Başarılı',
        "İmza Cihaza Kaydedildi",
        [
          { text: 'Tamam' },
        ],
        { cancelable: false }
      )
    } catch (e) {
      Alert.alert(
        'Hata',
        "İmza Kaydetme Sırasında Hata - " + e,
        [
          { text: 'Tamam' },
        ],
        { cancelable: false }
      )
    }
  }
  return (
    <View style={styles.centeredView}>
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={{ flex: 1 }}>
          <SignaturePad onError={signaturePadError}
            onChange={signaturePadChange}
            style={{ flex: 1, backgroundColor: 'white' }} />
          <CloseButton close={() => { setModalVisible(false) }} />
          <Text style={{ alignSelf: "center", bottom: "80%", color: "gray", fontSize: 30 }}>IMZA ALANI</Text>
        <Button mode="outlined" onPress={saveSignature} style={{ backgroundColor: "lime" }}>İmzayı Kaydet</Button>
        </View>
      </Modal>
      <Button mode="outlined" onPress={() => { setModalVisible(true) }} style={{ backgroundColor: "lime" }}>İmza Ekle</Button>
    </View>
  )
};
const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  }
});

export default SignatureCapture