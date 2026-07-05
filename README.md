# LocalCart - Android Grocery List App

A modern, highly-polished, local-first grocery list application designed for Android devices. The app works entirely offline, storing all items, custom categories, stores, and product photos safely in local storage with automatic image compression to preserve device space.

---

## 📱 How to Run locally on Mobile / Create an APK

Since this is a lightweight, high-performance **React + Vite** single-page web app, you can easily wrap it into a native Android application using **Capacitor** (by Ionic) or **Cordova**.

Below is the step-by-step guide to run it on your device or build an `.apk` file.

---

### Prerequisites
Make sure you have the following installed on your development machine:
1. **Node.js** (v18 or higher) & **npm**
2. **Android Studio** (with Android SDK and Emulator configured)

---

### Method A: Package as a Native Android App with Capacitor (Recommended)

Capacitor is the modern, official web-to-native bridge by Ionic. It is the easiest way to turn this React project into a true Android application.

#### 1. Install Dependencies
Before running or building the project on your machine, you must download the required node packages (including Capacitor):
```bash
npm install
```

#### 2. Build the Production Web App
Run the build script to compile the React and Tailwind code into the standard static assets folder (`dist/`):
```bash
npm run build
```

#### 3. Initialize Capacitor Config
Initialize Capacitor with your app name and custom Android package ID:
```bash
npx cap init "LocalCart" "com.localcart.app" --web-dir=dist
```

#### 4. Add the Android Platform
Add the Android platform folder to your project:
```bash
npx cap add android
```

#### 5. Open in Android Studio & Generate APK
To compile the actual `.apk` file, sync your compiled assets with the Android directory and open the project inside Android Studio:
```bash
# Sync files
npx cap sync

# Open project in Android Studio
npx cap open android
```

Once Android Studio opens:
1. Wait for Gradle sync to complete.
2. Go to the top menu bar and select **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
3. Android Studio will compile your code and show a pop-up with a link to the generated `.apk` file (located under `android/app/build/outputs/apk/debug/app-debug.apk`).
4. Transfer this `.apk` file to your Android phone via USB, email, or cloud drive, and install it!

---

### Method B: Test Directly on your Phone over Local Wi-Fi (No APK needed!)

If you just want to quickly try the app out on your physical Android phone screen without building a full installer, follow these steps:

1. Connect both your computer and your Android phone to the **same Wi-Fi network**.
2. Run `npm install` to download all necessary packages.
3. Find your computer's local IP address (e.g., `192.168.1.50`):
   - **Mac/Linux:** Open terminal and run `ipconfig` or `ifconfig`.
   - **Windows:** Open command prompt and run `ipconfig`.
4. Start the Vite development server bound to your local network host:
   ```bash
   npm run dev -- --host
   ```
5. Look at the terminal output. It will show a URL like:
   `http://192.168.1.50:3000`
6. Open your mobile phone's browser (Chrome, Edge, etc.) and visit that URL.
7. **Add to Home Screen (PWA):** To make it behave like a native full-screen app, tap the **Three Dots Menu** in Chrome and select **"Add to Home screen"**. It will install a native-feeling standalone launcher icon on your phone!

---

## 🛠️ Key Features Built-In

- **Local Offline Storage**: Stores all grocery items, states, categories, and stores locally inside your phone's storage. Works completely without cellular data or Wi-Fi.
- **Smart Photo Capture**: Allows snapping real photos of grocery items via the phone's native camera stream or choosing a photo from files.
- **Auto Image Compression**: Dynamically shrinks high-res camera photos down to safe light-weight 15-20KB JPEGs behind the scenes to avoid exhausting local storage capacity.
- **Filtering & Sorting**: Instantly filter your list by Category and Shop, or sort alphabetically, by date added, category, or shop.
- **Backup Export & Import**: Export your list to a portable `.json` backup file or import it onto another phone.
