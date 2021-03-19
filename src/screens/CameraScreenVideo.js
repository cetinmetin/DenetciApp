import React, { Component } from "react";
import { View, Text, TouchableOpacity, Alert, StyleSheet, SafeAreaView } from "react-native";
import { Camera } from 'expo-camera'
import * as MediaLibrary from 'expo-media-library';
import * as Permissions from 'expo-permissions';
import { Audio, Video } from 'expo-av';
import BackButton from '../components/BackButton'

class CameraScreenVideo extends Component {
    state = {
        video: null,
        picture: null,
        recording: false,
        showCamera: false
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
            showCamera: false
        });
    }
    saveVideo = async () => {
        const { video } = this.state;
        const asset = await MediaLibrary.saveToLibraryAsync(video.uri);
        if (asset) {
            this.setState({ video: null });
        }

        Alert.alert(
            'İşlem Başarılı',
            'Video Kaydedildi',
            [
                {
                    text: 'Tamam',
                    onPress: () => { this.props.navigation.goBack() }
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
            this.setState({ recording: true }, async () => {
                const video = await this.cam.recordAsync();
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
        const { recording, video } = this.state
        return (
            <Camera
                ref={cam => (this.cam = cam)}
                style={{
                    justifyContent: "flex-end",
                    alignItems: "center",
                    flex: 1,
                    width: "100%"
                }}
            >
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
    }
})
export default CameraScreenVideo;