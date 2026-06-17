# 🦅 News Hunter

News Hunter, dünya gündemini takip eden ve haberleri iş fırsatlarına dönüştürebilecek içgörüler sunan modern bir haber avcısı uygulamasıdır.

## 🚀 Hızlı Başlangıç

Projeyi tek bir komutla hem Backend hem de Frontend olarak çalıştırmak için:

```powershell
npm run dev:all
```

Bu komut sonrası:
- **Frontend (Arayüz):** [http://localhost:3002](http://localhost:3002) adresinde açılır.
- **Backend (API):** [http://localhost:3001](http://localhost:3001) adresinde çalışır.

## 🛠️ Kurulum

Eğer projeyi ilk kez kuruyorsanız:

1. Bağımlılıkları yükleyin:
   ```powershell
   npm run install:all
   ```
2. `.env` dosyasındaki `APIFY_API_KEY` alanına kendi anahtarınızı ekleyin.

## 📁 Proje Yapısı

- `src/`: Backend (Node.js & TypeScript) kodları.
- `client/`: Frontend (React & Vite) kodları.
- `.env`: Merkezi yapılandırma dosyası.

## ⚙️ Diğer Komutlar

- `npm run dev`: Sadece Backend'i başlatır.
- `npm run client:dev`: Sadece Frontend'i başlatır.
- `npm run build`: Backend'i derler.

---
*Developed with ❤️ by Antigravity*
