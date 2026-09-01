# PayFlow Android APK Build & Run Commands Guide 🚀

এই ফাইলটিতে PayFlow প্রজেক্টটি Android Studio-তে চালানো, কোড আপডেট করা এবং APK তৈরি করার সব প্রয়োজনীয় কমান্ড সুন্দরভাবে ধাপে ধাপে দেওয়া হলো।

---

## ১. প্রথমবার Android Setup করার কমান্ডসমূহ (One-Time Setup)

যদি কখনো নতুন করে প্রজেক্ট ক্লোন বা সেটআপ করতে হয়:

```bash
# ১. ডিপেন্ডেন্সি ইনস্টল
npm install

# ২. Capacitor কোর এবং অ্যান্ড্রয়েড প্লাগইন ইনস্টল
npm install @capacitor/core
npm install -D @capacitor/cli @capacitor/android

# ৩. Capacitor ইনিশিয়ালাইজ (প্রয়োজনে)
npx cap init PayFlow com.payflow.salaryapp --web-dir dist

# ৪. ওয়েব অ্যাপের বিল্ড তৈরি
npm run build

# ৫. অ্যান্ড্রয়েড ফোল্ডার তৈরি
npx cap add android

# ৬. ফাইল কপি
npx cap copy android
```

---

## ২. কোড এডিট করার পর ফ্রেশ APK তৈরি করার কমান্ড (সবচেয়ে বেশি ব্যবহৃত)

যেকোনো সময় কোড এডিট বা আপডেট করার পর নতুন APK পেতে এই ৩টি কমান্ড দিন:

```bash
# ধাপ ১: প্রোডাকশন বিল্ড তৈরি
npm run build

# ধাপ ২: নতুন বিল্ড ফাইলগুলো অ্যান্ড্রয়েডে পাঠান
npx cap copy android

# ধাপ ৩: সরাসরি টার্মিনাল থেকে APK তৈরি
cd android
./gradlew assembleDebug
```

> **তৈরি হওয়া APK ফাইলের লোকেশন:**  
> `D:\Android_Apps\PayFlowV2\android\app\build\outputs\apk\debug\app-debug.apk`

---

## ৩. Android Studio ওপেন করার কমান্ড

যদি টার্মিনাল থেকে সরাসরি Android Studio লঞ্চ করতে চান (যেহেতু এটি D ড্রাইভে ইনস্টল করা):

```bash
CAPACITOR_ANDROID_STUDIO_PATH="D:\\Android\\Android Studio\\bin\\studio64.exe" npx cap open android
```

অথবা:
1. সরাসরি **Android Studio** ওপেন করুন।
2. **Open Project** দিয়ে `D:\Android_Apps\PayFlowV2\android` ফোল্ডারটি সিলেক্ট করুন।
3. মেনুবার থেকে যান: **Build > Build Bundle(s) / APK(s) > Build APK(s)**
4. ডানপাশে নিচে **`locate`** বাটনে ক্লিক করলেই APK পেয়ে যাবেন।

---

## ৪. সাধারণ সমস্যা ও সমাধান (Troubleshooting)

### সমস্যা ১: `EBUSY: resource busy or locked` এরর আসলে
```bash
# প্লাগইন আপডেট স্কিপ করে শুধু ওয়েব ফাইল কপি করুন
npx cap copy android
```

### সমস্যা ২: `JAVA_HOME is not set` এরর আসলে (টার্মিনালে)
```bash
export JAVA_HOME="D:/Android/Android Studio/jbr"
export PATH="$JAVA_HOME/bin:$PATH"
./gradlew assembleDebug
```

### সমস্যা ৩: অ্যান্ড্রয়েড ফোল্ডার সম্পূর্ণ ফ্রেশ করতে চাইলে
```bash
rm -rf android
npm run build
npx cap add android
npx cap copy android
```

---

## ৫. সংক্ষেপে এক লাইনে পুরো বিল্ড প্রসেস (One-Liner Command)

```bash
npm run build && npx cap copy android
```
এরপর Android Studio থেকে **Run (▶)** বাটনে চাপুন অথবা **Build APK** করুন।
