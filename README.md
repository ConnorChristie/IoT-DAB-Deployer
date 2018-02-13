# IoT DAB Deployer

Includes both the device firmware and updater scripts that be run by the deployer. The device will be running any OS that supports NodeJS and so will the deployer. The deployer will be running the update script after a release build finishes.

## Pipeline

![Deployment Pipeline](https://drive.google.com/uc?export=view&id=1zUSyi6NoOf3yESxkTFBi0hxxQEjpmF1h)

## Deployment / Build Server

* Running an OS that supports NodeJS
* Connected to the Azure IoT Hub
* Publishes the release bundle to Github Releases
* Notifies DABs that an update is available

### Implementation

* Running Jenkins 2.89.3 with the Blue Ocean pipeline plugin installed
* Configured with NodeJS 8.9.4 installed to run the deployment script for Azure IoT
* Jenkins bundles up the release builds into a zip and publishes them to Github Releases
* Once the build finishes, each DAB is notified via Azure IoT notifications that a new update is available

## DAB Device

* Running an OS that supports NodeJS
* Connected to the Azure IoT Hub and accepting commands
* Provides an internal rollback mechanism to a known good release
* Pulls the release bundle from Github after receiving update notification
* Stops currently running program and starts updated program

### Implementation

* Running Linux with NodeJS 8.9.4 installed
* Configured to autostart the update_service script upon boot
* The update script starts the program and handles all update notifications
* Upon update notification, the currently running program is stopped and the updated version is installed
    * If an error occurs while updating, the DAB will automatically roll itself back to the previously running build
    * A notification is also sent back to the deployment server indicating a failure

## Glossary

* __Data Acquisition Buoy (DAB):__ A device set out in a lake to collect data about the water around it, sending its data back to the central system.
* __Deployment Server:__ A server that deploys the binary created by the build server to selected devices. 
* __Build Server:__ A build server, also called a continuous integration server (CI server), is a centralized, stable and reliable environment for building distributed development projects.