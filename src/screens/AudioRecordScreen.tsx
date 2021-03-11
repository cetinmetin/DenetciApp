import React, { Component } from "react";
import {
    Dimensions,
    Image,
    StyleSheet,
    Text,
    TouchableHighlight,
    View, TouchableOpacity, Alert
} from "react-native";
import Slider from '@react-native-community/slider';
import { Audio, AVPlaybackStatus } from "expo-av";
import * as FileSystem from "expo-file-system";
import * as Permissions from "expo-permissions";
import * as Icons from "../components/AudioRecordScreen/Icons";
import * as MediaLibrary from 'expo-media-library';
import BackButton from '../components/BackButton'

const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get("window");
const BACKGROUND_COLOR = "#FFF8ED";
const LIVE_COLOR = "#FF0000";
const DISABLED_OPACITY = 0.5;
// const RATE_SCALE = 3.0;

type Props = { navigation };

type State = {
    haveRecordingPermissions: boolean;
    isLoading: boolean;
    isPlaybackAllowed: boolean;
    muted: boolean;
    soundPosition: number | null;
    soundDuration: number | null;
    recordingDuration: number | null;
    shouldPlay: boolean;
    isPlaying: boolean;
    isRecording: boolean;
    fontLoaded: boolean;
    // shouldCorrectPitch: boolean;
    volume: number;
    // rate: number;
};
export default class AudioRecordScreen extends React.Component<Props, State>{
    private recording: Audio.Recording | null;
    private sound: Audio.Sound | null;
    private isSeeking: boolean;
    private shouldPlayAtEndOfSeek: boolean;
    private readonly recordingSettings: Audio.RecordingOptions;

    constructor(props: Props) {
        super(props);
        this.recording = null;
        this.sound = null;
        this.isSeeking = false;
        this.shouldPlayAtEndOfSeek = false;
        this.state = {
            haveRecordingPermissions: false,
            isLoading: false,
            isPlaybackAllowed: false,
            muted: false,
            soundPosition: null,
            soundDuration: null,
            recordingDuration: null,
            shouldPlay: false,
            isPlaying: false,
            isRecording: false,
            fontLoaded: false,
            // shouldCorrectPitch: true,
            volume: 1.0,
            // rate: 1.0,
        };
        this.recordingSettings = Audio.RECORDING_OPTIONS_PRESET_LOW_QUALITY;

        // UNCOMMENT THIS TO TEST maxFileSize:
        /* this.recordingSettings = {
          ...this.recordingSettings,
          android: {
            ...this.recordingSettings.android,
            maxFileSize: 12000,
          },
        };*/
    }

    componentDidMount() {
        // (async () => {
        //     await Font.loadAsync({
        //         "cutive-mono-regular": require("../assets/fonts/CutiveMono-Regular.ttf"),
        //     });
        //     this.setState({ fontLoaded: true });
        // })();
        this.askForPermission();
    }
    componentWillUnmount() {
        this.setState({
            isLoading: true,
        });
    }
    private askForPermission = async () => {
        const response = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
        this.setState({
            haveRecordingPermissions: response.status === "granted",
        });
    };

    private updateScreenForSoundStatus = (status: AVPlaybackStatus) => {
        if (status.isLoaded) {
            this.setState({
                soundDuration: status.durationMillis ?? null,
                soundPosition: status.positionMillis,
                shouldPlay: status.shouldPlay,
                isPlaying: status.isPlaying,
                // rate: status.rate,
                muted: status.isMuted,
                volume: status.volume,
                // shouldCorrectPitch: status.shouldCorrectPitch,
                isPlaybackAllowed: true,
            });
        } else {
            this.setState({
                soundDuration: null,
                soundPosition: null,
                isPlaybackAllowed: false,
            });
            // if (status.error) {
            //     console.log(`FATAL PLAYER ERROR: ${status.error}`);
            // }
        }
    };

    private updateScreenForRecordStatus = (status: Audio.RecordingStatus) => {
        if (status.canRecord) {
            this.setState({
                isRecording: status.isRecording,
                recordingDuration: status.durationMillis,
            });
        } else if (status.isDoneRecording) {
            this.setState({
                isRecording: false,
                recordingDuration: status.durationMillis,
            });
            if (!this.state.isLoading) {
                this.stopRecordingAndEnablePlayback();
            }
        }
    };

    private async stopPlaybackAndBeginRecording() {
        this.setState({
            isLoading: true,
        });
        if (this.sound !== null) {
            await this.sound.unloadAsync();
            this.sound.setOnPlaybackStatusUpdate(null);
            this.sound = null;
        }
        await Audio.setAudioModeAsync({
            allowsRecordingIOS: true,
            interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
            playsInSilentModeIOS: true,
            shouldDuckAndroid: true,
            interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
            playThroughEarpieceAndroid: false,
            staysActiveInBackground: true,
        });
        if (this.recording !== null) {
            this.recording.setOnRecordingStatusUpdate(null);
            this.recording = null;
        }

        const recording = new Audio.Recording();
        await recording.prepareToRecordAsync(this.recordingSettings);
        recording.setOnRecordingStatusUpdate(this.updateScreenForRecordStatus);

        this.recording = recording;
        await this.recording.startAsync(); // Will call this.updateScreenForRecordStatus to update the screen.
        this.setState({
            isLoading: false,
        });
    }

    private async stopRecordingAndEnablePlayback() {
        this.setState({
            isLoading: true,
        });
        if (!this.recording) {
            return;
        }
        try {
            await this.recording.stopAndUnloadAsync();
        } catch (error) {
            // On Android, calling stop before any data has been collected results in
            // an E_AUDIO_NODATA error. This means no audio data has been written to
            // the output file is invalid.
            if (error.code === "E_AUDIO_NODATA") {
                console.log(
                    `Stop was called too quickly, no data has yet been received (${error.message})`
                );
            } else {
                console.log("STOP ERROR: ", error.code, error.name, error.message);
            }
            this.setState({
                isLoading: false,
            });
            return;
        }
        await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
            playsInSilentModeIOS: true,
            shouldDuckAndroid: true,
            interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
            playThroughEarpieceAndroid: false,
            staysActiveInBackground: true,
        });
        const { sound, status } = await this.recording.createNewLoadedSoundAsync(
            {
                isLooping: true,
                isMuted: this.state.muted,
                volume: this.state.volume,
                // rate: this.state.rate,
                // shouldCorrectPitch: this.state.shouldCorrectPitch,
            },
            this.updateScreenForSoundStatus
        );
        this.sound = sound;
        this.setState({
            isLoading: false,
        });
    }

    private onRecordPressed = () => {
        if (this.state.isRecording) {
            this.stopRecordingAndEnablePlayback();
        } else {
            this.stopPlaybackAndBeginRecording();
        }
    };

    private onPlayPausePressed = () => {
        if (this.sound != null) {
            if (this.state.isPlaying) {
                this.sound.pauseAsync();
            } else {
                this.sound.playAsync();
            }
        }
    };

    private onStopPressed = () => {
        if (this.sound != null) {
            this.sound.stopAsync();
        }
    };

    private onMutePressed = () => {
        if (this.sound != null) {
            this.sound.setIsMutedAsync(!this.state.muted);
        }
    };

    private onVolumeSliderValueChange = (value: number) => {
        if (this.sound != null) {
            this.sound.setVolumeAsync(value);
        }
    };

    // private _trySetRate = async (rate: number, shouldCorrectPitch: boolean) => {
    //     if (this.sound != null) {
    //         try {
    //             await this.sound.setRateAsync(rate, shouldCorrectPitch);
    //         } catch (error) {
    //             // Rate changing could not be performed, possibly because the client's Android API is too old.
    //         }
    //     }
    // };

    // private _onRateSliderSlidingComplete = async (value: number) => {
    //     this._trySetRate(value * RATE_SCALE, this.state.shouldCorrectPitch);
    // };

    // private _onPitchCorrectionPressed = () => {
    //     this._trySetRate(this.state.rate, !this.state.shouldCorrectPitch);
    // };

    private onSeekSliderValueChange = (value: number) => {
        if (this.sound != null && !this.isSeeking) {
            this.isSeeking = true;
            this.shouldPlayAtEndOfSeek = this.state.shouldPlay;
            this.sound.pauseAsync();
        }
    };
    private onSeekSliderSlidingComplete = async (value: number) => {
        if (this.sound != null) {
            this.isSeeking = false;
            const seekPosition = value * (this.state.soundDuration || 0);
            if (this.shouldPlayAtEndOfSeek) {
                this.sound.playFromPositionAsync(seekPosition);
            } else {
                this.sound.setPositionAsync(seekPosition);
            }
        }
    };

    private getSeekSliderPosition() {
        if (
            this.sound != null &&
            this.state.soundPosition != null &&
            this.state.soundDuration != null
        ) {
            return this.state.soundPosition / this.state.soundDuration;
        }
        return 0;
    }

    private getMMSSFromMillis(millis: number) {
        const totalSeconds = millis / 1000;
        const seconds = Math.floor(totalSeconds % 60);
        const minutes = Math.floor(totalSeconds / 60);

        const padWithZero = (number: number) => {
            const string = number.toString();
            if (number < 10) {
                return "0" + string;
            }
            return string;
        };
        return padWithZero(minutes) + ":" + padWithZero(seconds);
    }

    private getPlaybackTimeStamp() {
        if (
            this.sound != null &&
            this.state.soundPosition != null &&
            this.state.soundDuration != null
        ) {
            return `${this.getMMSSFromMillis(
                this.state.soundPosition
            )} / ${this.getMMSSFromMillis(this.state.soundDuration)}`;
        }
        return "";
    }

    private getRecordingTimeStamp() {
        if (this.state.recordingDuration != null) {
            return `${this.getMMSSFromMillis(this.state.recordingDuration)}`;
        }
        return `${this.getMMSSFromMillis(0)}`;
    }
    private saveAudio = async () => {
        try {
            const info = await FileSystem.getInfoAsync(this.recording.getURI() || "");
            await MediaLibrary.saveToLibraryAsync(info.uri);
            Alert.alert(
                'İşlem Başarılı',
                "Ses Cihaza Kaydedildi",
                [
                    { text: 'Tamam' },
                ],
                { cancelable: false }
            )
        } catch (e) {
            Alert.alert(
                'Hata',
                "Ses Kaydetme Sırasında Hata - " + e,
                [
                    { text: 'Tamam' },
                ],
                { cancelable: false }
            )
        }
    }
    render() {

        if (!this.state.haveRecordingPermissions) {
            return (
                <View style={styles.container}>
                    <BackButton goBack={this.props.navigation.goBack} />
                    <View />
                    <Text
                        style={
                            styles.noPermissionsText
                        }
                    >
                        Uygulamayı Kullanabilmeye Devam Etmek İçin Ses Kayıt İzni Vermeniz Gerekiyor
          </Text>
                    <View />
                </View>
            );
        }

        return (
            <View style={styles.container}>
                <BackButton goBack={this.props.navigation.goBack} />
                <View
                    style={[
                        styles.halfScreenContainer,
                        {
                            opacity: this.state.isLoading ? DISABLED_OPACITY : 1.0,
                        },
                    ]}
                >
                    <View />
                    <View style={styles.recordingContainer}>
                        <View />
                        <TouchableHighlight
                            underlayColor={BACKGROUND_COLOR}
                            style={styles.wrapper}
                            onPress={this.onRecordPressed}
                            disabled={this.state.isLoading}
                        >
                            <Image style={styles.image} source={Icons.RECORD_BUTTON.module} />
                        </TouchableHighlight>
                        <View style={styles.recordingDataContainer}>
                            <View />
                            <Text
                                style={styles.liveText}
                            >
                                {this.state.isRecording ? "Kaydediliyor" : ""}
                            </Text>
                            <View style={styles.recordingDataRowContainer}>
                                <Image
                                    style={[
                                        styles.image,
                                        { opacity: this.state.isRecording ? 1.0 : 0.0 },
                                    ]}
                                    source={Icons.RECORDING.module}
                                />
                                <Text
                                    style={
                                        styles.recordingTimestamp}
                                >
                                    {this.getRecordingTimeStamp()}
                                </Text>
                            </View>
                            <View />
                        </View>
                        <View />
                    </View>
                    <View />
                </View>
                <View
                    style={[
                        styles.halfScreenContainer,
                        {
                            opacity:
                                !this.state.isPlaybackAllowed || this.state.isLoading
                                    ? DISABLED_OPACITY
                                    : 1.0,
                        },
                    ]}
                >
                    <View />
                    <View style={styles.playbackContainer}>
                        <Slider
                            style={styles.playbackSlider}
                            trackImage={Icons.TRACK_1.module}
                            thumbImage={Icons.THUMB_1.module}
                            value={this.getSeekSliderPosition()}
                            onValueChange={this.onSeekSliderValueChange}
                            onSlidingComplete={this.onSeekSliderSlidingComplete}
                            disabled={!this.state.isPlaybackAllowed || this.state.isLoading}
                        />
                        <Text
                            style={
                                styles.playbackTimestamp
                            }
                        >
                            {this.getPlaybackTimeStamp()}
                        </Text>
                    </View>
                    <View
                        style={[styles.buttonsContainerBase, styles.buttonsContainerTopRow]}
                    >
                        <View style={[styles.volumeContainer, , { marginLeft: "5%" }]}>
                            <TouchableHighlight
                                underlayColor={BACKGROUND_COLOR}
                                style={styles.wrapper}
                                onPress={this.onMutePressed}
                                disabled={!this.state.isPlaybackAllowed || this.state.isLoading}
                            >
                                <Image
                                    style={styles.image}
                                    source={
                                        this.state.muted
                                            ? Icons.MUTED_BUTTON.module
                                            : Icons.UNMUTED_BUTTON.module
                                    }
                                />
                            </TouchableHighlight>
                            <Slider
                                style={styles.volumeSlider}
                                trackImage={Icons.TRACK_1.module}
                                thumbImage={Icons.THUMB_2.module}
                                value={1}
                                onValueChange={this.onVolumeSliderValueChange}
                                disabled={!this.state.isPlaybackAllowed || this.state.isLoading}
                            />
                        </View>
                        <View style={styles.playStopContainer}>
                            <TouchableHighlight
                                underlayColor={BACKGROUND_COLOR}
                                style={styles.wrapper}
                                onPress={this.onPlayPausePressed}
                                disabled={!this.state.isPlaybackAllowed || this.state.isLoading}
                            >
                                <Image
                                    style={styles.image}
                                    source={
                                        this.state.isPlaying
                                            ? Icons.PAUSE_BUTTON.module
                                            : Icons.PLAY_BUTTON.module
                                    }
                                />
                            </TouchableHighlight>
                            <TouchableHighlight
                                underlayColor={BACKGROUND_COLOR}
                                style={styles.wrapper}
                                onPress={this.onStopPressed}
                                disabled={!this.state.isPlaybackAllowed || this.state.isLoading}
                            >
                                <Image style={styles.image} source={Icons.STOP_BUTTON.module} />
                            </TouchableHighlight>
                        </View>
                        <View />
                    </View>
                    {/* <View
                        style={[
                            styles.buttonsContainerBase,
                            styles.buttonsContainerBottomRow,
                        ]}
                    >
                        <Text style={styles.timestamp}>Rate:</Text>
                        <Slider
                            style={styles.rateSlider}
                            trackImage={Icons.TRACK_1.module}
                            thumbImage={Icons.THUMB_1.module}
                            value={this.state.rate / RATE_SCALE}
                            onSlidingComplete={this._onRateSliderSlidingComplete}
                            disabled={!this.state.isPlaybackAllowed || this.state.isLoading}
                        />
                        <TouchableHighlight
                            underlayColor={BACKGROUND_COLOR}
                            style={styles.wrapper}
                            onPress={this._onPitchCorrectionPressed}
                            disabled={!this.state.isPlaybackAllowed || this.state.isLoading}
                        >
                            <Text style={[{ fontFamily: "cutive-mono-regular" }]}>
                                PC: {this.state.shouldCorrectPitch ? "yes" : "no"}
                            </Text>
                        </TouchableHighlight>
                    </View> */}
                    <TouchableOpacity
                        onPress={this.saveAudio}
                        style={{
                            padding: 20,
                            backgroundColor: "black",
                            borderRadius: 40
                        }}
                        disabled={!this.state.isPlaybackAllowed || this.state.isLoading}
                    >
                        <Text style={{ textAlign: "center", fontWeight: "bold", fontSize: 16, color: "white" }}>Sesi Cihaza Kaydet</Text>
                    </TouchableOpacity>
                    <View />
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    emptyContainer: {
        alignSelf: "stretch",
        backgroundColor: BACKGROUND_COLOR,
    },
    container: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        alignSelf: "stretch",
        backgroundColor: BACKGROUND_COLOR,
        minHeight: DEVICE_HEIGHT,
        maxHeight: DEVICE_HEIGHT,
    },
    noPermissionsText: {
        textAlign: "center",
    },
    wrapper: {},
    halfScreenContainer: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        alignSelf: "stretch",
        minHeight: DEVICE_HEIGHT / 2.0,
        maxHeight: DEVICE_HEIGHT / 2.0,
    },
    recordingContainer: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "stretch",
        minHeight: Icons.RECORD_BUTTON.height,
        maxHeight: Icons.RECORD_BUTTON.height,
    },
    recordingDataContainer: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        minHeight: Icons.RECORD_BUTTON.height,
        maxHeight: Icons.RECORD_BUTTON.height,
        minWidth: Icons.RECORD_BUTTON.width * 2.0,
        maxWidth: Icons.RECORD_BUTTON.width * 2.0,
    },
    recordingDataRowContainer: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        minHeight: Icons.RECORDING.height,
        maxHeight: Icons.RECORDING.height,
    },
    playbackContainer: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        alignSelf: "stretch",
        minHeight: Icons.THUMB_1.height * 2.0,
        maxHeight: Icons.THUMB_1.height * 2.0,
    },
    playbackSlider: {
        alignSelf: "stretch",
    },
    liveText: {
        color: LIVE_COLOR,
        fontSize: 18
    },
    recordingTimestamp: {
        paddingLeft: "5%",
        fontSize: 30
    },
    playbackTimestamp: {
        textAlign: "right",
        alignSelf: "stretch",
        paddingRight: 20,
    },
    image: {
        backgroundColor: BACKGROUND_COLOR,
    },
    textButton: {
        backgroundColor: BACKGROUND_COLOR,
        padding: 10,
    },
    buttonsContainerBase: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    buttonsContainerTopRow: {
        maxHeight: Icons.MUTED_BUTTON.height,
        alignSelf: "stretch",
        paddingRight: 20,
    },
    playStopContainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        minWidth: ((Icons.PLAY_BUTTON.width + Icons.STOP_BUTTON.width) * 3.0) / 2.0,
        maxWidth: ((Icons.PLAY_BUTTON.width + Icons.STOP_BUTTON.width) * 3.0) / 2.0,
    },
    volumeContainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        minWidth: DEVICE_WIDTH / 2.0,
        maxWidth: DEVICE_WIDTH / 2.0,
    },
    volumeSlider: {
        width: DEVICE_WIDTH / 2.0 - Icons.MUTED_BUTTON.width,
    },
    buttonsContainerBottomRow: {
        maxHeight: Icons.THUMB_1.height,
        alignSelf: "stretch",
        paddingRight: 20,
        paddingLeft: 20,
    },
    timestamp: {
        fontFamily: "cutive-mono-regular",
    },
    rateSlider: {
        width: DEVICE_WIDTH / 2.0,
    },
});
