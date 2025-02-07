var VonagePlugin = {
    init: function (apiKey, sessionId, token, successCallback, errorCallback) {
        // Initialize Vonage Video SDK
        var session = OT.initSession(apiKey, sessionId);
        session.connect(token, function (error) {
            if (error) {
                errorCallback(error);
            } else {
                successCallback();
            }
        });

        // Store session for later use
        this.session = session;
    },

    startPublishing: function (elementId, successCallback, errorCallback) {
        if (!this.session) {
            errorCallback("Session not initialized");
            return;
        }

        // Create a publisher and attach it to the specified div
        var publisher = OT.initPublisher(elementId, {
            insertMode: 'append',
            width: '100%',
            height: '100%'
        }, function (error) {
            if (error) {
                errorCallback(error);
            } else {
                successCallback();
            }
        });

        // Publish the stream
        this.session.publish(publisher, function (error) {
            if (error) {
                errorCallback(error);
            }
        });
    },

    checkPermissions: function (successCallback, errorCallback) {
        // Check Camera Authorization
        cordova.plugins.diagnostic.isCameraAuthorized(function (cameraAuthorized) {
            if (!cameraAuthorized) {
                // Request Camera Authorization
                cordova.plugins.diagnostic.requestCameraAuthorization(function (cameraStatus) {
                    if (cameraStatus === cordova.plugins.diagnostic.permissionStatus.GRANTED) {
                        console.log("Camera permission granted");
                        // Check Microphone Authorization
                        VonagePlugin.checkMicrophonePermission(successCallback, errorCallback);
                    } else {
                        errorCallback("Camera permission denied");
                    }
                }, function (error) {
                    errorCallback("Error requesting camera permission: " + error);
                });
            } else {
                // Check Microphone Authorization
                VonagePlugin.checkMicrophonePermission(successCallback, errorCallback);
            }
        }, function (error) {
            errorCallback("Error checking camera permission: " + error);
        });
    },

    checkMicrophonePermission: function (successCallback, errorCallback) {
        cordova.plugins.diagnostic.isMicrophoneAuthorized(function (microphoneAuthorized) {
            if (!microphoneAuthorized) {
                // Request Microphone Authorization
                cordova.plugins.diagnostic.requestMicrophoneAuthorization(function (microphoneStatus) {
                    if (microphoneStatus === cordova.plugins.diagnostic.permissionStatus.GRANTED) {
                        console.log("Microphone permission granted");
                        successCallback();
                    } else {
                        errorCallback("Microphone permission denied");
                    }
                }, function (error) {
                    errorCallback("Error requesting microphone permission: " + error);
                });
            } else {
                successCallback();
            }
        }, function (error) {
            errorCallback("Error checking microphone permission: " + error);
        });
    }
};

module.exports = VonagePlugin;
