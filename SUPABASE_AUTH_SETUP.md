# Supabase Auth Configuration Guide for AlphaRise

## Overview
Această documentație detaliază pașii pentru configurarea completă a sistemului de autentificare Supabase pentru AlphaRise.

## 🔧 Configurări în Supabase Dashboard

### 1. Authentication Settings

#### Accesează Authentication > Settings în Supabase Dashboard:

**Site URL:**
```
http://localhost:3000  (development)
https://your-domain.com  (production)
```

**Redirect URLs:**
```
http://localhost:3000/auth/callback  (development)
https://your-domain.com/auth/callback  (production)
```

### 2. Email Authentication

#### Activează Email Auth:
- Mergi la `Authentication > Providers`
- Activează `Email` provider
- Configurează setările:
  - ✅ Enable email confirmations
  - ✅ Enable email change confirmations
  - ⏱️ Email confirmation timeout: 24 hours

### 3. Google OAuth Setup

#### Configurare Google OAuth:
1. Mergi la `Authentication > Providers`
2. Click pe `Google`
3. Activează Google provider
4. Adaugă credențialele Google OAuth:

**Obține credențialele de la Google Console:**
1. Accesează [Google Cloud Console](https://console.cloud.google.com/)
2. Creează un proiect nou sau selectează unul existent
3. Activează `Google+ API`
4. Creează OAuth 2.0 credentials
5. Adaugă Authorized redirect URIs:
   ```
   https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
   ```

**Configurează în Supabase:**
- Client ID: `YOUR_GOOGLE_CLIENT_ID`
- Client Secret: `YOUR_GOOGLE_CLIENT_SECRET`

### 4. Custom Email Templates

#### Înlocuiește templateurile default cu cele personalizate:

**Confirmarea contului (Signup):**
1. Mergi la `Authentication > Templates`
2. Selectează `Confirm signup`
3. Înlocuiește conținutul cu `email-templates/signup-confirmation.html`

**Reset parolă:**
1. Selectează `Reset password`
2. Înlocuiește conținutul cu `email-templates/password-reset.html`

### 5. Database Policies (Row Level Security)

#### Configurează RLS pentru tabela users:

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own data
CREATE POLICY "Users can read own data" ON users
FOR SELECT USING (auth.uid()::text = id);

-- Policy: Users can update their own data
CREATE POLICY "Users can update own data" ON users
FOR UPDATE USING (auth.uid()::text = id);

-- Policy: Service role can insert users (for signup)
CREATE POLICY "Service role can insert users" ON users
FOR INSERT WITH CHECK (true);
```

## 🎯 Testarea Sistemului

### Test Flow Complet:

#### 1. **Test Signup:**
```
1. Accesează `/assessment` 
2. Completează testul de confidence
3. Introdu email + nume în signup
4. Verifică că primești emailul de confirmare
5. Click pe link pentru confirmare
6. Setează o parolă nouă
7. Verifică redirectul către dashboard
```

#### 2. **Test Login:**
```
1. Accesează `/login`
2. Introdu email/username + parolă
3. Verifică autentificarea
4. Test "Forgot Password"
5. Verifică emailul de reset
6. Resetează parola
```

#### 3. **Test Google OAuth:**
```
1. Click pe "Continue with Google"
2. Autentifică cu Google
3. Verifică crearea profilului automat
4. Verifică redirectul către dashboard
```

## 📧 Configurarea SMTP (Optional)

Pentru emailuri custom, configurează SMTP în Supabase:

1. Mergi la `Settings > Auth`
2. Scroll la `SMTP Settings`
3. Configurează:
   ```
   Host: your-smtp-host.com
   Port: 587
   Username: your-email@domain.com
   Password: your-app-password
   ```

## 🚀 Environment Variables

Asigură-te că ai următoarele variabile în `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
```

## 🔒 Security Checklist

- ✅ RLS activat pe tabela users
- ✅ Email confirmation activată
- ✅ Redirect URLs configurate corect
- ✅ Google OAuth credentials configurate
- ✅ Custom email templates instalate
- ✅ Environment variables configurate
- ✅ SMTP configurat (dacă e necesar)

## 🎨 Personalizări Adiționale

### Logo în emailuri:
- Uploadează logo-ul AlphaRise într-un storage bucket
- Actualizează templateurile să folosească URL-ul public

### Domeniu custom:
- Configurează un domeniu custom pentru emailuri
- Actualizează setările SMTP

## 🐛 Troubleshooting

### Probleme comune:

**1. Emailurile nu sosesc:**
- Verifică SMTP settings
- Verifică spam folder
- Testează cu Mailtrap în development

**2. Google OAuth nu funcționează:**
- Verifică redirect URLs în Google Console
- Verifică că Google+ API este activat
- Verifică credențialele în Supabase

**3. Redirecturi greșite:**
- Verifică Site URL în auth settings
- Verifică redirect URLs
- Verifică environment variables

## 📝 Status Implementation

✅ **Complet implementat în cod:**
- Signup cu email + temporay password
- Login cu email/username + parolă  
- Google OAuth integration
- Password reset flow
- Email confirmation flow
- Auth callback handling
- Custom email templates
- Database user creation

🔄 **Necesită configurare în Supabase Dashboard:**
- Activare email auth
- Configurare Google OAuth credentials
- Upload custom email templates
- Configurare RLS policies
- SMTP setup (optional)

## 🎯 Ready for Testing!

Odată ce configurările sunt făcute în Supabase Dashboard, sistemul este gata pentru testare completă. Toate funcționalitățile au fost implementate în cod și așteaptă doar configurarea serverului.