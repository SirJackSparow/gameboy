# Local Build Guide (No EAS Account)

Since you don't have an EAS account, you can build your APK and IPA locally by generating the native project folders.

## 1. Generate Native Folders
Run this command in your project root:
```bash
npx expo prebuild
```
This will create the `android` and `ios` directories.

---

## 2. Build for Android (APK)
You will need **Android Studio** and the **Java Development Kit (JDK)** installed.

1.  Navigate to the android folder:
    ```bash
    cd android
    ```
2.  Build the release APK:
    ```bash
    ./gradlew assembleRelease
    ```
3.  Your APK will be located at:
    `android/app/build/outputs/apk/release/app-release.apk`

---

## 3. Build for iOS (IPA)
You will need **Xcode** installed on your Mac.

1.  Install CocoaPods (if not already installed):
    ```bash
    cd ios && pod install && cd ..
    ```
2.  Open the project in Xcode:
    ```bash
    open ios/reactxnative.xcworkspace
    ```
3.  In Xcode:
    *   Select your project in the sidebar.
    *   Go to **Signing & Capabilities** and set up your development team.
    *   Select **Generic iOS Device** as the build target.
    *   Go to the top menu: **Product > Archive**.
    *   Once the archive is complete, click **Distribute App** and follow the prompts to export the `.ipa` file.

---

> [!NOTE]
> Building an IPA still requires a Mac and a valid Apple ID for signing. If you are on Windows, you will only be able to build the Android APK locally.
