# Native Push Notifications Implementation Guide

## Overview

This guide covers the complete setup for native push notifications in iOS and Android apps built with Capacitor. Native push notifications use different systems than web push:

- **iOS**: Apple Push Notification service (APNs)
- **Android**: Firebase Cloud Messaging (FCM)

Both are integrated via the **Capacitor Push Notifications Plugin**.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Apple APNs Setup (iOS)](#apple-apns-setup-ios)
3. [Firebase FCM Setup (Android)](#firebase-fcm-setup-android)
4. [Capacitor Plugin Integration](#capacitor-plugin-integration)
5. [Frontend Implementation](#frontend-implementation)
6. [Backend Edge Function Updates](#backend-edge-function-updates)
7. [Database Schema Updates](#database-schema-updates)
8. [Testing Guide](#testing-guide)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, ensure you have:

- [ ] Apple Developer Account ($99/year) - https://developer.apple.com
- [ ] Google/Firebase Account (Free) - https://console.firebase.google.com
- [ ] Xcode installed (Mac required for iOS)
- [ ] Android Studio installed
- [ ] Capacitor already set up in your project

---

## Apple APNs Setup (iOS)

### Step 1: Create an App ID

1. Go to [Apple Developer Portal](https://developer.apple.com/account)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Click **Identifiers** → **+** button
4. Select **App IDs** → **Continue**
5. Select **App** → **Continue**
6. Fill in:
   - **Description**: SmartyGym
   - **Bundle ID**: `com.smartygym.app` (must match capacitor.config.ts appId)
7. Scroll down to **Capabilities** and check **Push Notifications**
8. Click **Continue** → **Register**

### Step 2: Create an APNs Key

1. In Apple Developer Portal, go to **Keys**
2. Click **+** to create a new key
3. Enter:
   - **Key Name**: SmartyGym Push Key
4. Check **Apple Push Notifications service (APNs)**
5. Click **Continue** → **Register**
6. **IMPORTANT**: Download the `.p8` file immediately (you can only download it once!)
7. Note down:
   - **Key ID**: (shown on the key details page, e.g., `ABC123DEFG`)
   - **Team ID**: (found in top right of developer portal or Membership page)

### Step 3: Store APNs Credentials

You'll need these values for your backend:
```
APNS_KEY_ID=ABC123DEFG
APNS_TEAM_ID=TEAMID1234
APNS_KEY_CONTENT=(contents of the .p8 file)
APNS_BUNDLE_ID=com.smartygym.app
```

### Step 4: Configure Xcode Project

After running `npx cap add ios`:

1. Open the iOS project: `npx cap open ios`
2. Select your project in the navigator
3. Go to **Signing & Capabilities** tab
4. Click **+ Capability**
5. Add **Push Notifications**
6. Add **Background Modes** and check:
   - Remote notifications
   - Background fetch

---

## Firebase FCM Setup (Android)

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **Add project**
3. Enter project name: `SmartyGym`
4. Disable Google Analytics (optional, can enable later)
5. Click **Create project**

### Step 2: Add Android App to Firebase

1. In your Firebase project, click the **Android icon** to add an app
2. Enter:
   - **Android package name**: `com.smartygym.app` (must match capacitor.config.ts appId)
   - **App nickname**: SmartyGym (optional)
   - **Debug signing certificate SHA-1**: (optional for now)
3. Click **Register app**

### Step 3: Download Configuration File

1. Download `google-services.json`
2. Place it in your project at: `android/app/google-services.json`

### Step 4: Get FCM Server Key

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Go to **Cloud Messaging** tab
3. If you see \"Cloud Messaging API (Legacy)\" is disabled:
   - Click the three dots menu → **Manage API in Google Cloud Console**
   - Enable the API
4. Note down the **Server key** (or create a new one)

**For newer Firebase projects (v1 API):**
1. Go to **Project Settings** → **Service accounts**
2. Click **Generate new private key**
3. Download the JSON file - this contains credentials for the Firebase Admin SDK

### Step 5: Store FCM Credentials

You'll need these for your backend:
```
FCM_SERVER_KEY=AAAA... (Legacy API)
# OR for v1 API:
FCM_PROJECT_ID=smartygym-xxxxx
FCM_PRIVATE_KEY=(from service account JSON)
FCM_CLIENT_EMAIL=(from service account JSON)
```

---

## Capacitor Plugin Integration

### Step 1: Install the Plugin

```bash
npm install @capacitor/push-notifications
npx cap sync
```

### Step 2: Android Configuration

Edit `android/app/build.gradle`, ensure these are present:

```gradle
dependencies {
    // ... other dependencies
    implementation platform('com.google.firebase:firebase-bom:32.7.0')
    implementation 'com.google.firebase:firebase-messaging'
}
```

Edit `android/build.gradle`:
```gradle
buildscript {
    dependencies {
        // ... other dependencies
        classpath 'com.google.gms:google-services:4.4.0'
    }
}
```

Add to the end of `android/app/build.gradle`:
```gradle
apply plugin: 'com.google.gms.google-services'
```

### Step 3: iOS Configuration

The Capacitor plugin handles most iOS configuration automatically. Ensure your `ios/App/App/AppDelegate.swift` includes push notification handling (Capacitor adds this by default).

---

## Frontend Implementation

### Create Push Notification Hook

Create `src/hooks/useNativePushNotifications.ts`:

```typescript
import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications, Token, PushNotificationSchema } from '@capacitor/push-notifications';
import { supabase } from '@/integrations/supabase/client';

export const useNativePushNotifications = () => {
  const [token, setToken] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<string>('unknown');

  useEffect(() => {
    // Only run on native platforms
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    setIsSupported(true);
    initializePushNotifications();
  }, []);

  const initializePushNotifications = async () => {
    // Check current permission status
    const permStatus = await PushNotifications.checkPermissions();
    setPermissionStatus(permStatus.receive);

    // Request permission if not determined
    if (permStatus.receive === 'prompt') {
      const result = await PushNotifications.requestPermissions();
      setPermissionStatus(result.receive);
      
      if (result.receive !== 'granted') {
        console.log('Push notification permission denied');
        return;
      }
    }

    if (permStatus.receive === 'granted') {
      // Register for push notifications
      await PushNotifications.register();
    }

    // Listen for registration success
    PushNotifications.addListener('registration', async (token: Token) => {
      console.log('Push registration success, token:', token.value);
      setToken(token.value);
      await saveTokenToDatabase(token.value);
    });

    // Listen for registration errors
    PushNotifications.addListener('registrationError', (error: any) => {
      console.error('Push registration error:', error);
    });

    // Listen for incoming notifications when app is in foreground
    PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
      console.log('Push notification received:', notification);
      // Handle foreground notification (show in-app toast, etc.)
    });

    // Listen for notification tap/action
    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('Push notification action performed:', notification);
      // Handle notification tap (navigate to specific screen, etc.)
      const data = notification.notification.data;
      if (data?.url) {
        window.location.href = data.url;
      }
    });
  };

  const saveTokenToDatabase = async (deviceToken: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const platform = Capacitor.getPlatform(); // 'ios' or 'android'
      
      // Upsert the device token
      const { error } = await supabase
        .from('native_push_tokens')
        .upsert({
          user_id: user.id,
          device_token: deviceToken,
          platform: platform,
          is_active: true,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,device_token'
        });

      if (error) {
        console.error('Error saving push token:', error);
      }
    } catch (error) {
      console.error('Error in saveTokenToDatabase:', error);
    }
  };

  const requestPermission = async () => {
    if (!isSupported) return false;
    
    const result = await PushNotifications.requestPermissions();
    setPermissionStatus(result.receive);
    
    if (result.receive === 'granted') {
      await PushNotifications.register();
      return true;
    }
    return false;
  };

  return {
    token,
    isSupported,
    permissionStatus,
    requestPermission
  };
};
```

### Create Push Notification Provider

Create `src/components/NativePushProvider.tsx`:

```typescript
import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { useNativePushNotifications } from '@/hooks/useNativePushNotifications';

export const NativePushProvider = ({ children }: { children: React.ReactNode }) => {
  const { isSupported, permissionStatus } = useNativePushNotifications();

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      console.log('Native push notifications:', { isSupported, permissionStatus });
    }
  }, [isSupported, permissionStatus]);

  return <>{children}</>;
};
```

### Add to App

Wrap your app with the provider in `src/App.tsx`:

```typescript
import { NativePushProvider } from '@/components/NativePushProvider';

function App() {
  return (
    <NativePushProvider>
      {/* ... rest of your app */}
    </NativePushProvider>
  );
}
```

---

## Backend Edge Function Updates

### Create Combined Push Notification Function

Create/update `supabase/functions/send-native-push/index.ts`:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PushRequest {
  userId?: string;
  userIds?: string[];
  title: string;
  body: string;
  data?: Record<string, string>;
  url?: string;
}

// Send iOS push notification via APNs
async function sendAPNs(deviceToken: string, payload: any) {
  const keyId = Deno.env.get('APNS_KEY_ID');
  const teamId = Deno.env.get('APNS_TEAM_ID');
  const keyContent = Deno.env.get('APNS_KEY_CONTENT');
  const bundleId = Deno.env.get('APNS_BUNDLE_ID') || 'com.smartygym.app';
  
  if (!keyId || !teamId || !keyContent) {
    console.error('APNs credentials not configured');
    return { success: false, error: 'APNs not configured' };
  }

  // Generate JWT for APNs authentication
  const jwt = await generateAPNsJWT(keyId, teamId, keyContent);
  
  // Use production URL for App Store apps, sandbox for development
  const apnsUrl = Deno.env.get('APNS_PRODUCTION') === 'true'
    ? `https://api.push.apple.com/3/device/${deviceToken}`
    : `https://api.sandbox.push.apple.com/3/device/${deviceToken}`;

  try {
    const response = await fetch(apnsUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwt}`,
        'apns-topic': bundleId,
        'apns-push-type': 'alert',
        'apns-priority': '10',
      },
      body: JSON.stringify({
        aps: {
          alert: {
            title: payload.title,
            body: payload.body,
          },
          sound: 'default',
          badge: 1,
        },
        ...payload.data,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('APNs error:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error('APNs request failed:', error);
    return { success: false, error: error.message };
  }
}

// Generate JWT for APNs authentication
async function generateAPNsJWT(keyId: string, teamId: string, keyContent: string) {
  const header = {
    alg: 'ES256',
    kid: keyId,
  };
  
  const now = Math.floor(Date.now() / 1000);
  const claims = {
    iss: teamId,
    iat: now,
  };

  // Import the key and sign
  const encoder = new TextEncoder();
  const keyData = keyContent.replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s/g, '');
  
  const binaryKey = Uint8Array.from(atob(keyData), c => c.charCodeAt(0));
  
  const key = await crypto.subtle.importKey(
    'pkcs8',
    binaryKey,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  );

  const headerB64 = btoa(JSON.stringify(header));
  const claimsB64 = btoa(JSON.stringify(claims));
  const toSign = encoder.encode(`${headerB64}.${claimsB64}`);
  
  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    key,
    toSign
  );

  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)));
  
  return `${headerB64}.${claimsB64}.${signatureB64}`;
}

// Send Android push notification via FCM
async function sendFCM(deviceToken: string, payload: any) {
  const serverKey = Deno.env.get('FCM_SERVER_KEY');
  
  if (!serverKey) {
    console.error('FCM server key not configured');
    return { success: false, error: 'FCM not configured' };
  }

  try {
    const response = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Authorization': `key=${serverKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: deviceToken,
        notification: {
          title: payload.title,
          body: payload.body,
          sound: 'default',
        },
        data: payload.data || {},
        priority: 'high',
      }),
    });

    const result = await response.json();
    
    if (result.failure > 0) {
      console.error('FCM error:', result.results);
      return { success: false, error: result.results };
    }

    return { success: true, messageId: result.results[0]?.message_id };
  } catch (error) {
    console.error('FCM request failed:', error);
    return { success: false, error: error.message };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const body: PushRequest = await req.json();
    const { userId, userIds, title, body: messageBody, data, url } = body;

    // Get target user IDs
    const targetUserIds = userIds || (userId ? [userId] : []);
    
    if (targetUserIds.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No target users specified' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch active device tokens for target users
    const { data: tokens, error: tokensError } = await supabase
      .from('native_push_tokens')
      .select('user_id, device_token, platform')
      .in('user_id', targetUserIds)
      .eq('is_active', true);

    if (tokensError) {
      console.error('Error fetching tokens:', tokensError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch device tokens' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!tokens || tokens.length === 0) {
      console.log('No active device tokens found for users');
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: 'No active device tokens' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const payload = {
      title,
      body: messageBody,
      data: { ...data, url: url || '' },
    };

    const results = {
      ios: { sent: 0, failed: 0 },
      android: { sent: 0, failed: 0 },
    };

    // Send to each device
    for (const token of tokens) {
      let result;
      
      if (token.platform === 'ios') {
        result = await sendAPNs(token.device_token, payload);
        if (result.success) {
          results.ios.sent++;
        } else {
          results.ios.failed++;
          // Mark token as inactive if it's invalid
          if (result.error?.includes('BadDeviceToken') || result.error?.includes('Unregistered')) {
            await supabase
              .from('native_push_tokens')
              .update({ is_active: false })
              .eq('device_token', token.device_token);
          }
        }
      } else if (token.platform === 'android') {
        result = await sendFCM(token.device_token, payload);
        if (result.success) {
          results.android.sent++;
        } else {
          results.android.failed++;
          // Mark token as inactive if it's invalid
          if (result.error?.some?.((e: any) => e.error === 'NotRegistered')) {
            await supabase
              .from('native_push_tokens')
              .update({ is_active: false })
              .eq('device_token', token.device_token);
          }
        }
      }
    }

    console.log('Push notification results:', results);

    return new Response(
      JSON.stringify({ 
        success: true, 
        results,
        totalSent: results.ios.sent + results.android.sent,
        totalFailed: results.ios.failed + results.android.failed,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in send-native-push:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

---

## Database Schema Updates

Run this migration to add native push token storage:

```sql
-- Create table for native push tokens
CREATE TABLE IF NOT EXISTS public.native_push_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_token TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, device_token)
);

-- Enable RLS
ALTER TABLE public.native_push_tokens ENABLE ROW LEVEL SECURITY;

-- Users can manage their own tokens
CREATE POLICY "Users can view their own tokens"
  ON public.native_push_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tokens"
  ON public.native_push_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tokens"
  ON public.native_push_tokens FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tokens"
  ON public.native_push_tokens FOR DELETE
  USING (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX idx_native_push_tokens_user_id ON public.native_push_tokens(user_id);
CREATE INDEX idx_native_push_tokens_active ON public.native_push_tokens(is_active) WHERE is_active = true;

-- Trigger to update updated_at
CREATE TRIGGER update_native_push_tokens_updated_at
  BEFORE UPDATE ON public.native_push_tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
```

---

## Required Secrets

Add these secrets to your backend:

### For iOS (APNs):
| Secret Name | Description |
|-------------|-------------|
| `APNS_KEY_ID` | Key ID from Apple Developer Portal |
| `APNS_TEAM_ID` | Your Apple Developer Team ID |
| `APNS_KEY_CONTENT` | Contents of the .p8 key file |
| `APNS_BUNDLE_ID` | App bundle ID (com.smartygym.app) |
| `APNS_PRODUCTION` | Set to "true" for production, empty for sandbox |

### For Android (FCM):
| Secret Name | Description |
|-------------|-------------|
| `FCM_SERVER_KEY` | Firebase Cloud Messaging server key |

---

## Testing Guide

### Test iOS Notifications

1. Build and run on a physical iOS device (simulators don't support push)
2. Ensure the app has notification permissions
3. Use this curl command to test:

```bash
curl -X POST https://cvccrvyimyzrxcwzmxwk.supabase.co/functions/v1/send-native-push \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "userId": "USER_UUID_HERE",
    "title": "Test Notification",
    "body": "This is a test push notification!",
    "url": "/dashboard"
  }'
```

### Test Android Notifications

1. Build and run on Android device or emulator
2. Ensure `google-services.json` is in place
3. Use the same curl command as above

### Common Test Scenarios

- [ ] App in foreground - notification received
- [ ] App in background - notification appears in system tray
- [ ] App closed - notification appears in system tray
- [ ] Tap notification - app opens to correct screen
- [ ] Multiple devices - all devices receive notification

---

## Troubleshooting

### iOS Issues

| Problem | Solution |
|---------|----------|
| No token received | Check Push Notifications capability is added in Xcode |
| APNs returns 403 | Verify JWT token and Team ID |
| BadDeviceToken error | Using sandbox token in production or vice versa |
| Notifications not showing | Check notification permissions in iOS Settings |

### Android Issues

| Problem | Solution |
|---------|----------|
| No token received | Verify `google-services.json` is correct |
| FCM returns 401 | Check server key is correct |
| NotRegistered error | Token is invalid, user uninstalled app |
| Notifications not showing | Check notification channel settings |

### General Issues

| Problem | Solution |
|---------|----------|
| Token not saving | Check RLS policies on native_push_tokens table |
| Edge function errors | Check all required secrets are set |
| Notification not received | Verify token is active in database |

---

## Implementation Checklist

### Phase 1: Setup (Do First)
- [ ] Create Apple Developer account
- [ ] Create Firebase project
- [ ] Generate APNs key (.p8 file)
- [ ] Download google-services.json
- [ ] Add secrets to backend

### Phase 2: Code Integration
- [ ] Install @capacitor/push-notifications
- [ ] Add google-services.json to android/app/
- [ ] Configure Android gradle files
- [ ] Add Push Notifications capability in Xcode
- [ ] Create useNativePushNotifications hook
- [ ] Create NativePushProvider component
- [ ] Run database migration

### Phase 3: Backend
- [ ] Create/update send-native-push edge function
- [ ] Test APNs integration
- [ ] Test FCM integration

### Phase 4: Testing
- [ ] Test on iOS physical device
- [ ] Test on Android device/emulator
- [ ] Test all notification scenarios
- [ ] Verify token cleanup for invalid tokens

### Phase 5: Production
- [ ] Switch APNs to production endpoint
- [ ] Submit app to App Store
- [ ] Submit app to Google Play Store

---

## Cost Summary

| Service | Cost |
|---------|------|
| Apple Developer Program | $99/year |
| Firebase (FCM) | Free |
| APNs | Free |
| Google Play Developer | $25 one-time |

---

## Next Steps

Once you have the Apple Developer account and Firebase project set up:

1. Tell me and I'll add the required secrets
2. I'll create the database migration
3. I'll implement the frontend hooks
4. I'll create/update the edge function

Would you like me to proceed with any of these steps?
