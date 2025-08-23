# 🧪 Testarea SMTP Resend pentru AlphaRise

## Probleme identificate în configurația SMTP

Din screenshot văd că configurația Resend este aproape completă, dar sunt câteva puncte de verificat:

### ❌ **Probleme potențiale:**

1. **Parola Resend pare incompletă** în screenshot - verifică că API key-ul este complet
2. **Port 465** - pentru Resend se recomandă **Port 587** (TLS) în loc de 465 (SSL)
3. **Domeniul** `alpharise.app` trebuie verificat în Resend Dashboard

## ✅ **Configurația corectă pentru Resend:**

```
Enable Custom SMTP: ✅ ON
Sender email: no-reply@alpharise.app
Sender name: AlphaRise

SMTP Provider Settings:
Host: smtp.resend.com
Port: 587 (schimbă de la 465)
Username: resend
Password: [API_KEY_RESEND_COMPLET] (începe cu 're_')
Minimum interval: 60 seconds
```

## 🔧 **Pași de rezolvare:**

### 1. Verifică API Key-ul Resend
- Mergi la [Resend Dashboard](https://resend.com/api-keys)
- Copiază API key-ul complet (re_xxxxxxxxx...)
- Lipește-l în câmpul Password din Supabase

### 2. Schimbă portul la 587
- În Supabase Auth Settings
- Schimbă Port number de la `465` la `587`

### 3. Verifică domeniul în Resend
- Mergi la [Resend Domains](https://resend.com/domains)
- Verifică că `alpharise.app` este verificat (verde)
- Dacă nu, adaugă DNS records pentru verificare

### 4. Test manual SMTP

**Opțiunea 1: Test prin signup normal**
1. Accesează http://localhost:3000 și urmează flow-ul complet
2. Ajuns la signup, completează cu un email real
3. Apasă "Create Account"
4. Verifică email-ul (și spam folder)

**Opțiunea 2: Test prin API (după ce pornești server)**
```bash
curl -X POST http://localhost:3000/api/test-smtp \
  -H "Content-Type: application/json" \
  -d '{"email":"jupi.mediavl@gmail.com","username":"test_jupi"}'
```

**Opțiunea 3: Test direct în Supabase**
1. Mergi la Authentication > Users în Supabase
2. Click "Invite User"
3. Introdu un email de test
4. Verifică dacă primești email-ul

## 🎯 **Template email funcțional**

Odată SMTP-ul configurat, template-ul tău custom va arăta așa:
- 🚀 Design frumos AlphaRise cu gradients
- 📧 Email: `jupi.mediavl@gmail.com`
- 🔑 Temporary password: `HjK8mN2pR9sT`
- 👨‍🏫 Coach: `Logan Martinez`
- 🎯 Challenge: `overthinking and analysis paralysis`
- 🔗 Link funcțional de confirmare

## 🚨 **Debugging SMTP**

Dacă email-urile încă nu sosesc:

1. **Verifică logs în Supabase:**
   - Authentication > Logs
   - Caută erori SMTP

2. **Verifică în Resend Dashboard:**
   - [Logs](https://resend.com/logs) - vezi toate email-urile trimise
   - Verifică status: delivered, bounced, etc.

3. **Testează cu email different:**
   - Încearcă cu Gmail, Outlook, etc.
   - Verifică spam folder

## 🏁 **Status după fix:**

- ✅ SMTP Resend configurat corect (port 587, API key complet)
- ✅ Domeniu alpharise.app verificat în Resend
- ✅ Template custom cu toate variabilele
- ✅ Metadata completă (username, coach_name, temporary_password, user_challenge)
- ✅ Test funcțional prin signup sau API

Odată acești pași completați, vei primi email-uri frumoase și funcționale la fiecare signup! 🎉