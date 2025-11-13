# Quick Start: Testing Locally

## 🚀 Quick Setup (5 minutes)

### 1. Install & Configure

```bash
# Install dependencies
npm install

# Create .env.local file
cat > .env.local << EOF
CLIENT_ID=your_client_id
CLIENT_SECRET=your_client_secret
APP_ORIGIN=https://your-ngrok-url.ngrok.io
JWT_KEY=$(openssl rand -hex 32)
DB_TYPE=sqlite
DATABASE_URL=sqlite:./local.db
EOF

# Initialize database
npm run db:push

# Build client libraries
npm run build:auth-client && npm run build:graphql-client && npm run build:rest-client
```

### 2. Start ngrok

```bash
# In a separate terminal
ngrok http 3000
```

Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`) and:
- Update `APP_ORIGIN` in `.env.local`
- Update callback URLs in BigCommerce Developer Portal

### 3. Start Dev Server

```bash
npm run dev
```

### 4. Install App in BigCommerce

1. Go to BigCommerce Developer Portal → Apps → Draft Apps
2. Set Auth Callback: `https://your-ngrok-url.ngrok.io/api/auth`
3. Set Load Callback: `https://your-ngrok-url.ngrok.io/api/load`
4. Install app in your dev store

---

## ✅ Testing Checklist

### Basic Functionality
- [ ] App installs successfully
- [ ] Can navigate to product translations
- [ ] Translations load for existing products
- [ ] Can switch between locales

### New API - Basic Fields (Updates)
- [ ] Update product name → saves via new API
- [ ] Update description → saves via new API
- [ ] Update page title → saves via new API
- [ ] Update meta description → saves via new API
- [ ] Update warranty → saves via new API
- [ ] Update availability description → saves via new API
- [ ] Update search keywords → saves via new API
- [ ] Update pre-order message → saves via new API

### New API - Basic Fields (Deletions)
- [ ] Clear name field → deletes via new API
- [ ] Clear description → deletes via new API
- [ ] Clear multiple fields → deletes all via new API

### Old API - Options/Modifiers
- [ ] Update product options → saves via old API
- [ ] Update product modifiers → saves via old API
- [ ] Update custom fields → saves via old API

### Error Handling
- [ ] New API fails → falls back to old API gracefully
- [ ] Old API fails → basic fields still work
- [ ] Both APIs fail → shows appropriate error

### Performance
- [ ] Parallel API calls work (check Network tab)
- [ ] Page loads quickly
- [ ] No performance regression

---

## 🔍 Quick Debug Commands

```bash
# Enable debug logging
DEBUG=bigcommerce:* npm run dev

# Check database
npm run db:studio

# View server logs
# (check terminal where npm run dev is running)
```

---

## 📝 What to Look For

### In Browser DevTools → Network Tab

**GET Request** (`/api/product/[pid]`):
- Should see 2 parallel requests:
  - `getProductTranslations` (new API)
  - `getProductLocaleData` (old API)

**PUT Request** (`/api/product/[pid]`):
- Should see:
  - `updateProductTranslations` (new API) for basic fields
  - `deleteProductTranslations` (new API) for field removals
  - `NOTADA_updateProductLocaleData` (old API) for options/modifiers

**Channels Request** (`/api/channels`):
- Should see:
  - `getChannelLocales` (new GraphQL API)

### In Console

- ✅ No errors
- ✅ Warnings only for expected fallbacks
- ✅ Data loads correctly

---

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| "Authentication failed" | Reinstall app in BigCommerce |
| "Channel ID missing" | Access from product page with channel context |
| ngrok URL changed | Update `.env.local` and Developer Portal |
| Translations don't load | Check GraphQL queries, verify product exists |
| Updates don't save | Check database, verify API responses |

---

## 📚 Full Guide

See `LOCAL_TESTING_GUIDE.md` for detailed instructions.

---

**Ready to test! 🎉**

