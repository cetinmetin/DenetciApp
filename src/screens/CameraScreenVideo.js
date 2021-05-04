import React, { Component } from "react";
import { View, Text, TouchableOpacity, Alert, StyleSheet, SafeAreaView, Modal, ActivityIndicator } from "react-native";
import { Camera } from 'expo-camera'
import * as MediaLibrary from 'expo-media-library';
import * as Permissions from 'expo-permissions';
import { Audio, Video } from 'expo-av';
import BackButton from '../components/BackButton'
import GLOBAL from '../globalStates/global'
import { theme } from '../core/theme'
import CountDown from 'react-native-countdown-component';

class CameraScreenVideo extends Component {
    state = {
        video: null,
        picture: null,
        recording: false,
        showCamera: false,
        saving: false,
        countDown: 60
    };
    askPermissionsForRecordingVideo = async () => {
        let cameraPermission = await Permissions.askAsync(Permissions.CAMERA)
        let cameraRollPermission = await Permissions.askAsync(Permissions.CAMERA_ROLL)
        let audioRecordingPermission = await Permissions.askAsync(Permissions.AUDIO_RECORDING)
            .then(
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: true,
                    playsInSilentModeIOS: true,
                })
            )
        if (cameraPermission.status === "granted" && cameraRollPermission.status === "granted"
            && audioRecordingPermission.status === "granted") {
            this.setState({ showCamera: true })
        }
        else {
            this.setState({ showCamera: false })
        }
    };
    componentDidMount() {
        this.askPermissionsForRecordingVideo();
    }
    componentWillUnmount() {
        this.setState({
            video: null,
            picture: null,
            recording: false,
            showCamera: false,
            saving: false,
            countDown: 60
        });
    }
    saveVideo = async () => {
        this.setState({ saving: true })
        const { video } = this.state;
        const questionIndex = this.props.route.params.questionIndex
        const asset = await MediaLibrary.saveToLibraryAsync(video.uri);
        GLOBAL.videoUri[questionIndex] = (video.uri)
        if (asset) {
            this.setState({ video: null });
        }

        Alert.alert(
            'İşlem Başarılı',
            'Video Kaydedildi',
            [
                {
                    text: 'Tamam',
                    onPress: () => { this.props.navigation.goBack(), this.setState({ saving: false }) }
                },
            ],
            { cancelable: false }
        )
    };

    stopRecord = async () => {
        this.setState({ recording: false }, () => {
            this.cam.stopRecording();
        });
    };

    startRecord = async () => {
        if (this.cam) {
            this.setState({ recording: true, countDown: 60 }, async () => {
                const video = await this.cam.recordAsync({
                    quality: Camera.Constants.VideoQuality['480p'],
                    maxDuration: 60
                });
                this.setState({ video });
            });
        }
    };

    toogleRecord = () => {
        const { recording } = this.state;

        if (recording) {
            this.stopRecord();
        } else {
            this.startRecord();
        }
    };

    render() {
        if (!this.state.showCamera) {
            return (
                <View style={styles.noPermissions}>
                    <BackButton goBack={this.props.navigation.goBack} />
                    <View />
                    <Text
                        style={
                            styles.noPermissionsText
                        }
                    >
                        Uygulamayı Kullanabilmeye Devam Etmek için Gerekli İzinleri Vermeniz Gerekiyor
          </Text>
                    <View />
                </View>
            );
        }
        const { recording, video, saving, countDown } = this.state
        return (
            <Camera
                ref={cam => (this.cam = cam)}
                style={{
                    justifyContent: "flex-end",
                    alignItems: "center",
                    flex: 1,
                    width: "100%"
                }}>
                <CountDown
                    until={countDown}
                    firstUntil={countDown}
                    onFinish={this.stopRecord}
                    size={30}
                    style={{ right: '35%', bottom: '65%' }}
                    digitStyle={{ backgroundColor: '#FFF', fontWeight: 'bold' }}
                    digitTxtStyle={{ color: 'red' }}
                    timeToShow={['S']}
                    timeLabels={{ s: '' }}
                    running={recording}
                />
                <Modal
                    animationType="slide"
                    visible={saving}
                    transparent={true}>
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <ActivityIndicator size="large" color={theme.colors.primary} />
                            <Text style={styles.modalText}>Video Kaydediliyor...</Text>
                        </View>
                    </View>
                </Modal>
                {!recording && video ? (
                    <TouchableOpacity
                        onPress={this.saveVideo}
                        style={{
                            padding: 20,
                            width: "100%",
                            backgroundColor: "#fff"
                        }}
                    >
                        <Text style={{ textAlign: "center", fontWeight: "bold", fontSize: 16 }}>Videoyu Kaydet</Text>
                    </TouchableOpacity>
                ) : <TouchableOpacity
                    style={{
                        backgroundColor: "transparent"
                    }}
                >
                    <Text style={{ textAlign: "center" }}></Text>
                </TouchableOpacity>}
                {recording ? (
                    <View style={styles.recordIndicatorContainer}>
                        <View style={styles.recordDot} />
                        <Text style={styles.recordTitle}>{"Kaydediliyor..."}</Text>
                    </View>
                ) : <View style={styles.recordIndicatorContainer}>
                    <Text style={styles.recordTitle}>{""}</Text>
                </View>}
                <TouchableOpacity
                    onPress={this.toogleRecord}
                    style={{
                        padding: 20,
                        width: "100%",
                        backgroundColor: recording ? "#ef4f84" : "#4fef97"
                    }}
                >
                    <Text style={{ textAlign: "center", fontWeight: "bold", fontSize: 16 }}>
                        {recording ? "Kaydı Bitir" : "Kayda Başla"}
                    </Text>
                </TouchableOpacity>
            </Camera>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
    },
    noPermissions: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        alignSelf: "stretch",
    },
    noPermissionsText: {
        textAlign: "center",
        justifyContent: "center",
        alignSelf: "center"
    },
    recordIndicatorContainer: {
        flexDirection: "row",
        position: "absolute",
        top: 25,
        alignSelf: "center",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "transparent",
        opacity: 0.7,
    },

    recordTitle: {
        fontSize: 14,
        color: "#ffffff",
        textAlign: "center",
    },
    recordDot: {
        borderRadius: 3,
        height: 6,
        width: 6,
        backgroundColor: "#ff0000",
        marginHorizontal: 5,
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22
    },
    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    modalText: {
        marginBottom: 15,
        textAlign: "center"
    }

})
export default CameraScreenVideo;