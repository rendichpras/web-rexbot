# Dokumentasi Integrasi API OTP RexBot

## Daftar Isi
- [Pendahuluan](#pendahuluan)
- [Autentikasi](#autentikasi)
- [Endpoint API](#endpoint-api)
- [Contoh Implementasi](#contoh-implementasi)
- [Error Handling](#error-handling)
- [Best Practices](#best-practices)

## Pendahuluan

API OTP RexBot menyediakan layanan One-Time Password (OTP) yang dapat diintegrasikan ke dalam website Anda. API ini mendukung berbagai kasus penggunaan seperti verifikasi registrasi, reset password, dan verifikasi transaksi.

### Fitur Utama
- Generate OTP 6 digit
- Masa berlaku OTP 3 menit
- Pencegahan spam request OTP
- Verifikasi status dan validitas OTP
- Integrasi dengan WhatsApp (opsional)

## Autentikasi

Semua request API memerlukan API key yang valid. API key harus disertakan dalam header `x-api-key`.

```javascript
const headers = {
  'x-api-key': 'YOUR_API_KEY',
  'Content-Type': 'application/json'
};
```

## Endpoint API

### 1. Request OTP

**Endpoint:** `POST /api/otp/request`

**Request Body:**
```json
{
  "phoneNumber": "6281234567890",
  "type": "registration" // atau "reset_password", "verification"
}
```

**Response Success:**
```json
{
  "status": "success",
  "message": "OTP berhasil dikirim",
  "data": {
    "phoneNumber": "6281234567890",
    "expiredAt": "2024-03-21T12:34:56.789Z"
  }
}
```

### 2. Verifikasi OTP

**Endpoint:** `POST /api/otp/verify`

**Request Body:**
```json
{
  "phoneNumber": "6281234567890",
  "code": "123456",
  "type": "registration"
}
```

**Response Success:**
```json
{
  "status": "success",
  "message": "Verifikasi OTP berhasil"
}
```

## Contoh Implementasi

### Vanilla JavaScript

```javascript
// Fungsi untuk request OTP
async function requestOTP(phoneNumber, type) {
  try {
    const response = await fetch('http://your-api-domain/api/otp/request', {
      method: 'POST',
      headers: {
        'x-api-key': 'YOUR_API_KEY',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ phoneNumber, type })
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    
    return data;
  } catch (error) {
    console.error('Error requesting OTP:', error);
    throw error;
  }
}

// Fungsi untuk verifikasi OTP
async function verifyOTP(phoneNumber, code, type) {
  try {
    const response = await fetch('http://your-api-domain/api/otp/verify', {
      method: 'POST',
      headers: {
        'x-api-key': 'YOUR_API_KEY',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ phoneNumber, code, type })
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    
    return data;
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw error;
  }
}

// Contoh penggunaan
document.getElementById('requestOtpForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const phoneNumber = document.getElementById('phoneNumber').value;
  
  try {
    const result = await requestOTP(phoneNumber, 'registration');
    alert('OTP telah dikirim!');
    // Tampilkan form verifikasi
    showVerificationForm();
  } catch (error) {
    alert('Gagal mengirim OTP: ' + error.message);
  }
});

document.getElementById('verifyOtpForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const phoneNumber = document.getElementById('phoneNumber').value;
  const otpCode = document.getElementById('otpCode').value;
  
  try {
    const result = await verifyOTP(phoneNumber, otpCode, 'registration');
    alert('Verifikasi berhasil!');
    // Lanjutkan ke proses berikutnya
    proceedToNextStep();
  } catch (error) {
    alert('Verifikasi gagal: ' + error.message);
  }
});
```

### React.js

```jsx
import { useState } from 'react';

const OTPVerification = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);

  const API_KEY = 'YOUR_API_KEY';
  const API_URL = 'http://your-api-domain';

  const requestOTP = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/otp/request`, {
        method: 'POST',
        headers: {
          'x-api-key': API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phoneNumber,
          type: 'registration'
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setShowVerification(true);
      alert('OTP telah dikirim!');
    } catch (error) {
      alert('Gagal mengirim OTP: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/otp/verify`, {
        method: 'POST',
        headers: {
          'x-api-key': API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phoneNumber,
          code: otpCode,
          type: 'registration'
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      alert('Verifikasi berhasil!');
      // Lanjutkan ke proses berikutnya
    } catch (error) {
      alert('Verifikasi gagal: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div>
        <input
          type="text"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="Nomor Telepon"
        />
        <button onClick={requestOTP} disabled={loading}>
          {loading ? 'Loading...' : 'Kirim OTP'}
        </button>
      </div>

      {showVerification && (
        <div>
          <input
            type="text"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value)}
            placeholder="Kode OTP"
          />
          <button onClick={verifyOTP} disabled={loading}>
            {loading ? 'Loading...' : 'Verifikasi OTP'}
          </button>
        </div>
      )}
    </div>
  );
};

export default OTPVerification;
```

## Error Handling

API akan mengembalikan response error dengan format berikut:

```json
{
  "status": "error",
  "message": "Pesan error yang spesifik"
}
```

Kode Status HTTP:
- 400: Bad Request (input tidak valid)
- 401: Unauthorized (API key tidak ada)
- 403: Forbidden (API key tidak valid)
- 500: Internal Server Error

## Best Practices

1. **Keamanan**
   - Simpan API key dengan aman
   - Gunakan HTTPS untuk semua request
   - Validasi input sebelum mengirim ke API

2. **User Experience**
   - Tampilkan countdown timer selama OTP aktif
   - Berikan opsi untuk request ulang OTP
   - Tampilkan pesan error yang informatif

3. **Error Handling**
   - Selalu implementasikan try-catch
   - Berikan feedback yang jelas ke pengguna
   - Log error untuk debugging

4. **Rate Limiting**
   - Batasi frekuensi request OTP
   - Implementasikan cooldown period
   - Tampilkan sisa waktu tunggu

## Contoh HTML Form

```html
<!DOCTYPE html>
<html>
<head>
    <title>Verifikasi OTP</title>
    <style>
        .container {
            max-width: 400px;
            margin: 0 auto;
            padding: 20px;
        }
        .form-group {
            margin-bottom: 15px;
        }
        input {
            width: 100%;
            padding: 8px;
            margin-top: 5px;
        }
        button {
            padding: 10px 20px;
            background-color: #007bff;
            color: white;
            border: none;
            cursor: pointer;
        }
        button:disabled {
            background-color: #ccc;
        }
        .error {
            color: red;
            margin-top: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>Verifikasi OTP</h2>
        
        <!-- Form Request OTP -->
        <div class="form-group">
            <label for="phoneNumber">Nomor Telepon:</label>
            <input type="text" id="phoneNumber" placeholder="Contoh: 6281234567890">
            <button id="requestOtpBtn">Kirim OTP</button>
            <div id="requestError" class="error"></div>
        </div>

        <!-- Form Verifikasi OTP -->
        <div id="verificationForm" style="display: none;">
            <div class="form-group">
                <label for="otpCode">Kode OTP:</label>
                <input type="text" id="otpCode" maxlength="6" placeholder="Masukkan 6 digit kode">
                <div id="timer">Waktu tersisa: <span id="countdown">03:00</span></div>
                <button id="verifyOtpBtn">Verifikasi</button>
                <div id="verifyError" class="error"></div>
            </div>
        </div>
    </div>

    <script src="otp.js"></script>
</body>
</html>
``` 