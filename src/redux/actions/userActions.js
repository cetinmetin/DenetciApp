//UserDashboard Actions

import {
    ADDRESS, ANSWER_METHODS, ANSWERS, AUDIO_URI, CURRENT_USER, IMAGE_URI,
    QUESTIONS, SIGNATURE_AND_LOCATION, SIGNATURE_URI, UPLOADING_STATUS, VIDEO_URI, ANSWERED_ASSET_COUNTER,
    UPLOAD_COUNTER, ANSWER_COUNTER, RESET_STATE, GET_MY_REPORTS, RESET_MY_REPORTS
} from './userActionTypes'

export const changeUploadingStatus = (newStatus) => ({
    type: UPLOADING_STATUS,
    status: newStatus
})

export const increaseAnsweredAssetCounter = () => ({
    type: ANSWERED_ASSET_COUNTER
})

export const increaseUploadCounter = () => ({
    type: UPLOAD_COUNTER
})

export const increaseAnswerCounter = () => ({
    type: ANSWER_COUNTER
})

export const resetUserStates = () => ({
    type: RESET_STATE
})

export const setSignatureAndLocationCheck = (signature, location) => ({
    type: SIGNATURE_AND_LOCATION,
    signature: signature,
    location: location
})

export const fillQuestions = (question) => ({
    type: QUESTIONS,
    newQuestion: question
})

export const fillAnswers = (answer, questionIndex) => ({
    type: ANSWERS,
    newAnswer: answer,
    questionIndex: questionIndex
})

export const fillAnswerMethods = (answerMethod) => ({
    type: ANSWER_METHODS,
    newAnswerMethod: answerMethod
})

export const fillCurrentUser = (user) => ({
    type: CURRENT_USER,
    currentUser: user
})

export const fillImageUri = (questionIndex, uri) => ({
    type: IMAGE_URI,
    imageUri: uri,
    questionIndex: questionIndex
})

export const fillVideoUri = (questionIndex, uri) => ({
    type: VIDEO_URI,
    videoUri: uri,
    questionIndex: questionIndex
})

export const fillAudioUri = (questionIndex, uri) => ({
    type: AUDIO_URI,
    audioUri: uri,
    questionIndex: questionIndex
})

export const fillSignatureUri = (uri) => ({
    type: SIGNATURE_URI,
    signatureUri: uri
})

export const fillAddress = (addressInfo) => ({
    type: ADDRESS,
    address: addressInfo
})

//UserReportDashboard Actions

export const fillMyReports = (myReport) => ({
    type: GET_MY_REPORTS,
    myReports: myReport
})

export const resetMyReports = () => ({
    type: RESET_MY_REPORTS
})

