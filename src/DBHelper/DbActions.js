import * as firebase from 'firebase'
import 'firebase/auth'
import "firebase/firestore";
import { Alert } from 'react-native'
import {
    fillQuestions, fillCurrentUser, fillAnswerMethods, changeUploadingStatus,
    setSignatureAndLocationCheck, increaseAnsweredAssetCounter, resetUserStates,
    increaseUploadCounter, fillMyReports
} from '../redux/actions/userActions'
import { fillTimeStamps, fillUsersWhoWhaveReported, fillReportsForAdmin, fillUserInfosWhoHaveReported } from '../redux/actions/adminActions'
import store from '../redux/store'


let uploadCounter, assetCounter, haveSignature, haveLocation, questions, answers, answerMethods, currentUser,
    signatureUri, address, imageUri, videoUri, audioUri, users

store.subscribe(() => {
    uploadCounter = store.getState().userReducer.counterOfUploads
    assetCounter = store.getState().userReducer.counterOfAssetAnswers
    haveSignature = store.getState().userReducer.haveSignature
    haveLocation = store.getState().userReducer.haveLocation
    questions = store.getState().userReducer.questions
    answers = store.getState().userReducer.answers
    answerMethods = store.getState().userReducer.answerMethods
    currentUser = store.getState().userReducer.currentUser
    address = store.getState().userReducer.address
    signatureUri = store.getState().userReducer.signature
    imageUri = store.getState().userReducer.imageUri
    videoUri = store.getState().userReducer.videoUri
    audioUri = store.getState().userReducer.audioUri
    users = store.getState().adminReducer.usersWhoHaveReported
})

export async function getQuestions() {
    try {
        store.dispatch(resetUserStates())
        var tempQuestions = await firebase.firestore().collection('Questions').orderBy("createdAt", "asc").get()
        tempQuestions.docs.map(doc => /*doc.data().status &&*/ store.dispatch(fillQuestions(doc.id)));
        tempQuestions.docs.map(doc => /*doc.data().status &&*/ store.dispatch(fillAnswerMethods(doc.data())));
    } catch (e) {
        Alert.alert(
            'Hata',
            "Sorular Alınırken Hata Oluştu - " + e,
            [
                { text: 'Tamam' },
            ],
            { cancelable: false }
        )
    }
}

export async function getCurrentUser() {
    let currentUserTemp = await firebase.firestore().collection('Users').doc(firebase.auth().currentUser.uid).get()
    store.dispatch(fillCurrentUser(currentUserTemp))
}

export async function sendReport(answerCount) {
    try {
        var currentTime = new Date()
        currentTime.setHours(currentTime.getHours() + 3)
        var username_surname_identityNumber = currentUser.data().name + " " + currentUser.data().surname + " " + currentUser.data().identityNumber
        var reportDB = await firebase.firestore()
            .collection('Reports')
            .doc(username_surname_identityNumber)
            .collection("Reports")
            .doc(currentTime.toUTCString() + ' Tarihli Rapor')
        if (answerCount >= answerCounter()) {
            //veritabanında field oluşturma
            await firebase.firestore()
                .collection('Reports')
                .doc(username_surname_identityNumber)
                .set({ isim: currentUser.data().name })
            for (let i = 0; i < questions.length; i++) {
                //field oluşturduktan sonra raporu günderme
                if (i == 0) {
                    if (answers[i] != undefined)
                        reportDB.set({
                            ["Soru"]: firebase.firestore.FieldValue.arrayUnion(questions[i]),
                            ["Cevap"]: firebase.firestore.FieldValue.arrayUnion(answers[i])
                        })
                    else
                        reportDB.set({
                            ["Soru"]: firebase.firestore.FieldValue.arrayUnion(questions[i]),
                            ["Cevap"]: firebase.firestore.FieldValue.arrayUnion('Soru ' + (i + 1) + ' için Yazılı Cevap Gerekli Değil')
                        })
                }
                else {
                    if (answers[i] != undefined)
                        reportDB.update({
                            ["Soru"]: firebase.firestore.FieldValue.arrayUnion(questions[i]),
                            ["Cevap"]: firebase.firestore.FieldValue.arrayUnion(answers[i])
                        })
                    else
                        reportDB.update({
                            ["Soru"]: firebase.firestore.FieldValue.arrayUnion(questions[i]),
                            ["Cevap"]: firebase.firestore.FieldValue.arrayUnion('Soru ' + (i + 1) + ' için Yazılı Cevap Gerekli Değil')
                        })
                }
                if (answerMethods[i].photo) {
                    saveAssetsToFirebase(imageUri[i], "photo" + i, currentTime.toUTCString(), username_surname_identityNumber, "photos")
                }
                if (answerMethods[i].video) {
                    saveAssetsToFirebase(videoUri[i], "video" + i, currentTime.toUTCString(), username_surname_identityNumber, "videos")
                }
                if (answerMethods[i].voice) {
                    saveAssetsToFirebase(audioUri[i], "audio" + i, currentTime.toUTCString(), username_surname_identityNumber, "audios")
                }
                if (haveSignature) {
                    saveAssetsToFirebase(signatureUri, "signature0", currentTime.toUTCString(), username_surname_identityNumber, "signature")
                }
                if (i == questions.length - 1) {
                    if (haveLocation) {
                        reportDB.set({
                            Adres: address
                        }, { merge: true })
                    }
                }
            }
            //yüklenecek asset yok ise raporlamanın tamamlandıgını göster
            if (assetCounter == 0) {
                Alert.alert(
                    'Teşekkürler',
                    'Raporlama Başarılı',
                    [
                        {
                            text: 'Tamam', onPress: () => getQuestions()
                        },
                    ],
                    { cancelable: false }
                )
            }
        } else {
            Alert.alert(
                'Hata',
                'Tüm Cevap Seçenekleri Eksiksiz Doldurulmalı',
                [
                    {
                        text: 'Tamam'
                    },
                ],
                { cancelable: false }
            )
        }
    }
    catch (e) {
        alert("Raporlama Başarısız " + e)
    }
}
async function saveAssetsToFirebase(uri, filename, currentTime, user, path) {
    try {
        store.dispatch(increaseAnsweredAssetCounter())
        store.dispatch(changeUploadingStatus(true))
        const response = await fetch(uri)
        const blob = await response.blob()
        var ref = firebase.storage().ref().child(user + '/' + currentTime + '/' + path + '/' + filename)
        var uploadTask = ref.put(blob);
        uploadTask.on('state_changed',
            (snapshot) => {
                // data.progress = Math.round(snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            },
            (error) => {
                // Handle unsuccessful uploads
            },
            () => {
                store.dispatch(increaseUploadCounter())
                if (uploadCounter == assetCounter) {
                    store.dispatch(changeUploadingStatus(false))
                    Alert.alert(
                        'Teşekkürler',
                        'Raporlama Başarılı',
                        [
                            {
                                text: 'Tamam', onPress: () => getQuestions()
                            }
                        ],
                        { cancelable: false }
                    )
                }
            }
        )
    } catch (e) {
        Alert.alert('Hata', 'Bazı Kayıtlar Veritabanına Yüklenemedi - ' + e,
            [
                {
                    text: 'Tamam', onPress: () => getQuestions()
                }
            ],
            { cancelable: false }
        )
    }
}


function answerCounter() {
    let counter = 0
    for (let i = 0; i < answerMethods.length; i++) {
        if (answerMethods[i].photo)
            counter++
        if (answerMethods[i].text)
            counter++
        if (answerMethods[i].voice)
            counter++
        if (answerMethods[i].video)
            counter++
    }
    if (haveLocation)
        counter++
    if (haveSignature)
        counter++
    return counter
}

export async function getSignatureAndLocationInformations() {
    const getFromFirebase = await firebase.firestore().collection('SignatureAndLocationInformation')
        .doc("Informations").get()
    const haveSignatureTemp = getFromFirebase.data().signature
    const haveLocationTemp = getFromFirebase.data().location
    store.dispatch(setSignatureAndLocationCheck(haveSignatureTemp, haveLocationTemp))
}

//UserReportDashBoard DB Action
export async function getMyReports() {
    try {
        var tempMyReports = await firebase.firestore().collection('Reports').doc(currentUser.data().name + " " + currentUser.data().surname + " " + currentUser.data().identityNumber).collection('Reports').get()
        tempMyReports.docs.map(doc => store.dispatch(fillMyReports(doc)));
    } catch (e) {
        Alert.alert(
            'Hata',
            "Raporlar Alınırken Hata Oluştu - " + e,
            [
                { text: 'Tamam' },
            ],
            { cancelable: false }
        )
    }
}

//Admin DB Actions
export async function getTimeStampAndStatusForQuestions() {
    try {
        var tempQuestions = await firebase.firestore().collection('Questions').orderBy("createdAt", "asc").get()
        tempQuestions.docs.map(doc => store.dispatch(fillTimeStamps(doc.data().createdAt)))
    }
    catch (e) {
        Alert.alert(
            'Hata',
            "Zaman Damgası ve Soru Aktifliği Sorgulanırken Hata Oluştu - " + e,
            [
                { text: 'Tamam' },
            ],
            { cancelable: false }
        )
    }
}

export async function updateQuestions(questionsProp, answerMethodsProp, timeStampProp) {
    try {
        var documentsToBeDeleted = await firebase.firestore().collection('Questions').get()
        var documentsToBeDeletedArray = []
        documentsToBeDeleted.docs.map(doc => documentsToBeDeletedArray.push(doc.id));
        for (let i = 0; i < documentsToBeDeletedArray.length; i++) {
            firebase.firestore().collection("Questions").doc(documentsToBeDeletedArray[i]).delete()
        }
        for (let i = 0; i < questionsProp.length; i++) {
            firebase.firestore().collection("Questions").doc(questionsProp[i])
                .set({
                    text: answerMethodsProp[i].text,
                    photo: answerMethodsProp[i].photo,
                    createdAt: timeStampProp[i],
                    status: answerMethodsProp[i].status,
                    voice: answerMethodsProp[i].voice,
                    video: answerMethodsProp[i].video
                });
        }
        Alert.alert(
            'İşlem Başarılı',
            'Sorular Güncellendi',
            [
                {
                    text: 'Tamam'

                },
            ],
            { cancelable: false }
        )
    } catch (e) {
        alert("Soru Güncelleme Sırasında Hata Oluştu, Lütfen Tüm Alanları Eksiksiz Doldurun")
    }
}


export function updateSignatureAndLocationInformations(locationProp, signatureProp) {
    firebase.firestore().collection("SignatureAndLocationInformation").doc("Informations")
        .set({
            location: locationProp,
            signature: signatureProp
        });
}

//AdminReportDashboard DB Action
export async function getReports() {
    try {
        var tempUsers = await firebase.firestore().collection('Reports').get()
        tempUsers.docs.map(doc => store.dispatch(fillUsersWhoWhaveReported(doc.id)));
        if (users.length > 0) {
            for (let i = 0; i < users.length; i++) {
                var tempReports = await firebase.firestore().collection('Reports').doc(users[i]).collection('Reports').get()
                tempReports.docs.map(doc => store.dispatch(fillReportsForAdmin(doc)));
                tempReports.docs.map(doc => store.dispatch(fillUserInfosWhoHaveReported(users[i]))); //Aynı kullanıcıya ait diğer raporların isim soyisim bilgisi için
            }
        }
    } catch (e) {
        Alert.alert(
            'Hata',
            "Raporlar Alınırken Hata Oluştu - " + e,
            [
                { text: 'Tamam' },
            ],
            { cancelable: false }
        )
    }
}
