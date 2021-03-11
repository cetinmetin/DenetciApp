const initialState = []

export const reducer = (state = initialState, action) => {
    if(action.type == 'update'){
        return action.payload
    }
    return state
}