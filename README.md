# MS Cafe POS (React Native + Expo + SQLite)

Login: `shubham@admin` / `Pass@123`

## Run
```
npm install
npx expo install --fix      # aligns package versions with your Expo Go
npx expo start
```
Scan the QR with Expo Go (Android). Data is stored locally in SQLite (`mscafe.db`).

## Printing
* Expo Go: "Print bill" opens the Android print dialog (58mm receipt layout).
* Direct to KP206B-UB over Bluetooth needs a native module, so use a development build:
```
npm i react-native-bluetooth-classic
npx expo install expo-dev-client
npx expo prebuild && npx expo run:android      # or: eas build --profile development --platform android
```
Pair the printer in Android Bluetooth settings first, then Home → Profile → Printer → Choose.
