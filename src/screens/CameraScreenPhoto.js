import { StatusBar } from 'expo-status-bar'
import React, { useEffect } from 'react'
import { StyleSheet, Text, View, TouchableOpacity, Alert, ImageBackground, Image } from 'react-native'
import { Camera } from 'expo-camera'
import * as MediaLibrary from 'expo-media-library';
import * as Permissions from 'expo-permissions';

let camera = Camera

export default function CameraScreenPhoto({ navigation }) {

    const [startCamera, setStartCamera] = React.useState(false)
    const [previewVisible, setPreviewVisible] = React.useState(false)
    const [capturedImage, setCapturedImage] = React.useState(null)
    const [cameraType, setCameraType] = React.useState(Camera.Constants.Type.back)
    const [flashMode, setFlashMode] = React.useState('off')

    async function startTheCamera() {
        const { status } = await Camera.requestPermissionsAsync()
        //console.log(status)
        if (status === 'granted') {
            setStartCamera(true)
        } else {
            Alert.alert('Access denied')
        }
    }
    const takePicture = async () => {
        const photo = await camera.takePictureAsync()
        //console.log(photo)
        setPreviewVisible(true)
        //setStartCamera(false)
        setCapturedImage(photo)
    }

    askPermissionsForSavePhoto = async () => {
        await Permissions.askAsync(Permissions.CAMERA);
        await Permissions.askAsync(Permissions.CAMERA_ROLL);
    };

    async function savePhoto() {
        await this.askPermissionsForSavePhoto();
        await MediaLibrary.saveToLibraryAsync(capturedImage.uri)
        Alert.alert(
            'İşlem Başarılı',
            'Fotoğraf Kaydedildi',
            [
                {
                    text: 'Tamam',
                    onPress: () => { navigation.goBack() }
                },
            ],
            { cancelable: false }
        )
    }
    const retakePicture = () => {
        setCapturedImage(null)
        setPreviewVisible(false)
        startTheCamera()
    }
    const changeFlashMode = () => {
        if (flashMode === 'on') {
            setFlashMode('off')
        } else if (flashMode === 'off') {
            setFlashMode('on')
        } else {
            setFlashMode('auto')
        }
    }
    const switchCamera = () => {
        if (cameraType === 'back') {
            setCameraType('front')
        } else {
            setCameraType('back')
        }
    }
    useEffect(() => {
        startTheCamera()
    }, [])
    return (
        <View style={styles.container}>
            <View style={{ flex: 1, width: '100%' }} >
                {previewVisible && capturedImage ? (
                    <CameraPreview photo={capturedImage} savePhoto={savePhoto} retakePicture={retakePicture} />
                ) : (
                    <Camera type={cameraType} flashMode={flashMode} style={{ flex: 1 }}
                        ref={(r) => {
                            camera = r
                        }}>
                        <View style={{ flex: 1, width: '100%', backgroundColor: 'transparent', flexDirection: 'row' }}>
                            <View style={{ position: 'absolute', left: '5%', top: '10%', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <TouchableOpacity
                                    onPress={changeFlashMode}
                                    style={{
                                        backgroundColor: flashMode === 'off' ? '#000' : '#fff',
                                        borderRadius: 50,
                                        height: 25,
                                        width: 25
                                    }}>
                                    <Text style={{ fontSize: 20 }}>
                                        ⚡️
                                            </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={switchCamera}
                                    style={{
                                        marginTop: 20,
                                        borderRadius: 50,
                                        height: 25,
                                        width: 25
                                    }}>
                                    <Text style={{ fontSize: 20 }}>
                                        {cameraType === 'front' ? '🤳' : '📷'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            <View
                                style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    flexDirection: 'row',
                                    flex: 1,
                                    width: '100%',
                                    padding: 20,
                                    justifyContent: 'space-between'
                                }}>
                                <View
                                    style={{
                                        alignSelf: 'center',
                                        flex: 1,
                                        alignItems: 'center'
                                    }} >
                                    <TouchableOpacity
                                        onPress={takePicture}
                                        style={{
                                            width: 70,
                                            height: 70,
                                            bottom: 0,
                                            borderRadius: 50,
                                            backgroundColor: '#fff'
                                        }} />
                                </View>
                            </View>
                        </View>
                    </Camera>
                )}
            </View>
            <StatusBar style="auto" />
        </View>
    )
}
const CameraPreview = ({ photo, retakePicture, savePhoto }) => {
    //console.log('preview', photo)
    return (
        <View
            style={{
                backgroundColor: 'transparent',
                flex: 1,
                width: '100%',
                height: '100%'
            }} >
            <ImageBackground
                source={{ uri: photo && photo.uri }}
                style={{
                    flex: 1
                }}>
                <View
                    style={{
                        flex: 1,
                        flexDirection: 'column',
                        padding: 15,
                        justifyContent: 'flex-end'
                    }}>
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between'
                        }}>
                        <TouchableOpacity
                            onPress={retakePicture}
                            style={{
                                width: 130,
                                height: 40,

                                alignItems: 'center',
                                borderRadius: 4
                            }}>
                            <Text style={{ color: '#fff', fontSize: 20 }}>
                                Yeniden Çek
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={savePhoto}
                            style={{
                                width: 130,
                                height: 40,

                                alignItems: 'center',
                                borderRadius: 4
                            }}>
                            <Text style={{ color: '#fff', fontSize: 20 }}>
                                Kaydet
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ImageBackground>
        </View>
    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center'
    }
})
