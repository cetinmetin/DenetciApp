module.exports = {
    address: '',
    signature: '',
    imageUri: [],
    videoUri: [],
    audioUri: [],
    clearGlobalVariables
};

function clearGlobalVariables(){
    this.address = ''
    this.signature = ''
    this.imageUri = []
    this.videoUri = []
    this.audioUri = []
}