import {
    TIMESTAMP, QUESTION_DOWN, QUESTION_UP, RESET_STATE, REPORTS, USERS_WHO_HAVE_REPORTED, RESET_REPORTS, USER_INFOS_WHO_HAVE_REPORTED
} from '../actions/adminActionTypes'

const initialState = {
    timeStamps: [],
    reports: [],
    usersWhoHaveReported: [],
    userInfosWhoHaveReported: []
};

export default (payload = initialState, action) => {
    switch (action.type) {
        case TIMESTAMP:
            return {
                ...payload,
                timeStamps: [...payload.timeStamps, action.state]
            }
        case QUESTION_DOWN:
            {
                const timeStampTemp = payload.timeStamps[action.index + 1].seconds
                payload.timeStamps[action.index + 1].seconds = payload.timeStamps[action.index].seconds
                payload.timeStamps[action.index].seconds = timeStampTemp
                return {
                    ...payload,
                    timeStamp: payload.timeStamps
                }
            }
        case QUESTION_UP:
            {
                const timeStampTemp = payload.timeStamps[action.index - 1].seconds
                payload.timeStamps[action.index - 1].seconds = payload.timeStamps[action.index].seconds
                payload.timeStamps[action.index].seconds = timeStampTemp
                return {
                    ...payload,
                    timeStamp: payload.timeStamps
                }
            }
        case REPORTS:
            return {
                ...payload,
                reports: [...payload.reports, action.reports]
            }
        case USERS_WHO_HAVE_REPORTED:
            return {
                ...payload,
                usersWhoHaveReported: [...payload.usersWhoHaveReported, action.users]
            }
        case RESET_REPORTS:
            return {
                ...payload,
                reports: initialState.reports,
                usersWhoHaveReported: initialState.usersWhoHaveReported,
                userInfosWhoHaveReported: initialState.userInfosWhoHaveReported
            }
        case USER_INFOS_WHO_HAVE_REPORTED:
            return {
                ...payload,
                userInfosWhoHaveReported: [...payload.userInfosWhoHaveReported, action.userInfos]
            }
        case RESET_STATE:
            return initialState

        default:
            return payload
    }
}