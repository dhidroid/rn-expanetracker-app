# AGENTS.md

## Commands

```bash
npm start              # Start Metro bundler
npm run android       # Build and run Android
npm run ios           # Build and run iOS
npm run lint          # ESLint
npm test              # Jest tests
```

## iOS Setup (Required)

Before running iOS the first time:

```bash
bundle install
cd ios && bundle exec pod install && cd ..
```

Re-run `bundle exec pod install` after updating native dependencies.

## Requirements

- Node >= 22.11.0
- Ruby >= 2.6.10 (see Gemfile for version constraints)
- CocoaPods >= 1.13

## Project Structure

- Entry: `App.tsx`
- Tests: `__tests__/`
- iOS native code: `ios/ExpanceTracker/`
- Android native code: `android/app/src/main/java/com/expancetracker/`
