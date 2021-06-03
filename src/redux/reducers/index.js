import { combineReducers } from 'redux'
import userReducer from './userReducer'
import adminReducer from './adminReducer'

const rootReducer = combineReducers({
    userReducer: userReducer,
    adminReducer: adminReducer
})

export default rootReducer