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
        if (cordova.platformId === "android") {
            this.checkAndroidPermissions(successCallback, errorCallback);
        } else if (cordova.platformId === "ios") {
            this.checkIOSPermissions(successCallback, errorCallback);
        } else {
            errorCallback("Unsupported platform");
        }
    },

    checkAndroidPermissions: function (successCallback, errorCallback) {
        var permissions = cordova.plugins.permissions;

        // List of required permissions
        var requiredPermissions = [
            permissions.CAMERA,
            permissions.RECORD_AUDIO,
            permissions.READ_PHONE_STATE,
            permissions.MODIFY_AUDIO_SETTINGS,
            permissions.INTERNET
        ];

        // Add Bluetooth permission based on Android version
        if (this.isAndroid12OrHigher()) {
            requiredPermissions.push(permissions.BLUETOOTH_CONNECT);
        } else {
            requiredPermissions.push(permissions.BLUETOOTH);
        }

        // Check if all required permissions are granted
        permissions.hasPermission(requiredPermissions, function (status) {
            if (!status.hasPermission) {
                // Request all required permissions
                permissions.requestPermissions(requiredPermissions, function (requestStatus) {
                    if (requestStatus.hasPermission) {
                        successCallback("All required permissions granted");
                    } else {
                        errorCallback("One or more permissions were denied");
                    }
                }, function (error) {
                    errorCallback("Error requesting permissions: " + error);
                });
            } else {
                successCallback("All required permissions already granted");
            }
        }, function (error) {
            errorCallback("Error checking permissions: " + error);
        });
    },

    checkIOSPermissions: function (successCallback, errorCallback) {
        // Use getUserMedia to request camera and microphone access
        navigator.mediaDevices.getUserMedia({ audio: true, video: true })
            .then(function (stream) {
                // Stop the tracks to release the camera/microphone
                stream.getTracks().forEach(track => track.stop());
                successCallback("Camera and microphone permissions granted");
            })
            .catch(function (error) {
                let message;
                if (error.name === "NotAllowedError") {
                    message = "Camera or microphone permission denied by user";
                } else if (error.name === "NotFoundError") {
                    message = "No media devices found";
                } else {
                    message = "An error occurred while requesting permissions: " + error.message;
                }
                errorCallback(message);
            });
    },

    isAndroid12OrHigher: function () {
        // Use the Cordova device plugin to get the Android version
        return parseInt(device.version.split(".")[0]) >= 12;
    }
};

module.exports = VonagePlugin;