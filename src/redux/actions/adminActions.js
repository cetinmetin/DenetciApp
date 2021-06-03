import {
    TIMESTAMP, QUESTION_DOWN, QUESTION_UP, RESET_STATE, REPORTS, USERS_WHO_HAVE_REPORTED, RESET_REPORTS, USER_INFOS_WHO_HAVE_REPORTED
} from './adminActionTypes'

export const fillTimeStamps = (newTimeStamp) => ({
    type: TIMESTAMP,
    state: newTimeStamp
})
export const questionToDown = (index) => ({
    type: QUESTION_DOWN,
    index: index
})
export const questionToUp = (index) => ({
    type: QUESTION_UP,
    index: index
})
export const resetAdminStates = () => ({
    type: RESET_STATE
})

//AdminReportDashboard Actions
export const fillUsersWhoWhaveReported = (user) => ({
    type: USERS_WHO_HAVE_REPORTED,
    users: user
})
export const fillReportsForAdmin = (report) => ({
    type: REPORTS,
    reports: report
})
export const resetReport = () => ({
    type: RESET_REPORTS
})
export const fillUserInfosWhoHaveReported = (userInfos) => ({
    type: USER_INFOS_WHO_HAVE_REPORTED,
    userInfos: userInfos
})