# IoT DAB Deployer

Includes both the device firmware and updater scripts that be run by the deployer. The device will be running any OS that supports NodeJS and so will the deployer. The deployer will be running the update script after a release build finishes.

## Pipeline

![Deployment Pipeline](https://drive.google.com/uc?export=view&id=1zUSyi6NoOf3yESxkTFBi0hxxQEjpmF1h)

## Deployer

* Running an OS that supports NodeJS
* Connected to the Azure IoT Hub
* Publishes the release bundle to Github Releases
* Notifies DABs that an update is available

## DAB Device

* Running an OS that supports NodeJS
* Connected to the Azure IoT Hub and accepting commands
* Provides an internal rollback mechanism to a known good release
* Pulls the release bundle from Github after receiving update notification
* Stops currently running program and starts updated program
