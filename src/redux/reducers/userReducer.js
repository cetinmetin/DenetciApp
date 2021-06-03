import {
    ADDRESS, ANSWER_METHODS, ANSWERS, AUDIO_URI, CURRENT_USER, IMAGE_URI,
    QUESTIONS, SIGNATURE_AND_LOCATION, SIGNATURE_URI, UPLOADING_STATUS, VIDEO_URI, ANSWERED_ASSET_COUNTER,
    UPLOAD_COUNTER, ANSWER_COUNTER, RESET_STATE, GET_MY_REPORTS, RESET_MY_REPORTS
} from '../actions/userActionTypes'

const initialState = {
    statusOfUploading: false,
    counterOfAssetAnswers: 0,
    counterOfUploads: 0,
    counterOfAnswers: 0,
    haveSignature: false,
    haveLocation: false,
    questions: [],
    answers: [],
    answerMethods: [],
    currentUser: '',
    imageUri: [],
    videoUri: [],
    audioUri: [],
    address: '',
    signature: '',
    myReports: []
};

export default (payload = initialState, action) => {
    switch (action.type) {
        case UPLOADING_STATUS:
            return {
                ...payload,
                statusOfUploading: action.status
            }
        case ANSWERED_ASSET_COUNTER:
            return {
                ...payload,
                counterOfAssetAnswers: payload.counterOfAssetAnswers + 1
            }
        case UPLOAD_COUNTER:
            return {
                ...payload,
                counterOfUploads: payload.counterOfUploads + 1
            }
        case ANSWER_COUNTER:
            return {
                ...payload,
                counterOfAnswers: payload.counterOfAnswers + 1
            }
        case SIGNATURE_AND_LOCATION:
            return {
                ...payload,
                haveSignature: action.signature,
                haveLocation: action.location
            }
        case QUESTIONS:
            return {
                ...payload,
                questions: [...payload.questions, action.newQuestion]
            }
        case ANSWERS:
            const answersTemp = payload.answers.slice()
            answersTemp[action.questionIndex] = action.newAnswer
            return {
                ...payload,
                answers: answersTemp
            }
        case ANSWER_METHODS:
            return {
                ...payload,
                answerMethods: [...payload.answerMethods, action.newAnswerMethod]
            }
        case CURRENT_USER:
            return {
                ...payload,
                currentUser: action.currentUser
            }
        case IMAGE_URI:
            const imageUriTemp = payload.imageUri.slice()
            imageUriTemp[action.questionIndex] = action.imageUri
            return {
                ...payload,
                imageUri: imageUriTemp

            }
        case VIDEO_URI:
            const videoUriTemp = payload.videoUri.slice()
            videoUriTemp[action.questionIndex] = action.videoUri
            return {
                ...payload,
                videoUri: videoUriTemp
            }
        case AUDIO_URI:
            const audioUriTemp = payload.audioUri.slice()
            audioUriTemp[action.questionIndex] = action.audioUri
            return {
                ...payload,
                audioUri: audioUriTemp

            }
        case ADDRESS:
            return {
                ...payload,
                address: action.address
            }
        case SIGNATURE_URI:
            return {
                ...payload,
                signature: action.signatureUri
            }
        case GET_MY_REPORTS:
            return {
                ...payload,
                myReports: [...payload.myReports, action.myReports]
            }
        case RESET_MY_REPORTS:
            return {
                ...payload,
                myReports: initialState.myReports
            }
        case RESET_STATE:
            return initialState

        default:
            return payload
    }
}