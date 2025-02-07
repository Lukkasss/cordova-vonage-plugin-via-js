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
        var permissions = cordova.plugins.permissions;

        // List of required permissions
        var requiredPermissions = [
            permissions.CAMERA,
            permissions.RECORD_AUDIO,
            permissions.BLUETOOTH_CONNECT,
            permissions.READ_PHONE_STATE
        ];

        // Check if all required permissions are granted
        permissions.hasPermission(requiredPermissions, function (status) {
            if (!status.hasPermission) {
                // Request all required permissions
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
    }
};

module.exports = VonagePlugin;