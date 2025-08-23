# 🔧 SMTP Configuration Debug Guide pentru AlphaRise

## Verificări necesare în Supabase Dashboard

### 1. Auth Settings - SMTP Configuration
Mergi la **Settings > Auth** și verifică:

```
📧 SMTP Host: (ex: smtp.gmail.com, smtp-mail.outlook.com)
🔌 SMTP Port: 587 (pentru TLS) sau 465 (pentru SSL)
👤 SMTP Username: adresa ta de email completă
🔑 SMTP Password: app password (NU parola obișnuită!)
🔒 SMTP Secure: true (pentru TLS/SSL)
📤 From Email: adresa de email de trimis (trebuie să match cu username)
📝 From Name: "AlphaRise Team"
```

### 2. Template Configuration
Verifică că template-ul custom este configurat:

**Authentication > Email Templates > Confirm signup**
- Template-ul tău custom trebuie să fie salvat aici
- Verifică că variabilele Supabase sunt folosite corect:
  - `{{ .Email }}` - email-ul userului
  - `{{ .ConfirmationURL }}` - link-ul de confirmare
  - `{{ .Data.username }}` - username-ul din metadata
  - `{{ .Data.temporary_password }}` - parola temporară

### 3. Probleme comune și soluții

#### A. App Passwords pentru Gmail/Outlook
Pentru Gmail:
1. Activează 2FA pe contul Google
2. Mergi la Security > App Passwords
3. Generează o app password pentru "Mail"
4. Folosește această parolă în SMTP config, NU parola Google

Pentru Outlook/Hotmail:
1. Activează 2FA pe contul Microsoft
2. Mergi la Security > App Passwords
3. Generează o app password
4. Folosește această parolă

#### B. SMTP Settings Examples

**Gmail:**
```
Host: smtp.gmail.com
Port: 587
Username: yourname@gmail.com
Password: your-16-char-app-password
From Email: yourname@gmail.com
From Name: AlphaRise Team
```

**Outlook:**
```
Host: smtp-mail.outlook.com
Port: 587
Username: yourname@outlook.com
Password: your-app-password
From Email: yourname@outlook.com
From Name: AlphaRise Team
```

**Custom Domain (ex: Hostinger, cPanel):**
```
Host: mail.yourdomain.com
Port: 587
Username: noreply@yourdomain.com
Password: email-account-password
From Email: noreply@yourdomain.com
From Name: AlphaRise Team
```

### 4. Test SMTP Configuration

În Supabase Dashboard, după configurarea SMTP:
1. Mergi la Authentication > Users
2. Creează manual un test user
3. Trimite email de confirmare
4. Verifică logs în Authentication > Logs

### 5. Verificare Template Variables

Template-ul tău folosește aceste variabile:
```html
{{ .Data.username }} - numele userului
{{ .Email }} - email-ul userului  
{{ .Data.temporary_password }} - parola temporară
{{ .Data.coach_name }} - numele coach-ului
{{ .Data.user_challenge }} - challenge-ul userului
{{ .ConfirmationURL }} - link-ul de confirmare
{{ .SiteURL }} - URL-ul site-ului
```

Asigură-te că aceste date sunt trimise în metadata când creezi userul.

### 6. Debug Steps

1. **Verifică Supabase Logs:**
   - Authentication > Logs
   - Caută erori de SMTP

2. **Test cu email simplu:**
   Înlocuiește temporar template-ul cu unul simplu pentru a testa SMTP:
   ```html
   <h1>Test Email</h1>
   <p>Hello {{ .Email }}</p>
   <a href="{{ .ConfirmationURL }}">Confirm</a>
   ```

3. **Verifică spam folder:**
   - Gmail poate pune email-urile în spam
   - Verifică și promotions tab

### 7. Alternative SMTP Providers

Dacă Gmail/Outlook nu funcționează, încearcă:

**SendGrid (recomandat):**
- Free tier: 100 emails/day
- Host: smtp.sendgrid.net
- Port: 587
- Username: "apikey"
- Password: your-sendgrid-api-key

**Mailgun:**
- Host: smtp.mailgun.org
- Port: 587
- Username: your-mailgun-username
- Password: your-mailgun-password

### 8. Verificare finală

După configurare, testează:
1. Signup cu un email nou
2. Verifică că email-ul sosește
3. Click pe confirmation link
4. Verifică că redirect-ul funcționează

## 🚨 Red Flags

**SMTP nu funcționează dacă:**
- ❌ Folosești parola obișnuită în loc de app password
- ❌ 2FA nu este activat pentru app passwords
- ❌ Port-ul este greșit (folosește 587 pentru TLS)
- ❌ From Email nu match cu Username
- ❌ Template-ul are erori de sintaxă
- ❌ Metadata nu este trimisă corect din cod

## 📧 Test Final

Odată configurat, ar trebui să primești un email frumos cu:
- ✅ Design custom AlphaRise
- ✅ Username-ul userului
- ✅ Parola temporară
- ✅ Link de confirmare functional
- ✅ Instrucțiuni clare next steps