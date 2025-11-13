# Local Testing Guide for API Migration

This guide will help you test the new Translations API migration locally on your BigCommerce dev store.

---

## Prerequisites

1. **Node.js 20+** installed
2. **BigCommerce Developer Account** with a dev store
3. **ngrok** or similar tunneling tool (for local development)
4. **Database** (SQLite for local dev, or Postgres/MySQL)

---

## Step 1: Environment Setup

### 1.1 Install Dependencies

```bash
npm install
```

### 1.2 Set Up Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.sample .env.local  # If .env.sample exists
# Or create .env.local manually
```

### 1.3 Required Environment Variables

Add these to your `.env.local`:

```bash
# BigCommerce App Credentials (from Developer Portal)
CLIENT_ID=your_client_id_here
CLIENT_SECRET=your_client_secret_here

# App URL (use ngrok URL for local dev)
APP_ORIGIN=https://your-ngrok-url.ngrok.io

# JWT Key (generate a random 32+ character string)
JWT_KEY=your_random_32_character_string_here

# Database (SQLite for local dev)
DB_TYPE=sqlite
DATABASE_URL=sqlite:./local.db

# Optional: Vercel Blob Storage (if using file uploads)
BLOB_READ_WRITE_TOKEN=your_blob_token_here

# Optional: Cron Secret
CRON_SECRET=your_cron_secret_here
```

### 1.4 Get BigCommerce App Credentials

1. Go to [BigCommerce Developer Portal](https://developer.bigcommerce.com/)
2. Navigate to **Apps** → **My Apps**
3. Create a new **Draft App** or use existing one
4. Copy the **Client ID** and **Client Secret**
5. Set the **Auth Callback URL** to: `https://your-ngrok-url.ngrok.io/api/auth`
6. Set the **Load Callback URL** to: `https://your-ngrok-url.ngrok.io/api/load`

---

## Step 2: Set Up ngrok (for Local Development)

### 2.1 Install ngrok

```bash
# macOS
brew install ngrok

# Or download from https://ngrok.com/download
```

### 2.2 Start ngrok Tunnel

```bash
# Start ngrok on port 3000 (Next.js default)
ngrok http 3000
```

### 2.3 Copy ngrok URL

Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`) and:
1. Update `APP_ORIGIN` in `.env.local`
2. Update Auth Callback URL in BigCommerce Developer Portal
3. Update Load Callback URL in BigCommerce Developer Portal

**Note**: Free ngrok URLs change on restart. For stable testing, consider:
- Using ngrok authtoken for reserved domains
- Or manually updating URLs each time

---

## Step 3: Database Setup

### 3.1 Initialize Database (SQLite)

```bash
# Create database tables
npm run db:push
```

This will create a `local.db` file in your project root.

### 3.2 (Optional) Use Drizzle Studio

```bash
# Open database GUI
npm run db:studio
```

---

## Step 4: Build Client Libraries

The app uses local client libraries that need to be built:

```bash
# Build all client libraries
npm run build:auth-client
npm run build:graphql-client
npm run build:rest-client

# Or build all at once (before starting dev server)
npm run build
```

---

## Step 5: Start Development Server

```bash
# Start Next.js dev server
npm run dev
```

The app should now be running at `http://localhost:3000`

---

## Step 6: Install App in BigCommerce Store

### 6.1 Install Draft App

1. Go to your BigCommerce dev store admin panel
2. Navigate to **Apps** → **My Apps** → **Draft Apps**
3. Find your app and click **Install**
4. Authorize the app (you'll be redirected to your ngrok URL)
5. After authorization, you'll be redirected back to BigCommerce

### 6.2 Verify Installation

- Check that the app appears in your store's app list
- Verify you can access the app from the BigCommerce admin

---

## Step 7: Test the New API Integration

### 7.1 Test Product Translation Query (GET)

1. **Navigate to a product**:
   - Go to your BigCommerce store admin
   - Navigate to **Products** → Select a product
   - Click on the app extension or navigate to the translations app

2. **Verify translations load**:
   - Check browser DevTools → Network tab
   - Look for requests to `/api/product/[pid]`
   - Verify response includes translations from new API

3. **Test with different locales**:
   - Switch between locales in the UI
   - Verify translations are fetched correctly
   - Check that fallback to old API works if new API fails

### 7.2 Test Product Translation Update (PUT)

1. **Update a product field**:
   - Edit a product name, description, or other basic field
   - Save the changes
   - Check browser DevTools → Network tab
   - Verify PUT request to `/api/product/[pid]` succeeds

2. **Verify update worked**:
   - Refresh the page
   - Verify the updated translation appears
   - Check that data comes from new API

3. **Test field removal**:
   - Clear a field (set to empty string)
   - Save changes
   - Verify field is deleted using new API's `deleteTranslations`
   - Check browser console for any errors

### 7.3 Test Error Scenarios

1. **Simulate new API failure**:
   - Temporarily break the new API call (comment out or add invalid credentials)
   - Verify app falls back to old API gracefully
   - Check that product data still loads

2. **Test partial updates**:
   - Update basic fields (new API) and options (old API) simultaneously
   - Verify both succeed
   - Test what happens if one fails

### 7.4 Test Channel Locales Query

1. **Navigate to channels**:
   - Go to the translations app
   - Check channel/locale selector
   - Verify locales are loaded using new GraphQL API

2. **Verify locale data**:
   - Check browser DevTools → Network tab
   - Look for requests to `/api/channels`
   - Verify response includes locale data from GraphQL

---

## Step 8: Debugging Tips

### 8.1 Check Console Logs

```bash
# Watch server logs in terminal
# Look for:
# - API request logs
# - Error messages
# - Translation data
```

### 8.2 Browser DevTools

1. **Network Tab**:
   - Filter by `/api/product` or `/api/channels`
   - Check request/response payloads
   - Verify correct API endpoints are called

2. **Console Tab**:
   - Look for JavaScript errors
   - Check for API error messages
   - Verify data structure

### 8.3 Database Inspection

```bash
# Use Drizzle Studio
npm run db:studio

# Or use SQLite CLI
sqlite3 local.db
.tables
SELECT * FROM store_users;
```

### 8.4 Common Issues

**Issue**: "Authentication failed, please re-install"
- **Solution**: Reinstall the app in BigCommerce store
- Check that `CLIENT_ID` and `CLIENT_SECRET` are correct

**Issue**: "Channel ID missing"
- **Solution**: Ensure you're accessing the app from a product page with channel context

**Issue**: "Failed to fetch translations"
- **Solution**: 
  - Check that new API queries are correctly implemented
  - Verify GraphQL client is properly configured
  - Check browser console for detailed error messages

**Issue**: ngrok URL changed
- **Solution**: 
  - Update `APP_ORIGIN` in `.env.local`
  - Update callback URLs in BigCommerce Developer Portal
  - Restart dev server

---

## Step 9: Specific Tests for API Migration

### 9.1 Test Basic Field Updates

```bash
# Test updating these fields via new API:
- name
- description
- pageTitle (page_title)
- metaDescription (meta_description)
- preOrderMessage (pre_order_message)
- warranty (warranty_information)
- availabilityDescription (availability_text)
- searchKeywords (search_keywords)
```

**How to test**:
1. Edit a product in the translations app
2. Update one or more basic fields
3. Save
4. Verify in Network tab that `updateProductTranslations` is called
5. Refresh and verify data persists

### 9.2 Test Basic Field Deletions

```bash
# Test deleting translations by clearing fields:
- Clear name field → should call deleteTranslations with 'name'
- Clear description → should call deleteTranslations with 'description'
- Clear multiple fields → should call deleteTranslations with all field names
```

**How to test**:
1. Edit a product with existing translations
2. Clear one or more fields (set to empty)
3. Save
4. Verify in Network tab that `deleteProductTranslations` is called
5. Verify translations are removed

### 9.3 Test Options/Modifiers (Old API)

```bash
# Verify these still use old API:
- Product options updates
- Product modifiers updates
- Custom fields updates
```

**How to test**:
1. Edit a product with options/modifiers
2. Update option or modifier values
3. Save
4. Verify in Network tab that old API (`NOTADA_updateProductLocaleData`) is called
5. Verify data persists

### 9.4 Test Parallel API Calls

```bash
# Verify GET handler makes parallel calls:
- getProductTranslations (new API)
- getProductLocaleData (old API)
```

**How to test**:
1. Open browser DevTools → Network tab
2. Load a product page
3. Verify both API calls happen (check timing - should be parallel)
4. Verify data is merged correctly

### 9.5 Test Error Handling

```bash
# Test graceful fallback:
1. Temporarily break new API (add invalid query)
2. Load product page
3. Verify old API data is still returned
4. Check console for warning messages
```

---

## Step 10: Verify Implementation

### 10.1 Checklist

- [ ] App installs successfully in BigCommerce store
- [ ] Product translations load correctly
- [ ] Basic field updates work (new API)
- [ ] Basic field deletions work (new API)
- [ ] Options/modifiers still work (old API)
- [ ] Channel locales load correctly (new GraphQL API)
- [ ] Error handling works (graceful fallback)
- [ ] No console errors
- [ ] Data persists after updates

### 10.2 Compare with Expected Behavior

**Expected**:
- ✅ Basic fields use new API for updates and deletions
- ✅ Options/modifiers use old API
- ✅ Parallel API calls in GET handler
- ✅ Graceful fallback if new API fails
- ✅ Complete data returned in responses

**Not Expected**:
- ❌ Errors when new API is unavailable (should fallback)
- ❌ Missing data in responses
- ❌ Options/modifiers broken
- ❌ Performance degradation

---

## Step 11: Performance Testing

### 11.1 Measure Response Times

```bash
# Use browser DevTools → Network tab
# Compare:
- Time to load product with translations
- Time for parallel vs sequential API calls
- Overall page load time
```

### 11.2 Test with Multiple Products

1. Test with products that have:
   - Many options
   - Many modifiers
   - Many custom fields
   - Existing translations
   - No translations

2. Verify performance is acceptable in all cases

---

## Step 12: Clean Up

### 12.1 Stop Services

```bash
# Stop dev server: Ctrl+C
# Stop ngrok: Ctrl+C (or close terminal)
```

### 12.2 Reset Database (if needed)

```bash
# Delete SQLite database
rm local.db

# Recreate
npm run db:push
```

---

## Additional Resources

- [BigCommerce Developer Portal](https://developer.bigcommerce.com/)
- [BigCommerce GraphQL API Docs](https://developer.bigcommerce.com/api-docs/storefront/graphql/graphql-storefront-api-overview)
- [Next.js Documentation](https://nextjs.org/docs)
- [ngrok Documentation](https://ngrok.com/docs)

---

## Troubleshooting

### App Won't Install

- Check ngrok URL is accessible
- Verify callback URLs in Developer Portal
- Check `CLIENT_ID` and `CLIENT_SECRET` are correct
- Check server logs for errors

### Translations Don't Load

- Check browser console for errors
- Verify GraphQL queries are correct
- Check that product exists in store
- Verify channel/locale are valid

### Updates Don't Persist

- Check database connection
- Verify API responses are successful
- Check server logs for errors
- Verify BigCommerce API credentials

---

## Next Steps

After successful local testing:

1. ✅ Review code changes
2. ✅ Create PR
3. ✅ Deploy to staging environment
4. ✅ Test in staging
5. ✅ Deploy to production

---

**Happy Testing! 🚀**

