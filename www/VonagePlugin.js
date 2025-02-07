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
    if (cordova.platformId === 'android') {
        // Android-specific permission handling
        var permissions = cordova.plugins.permissions;
        var requiredPermissions = [
            permissions.CAMERA,
            permissions.RECORD_AUDIO,
            permissions.BLUETOOTH_CONNECT,
            permissions.READ_PHONE_STATE
        ];

        permissions.hasPermission(requiredPermissions, function (status) {
            if (!status.hasPermission) {
                permissions.requestPermissions(requiredPermissions, function (requestStatus) {
                    if (requestStatus.hasPermission) {
                        successCallback();
                    } else {
                        errorCallback("Required permissions denied");
                    }
                }, function (error) {
                    errorCallback("Error requesting permissions: " + error);
                });
            } else {
                successCallback();
            }
        }, function (error) {
            errorCallback("Error checking permissions: " + error);
        });
    } else if (cordova.platformId === 'ios') {
        // iOS-specific permission handling
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(function () {
                console.log("Camera and microphone permissions granted.");
                successCallback();
            })
            .catch(function (error) {
                console.error("Error requesting camera/microphone permissions: " + error.message);
                errorCallback("Camera or microphone permission denied: " + error.message);
            });
    } else {
        errorCallback("Unsupported platform.");
    }
},

    initWithPermissions: function (apiKey, sessionId, token, elementId, successCallback, errorCallback) {
        // First check and request permissions
        this.checkPermissions(
            () => {
                console.log("All required permissions granted.");
                // Proceed with initialization and publishing
                this.init(apiKey, sessionId, token,
                    () => this.startPublishing(elementId, successCallback, errorCallback),
                    errorCallback
                );
            },
            (error) => {
                console.error("Permission check failed: " + error);
                errorCallback(error);
            }
        );
    }
};

module.exports = VonagePlugin;
