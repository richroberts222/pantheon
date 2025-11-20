# Pantheon Playwright Automation Suite

This repository contains an end-to-end Playwright automation framework that validates the **Pantheon Content Publisher Google Docs Add-On** using a real Chrome profile, persistent authentication, and a clean Page Object Model + Fixtures architecture.

Google Docs does not reliably support normal Playwright waits (intentionally blocked), so this project uses a combination of:
- Persistent Chrome profile  
- Stored authentication  
- Deterministic iframe acquisition  
- Hard waits where required  
- Page Objects + Fixtures  
- Centralized test data in JSON  

---

# 1. Prerequisites

### ✔ Install Node.js (LTS recommended)  
https://nodejs.org/

### ✔ Install Playwright browsers  
```
npx playwright install
```

### ✔ Git installed  
https or ssh is fine.

### ✔ A logged-in **real Chrome profile** (CRITICAL)

---

# 2. Required Chrome Profile Setup (CRITICAL STEP)

Google blocks automation unless you use a real profile.

You MUST prepare this folder:

```
pantheon/real-chrome-profile/Default/
```

### **STEP 1 — Locate your actual Chrome profile**

Typical Windows path:
```
C:\Users\<your name>\AppData\Local\Google\Chrome\User Data\Default
```

### **STEP 2 — Copy the entire Default folder**

Copy your real Default folder into the project:

```
pantheon/
   real-chrome-profile/
      Default/
         History
         Login Data
         Preferences
         Extensions/
         ...
```

> Important  
> Do NOT cherry-pick files.  
> Do NOT "clean" the folder.  
> Google authentication will break.

---

# 3. Generate Persistent Google Authentication

Before running the main test, you must generate:

```
google-auth-with-addon.json
```

This stores:
- Your Google login  
- Your Pantheon Add-On authorization  
- All cookies + localStorage  

### **Run the initializer script:**

```
npx playwright test tests/init-login.spec.ts --headed --debug
```

### During the test:
1. The browser opens using **your real profile**.  
2. The test pauses at `page.pause()`.  
3. **MANUALLY** open a Google Doc.  
4. Install + activate the **Pantheon Content Publisher Add-On**.  
5. Click through all Google "Allow" dialogs.  
6. Once the add-on is opened successfully → press ▶️ continue in the debugger.  
7. The script writes:

```
google-auth-with-addon.json
```

Your `.gitignore` protects this file from being committed.

---

# 4. Project Structure

```
pantheon/
│
├── fixtures/
│   └── testSetup.ts
│
├── pages/
│   ├── GoogleDocsPage.ts
│   ├── PantheonAddonPage.ts
│   └── PermissionModalsPage.ts
│
├── data/
│   └── testData.json
│
├── tests/
│   ├── maintest.spec.ts
│   └── init-login.spec.ts
│
├── real-chrome-profile/
│
├── playwright.config.js
├── package.json
└── README.md
```

---

# 5. Fixtures Overview

The fixture handles:

- launching persistent Chrome  
- initializing page objects  
- injecting them into the test  
- shutting down the browser afterward  

---

# 6. Running the Main Test

Run:

```
npx playwright test tests/maintest.spec.ts --headed
```

Debug mode:

```
npx playwright test tests/maintest.spec.ts --headed --debug
```

---

# 7. Notes About Google Docs

Google Docs:

- uses hostile DOM structures  
- reloads multiple iframes  
- blocks visibility/wait conditions  

Result:

100% reliable in `npx playwright test --headed --debug` (step mode)  
It will fail in fully automated mode

---

# 8. Included .gitignore Protections

Your `.gitignore` excludes:

- node_modules  
- reports  
- browser caches  
- your real Chrome profile  
- Google auth JSON  
- logs  

---

# 9. Summary

This suite gives you:

✔ Persistent Google login  
✔ Clean POM structure  
✔ Fixtures  
✔ JSON test data  
✔ Add-On flow automation  
✔ Final content assertion  

