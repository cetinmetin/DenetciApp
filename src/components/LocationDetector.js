import React, { useState, useEffect } from 'react';
import { Platform, Text, View, StyleSheet, Alert } from 'react-native';
import Constants from 'expo-constants';
import * as Location from 'expo-location';
import Background from '../components/Background'
import Modal from 'react-native-modal';
import Button from '../components/Button'
import TextInput from '../components/TextInput'
import { useSelector, useDispatch } from 'react-redux'
import CloseButton from '../components/CloseButton'
import { increaseAnswerCounter,fillAddress } from '../redux/actions/userActions'

const LocationDetector = ({ navigation, locationCounter }) => {
    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [city, setCity] = useState(null);
    const [postalCode, setPostalCode] = useState(null);
    const [country, setCountry] = useState(null);
    const [subregion, setSubregion] = useState(null);
    const [street, setStreet] = useState(null);
    const [district, setDistrict] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [streetAndNumber, setStreetAndNumber] = useState({ value: '' });

    const dispatch = useDispatch()

    let addressTemp;

    useEffect(() => {
        getLocation();
    }, []);

    const getLocation = async () => {
        let { status } = await Location.requestPermissionsAsync();
        if (status !== 'granted') {
            setErrorMsg('Konum İzni Reddedildi');
        }

        const location = await Location.getCurrentPositionAsync({});
        setLocation(location);

        const place = await Location.reverseGeocodeAsync({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
        });
        place.find((p) => {
            setCity(p.region);
            setPostalCode(p.postalCode);
            setCountry(p.country);
            setSubregion(p.subregion);
            setStreet(p.street);
            setDistrict(p.district);
        });

    };

    addressTemp = 'Konum Tespit Ediliyor...'

    if (errorMsg) {
        addressTemp = errorMsg
    }
    else if (location) {
        addressTemp =
            'Şehir: ' +
            city +
            ' Posta Kodu: ' +
            postalCode +
            ' İlçe: ' +
            subregion +
            ' Cadde Adı: ' +
            street +
            ' Mahalle Adı: ' +
            district
    }
    const completeAddress = () => {
        if (streetAndNumber.value.length > 0) {
            let completeAddressTemp = addressTemp + ' Sokak/Taksim - Bina NO: ' + streetAndNumber.value
            dispatch(fillAddress(completeAddressTemp))
            setModalVisible(false)
            setStreetAndNumber({ value: '' })
            dispatch(increaseAnswerCounter())
        }
        else {
            Alert.alert(
                'Hata',
                "Sokak/Taksim - Bina NO Alanını Doldurun",
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
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(!modalVisible);
                }}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <CloseButton close={() => { setModalVisible(false) }} />
                        <Text style={styles.modalText}>{addressTemp}</Text>
                        <TextInput
                            label="Sokak/Taksim - Bina NO"
                            returnKeyType="next"
                            value={streetAndNumber.value}
                            onChangeText={(text) => setStreetAndNumber({ value: text })}
                        />
                        <Button mode="outlined" onPress={completeAddress} style={{ backgroundColor: "lime" }}>Adresi Kaydet</Button>
                    </View>
                </View>
            </Modal>
            <Button mode="outlined" onPress={() => { setModalVisible(true) }} style={{ backgroundColor: "lime" }}>Konum Ekle</Button>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    paragraph: {
        fontSize: 18,
        textAlign: 'center',
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    modalView: {
        width: "100%",
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
    button: {
        borderRadius: 20,
        padding: 10,
        elevation: 2
    },
    buttonOpen: {
        backgroundColor: "#F194FF",
    },
    buttonClose: {
        backgroundColor: "#2196F3",
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center"
    },
    modalText: {
        textAlign: "left"
    }
});

export default LocationDetector