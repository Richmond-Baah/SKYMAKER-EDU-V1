# ESP-Drone Educational Platform - User Manual

## 1. Introduction
This platform enables you to program and control the ESP-Drone using a modern web interface. You can fly the drone manually using onscreen joysticks or write Python-like scripts to automate its flight.

## 2. Prerequisites
Before you begin, ensure you have:
- **ESP-Drone Hardware**: Assembled and battery charged.
- **Computer**: Windows PC with Wi-Fi capability.
- **Software**: 
    - Node.js (Installed automatically via helper script if missing, but better to have it).
    - ESP-IDF (Only required if you need to re-flash the drone firmware).

## 3. Flashing the Firmware (Only if needed)
If your drone is not yet flashed with the `esp-drone` firmware, follow these steps.
*Note: If your drone broadcasts a Wi-Fi named `ESP-DRONE_XXXX`, it is already flashed. You can skip this.*

1.  **Install ESP-IDF**: Follow the official guide for [ESP32-S2](https://docs.espressif.com/projects/esp-idf/en/release-v4.4/esp32s2/get-started/index.html).
2.  **Open Terminal**: Navigate to `.../Firmware/esp-drone` folder.
3.  **Build & Flash**:
    ```bash
    idf.py set-target esp32s2
    idf.py build
    idf.py -p COMx flash
    ```
    *(Replace `COMx` with your drone's COM port, e.g., COM3).*

## 4. Connecting to the Drone
The drone acts as a Wi-Fi Access Point.
1.  Power on the drone.
2.  On your computer, search for Wi-Fi networks.
3.  Connect to: **`ESP-DRONE_XXXXXX`**
4.  Password: **`12345678`**

> [!IMPORTANT]
> Your computer loses internet access while connected to the drone. This is normal. The web platform has been optimized to work offline.

## 5. Starting the Platform
1.  Open your project folder in File Explorer.
2.  Double-click **`start_platform.bat`**.
3.  A terminal window will open. Wait for the message:
    `Ready in XXXms`
4.  Your default web browser should open automatically to `http://localhost:3000`.

## 6. Using the Interface

### Manual Control
1.  Click **Manual Control** in the sidebar.
2.  Click the **Takeoff / Arm** button (Rocket Icon).
    *   *Status will change to "Flying".*
3.  **Joysticks**:
    *   **Left Stick**: Up/Down (Throttle), Left/Right (Rotate/Yaw).
    *   **Right Stick**: Up/Down (Forward/Backward), Left/Right (Slide Left/Right).
4.  **Land**: Click the **Land** button to stop motors safely.

### Coding with Python
1.  Click **Code Editor** in the sidebar.
2.  Write your script in the editor.
    *   **Example**:
        ```python
        drone.takeoff()
        drone.hover(duration=2)
        drone.land()
        ```
3.  Click **Execute Script**.
4.  Watch the Console below for progress.

## 7. Troubleshooting
*   **"Unable to acquire lock"**: Close all terminal windows and run `start_platform.bat` again.
*   **Drone not responding**: Ensure you are connected to `ESP-DRONE` Wi-Fi.
*   **Browser loading forever**: Use `start_platform.bat` which disables online font downloads.

---
*Happy Flying!*
