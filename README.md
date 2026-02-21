<h1 align="center">🔐 TrevasQ — Phase 1</h1>

<p align="center">
  <b>Post-Quantum LWE Encryption Platform • Full-Stack Prototype</b><br>
  <i>Internship Technical Project — Lattice Cryptography</i>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Post--Quantum-LWE-blueviolet?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Security-Quantum--Resistant-success?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Frontend-React+Vite-61DAFB?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Status-Phase%201-orange?style=for-the-badge"/>
</p>

---

## 🧠 Overview

**TrevasQ — Phase 1** is a full-stack implementation of a post-quantum public-key encryption system based on the **Learning With Errors (LWE)** problem — a foundational primitive in lattice-based cryptography and modern PQC standards.

Developed for a TrevasQ technical assessment, the platform demonstrates end-to-end secure communication: key generation, encryption, decryption, and API-driven interaction through a modern web interface.

> LWE security relies on the hardness of solving noisy linear equations — a problem believed to be infeasible for both classical and quantum adversaries.

---

## ✨ Core Features

- 🔑 LWE Public/Private Key Generation  
- 🔒 Secure Message Encryption  
- 🔓 Correct Decryption with Secret Key  
- 🧠 Noise-Based Post-Quantum Security  
- 🌐 REST API Cryptographic Engine  
- 💻 Interactive Web Client  
- ⚡ End-to-End Full-Stack Workflow  

---

## 🏗️ Architecture

```
TrevasQ-phase1/
├── backend/      → FastAPI + LWE cryptography engine
│   └── app/
├── frontend/     → React + Vite client interface
└── README.md
```

---

## ▶️ Run Locally

### ⚡ Launch Backend & Frontend Simultaneously

Open the project in **VS Code** → Open Terminal → Press:

```
Ctrl + Shift + 5
```

This creates two terminals.

---

### 🖥️ Backend

```
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

➡️ API: **http://localhost:8000**

---

### 🌐 Frontend

```
cd frontend
npm install
npm run dev
```

➡️ App: **http://localhost:5173**

---

## ⚙️ Workflow

1. Generate LWE key pair  
2. Encrypt plaintext with public key  
3. Inject controlled noise for security  
4. Decrypt using private key  
5. Display results via frontend  

---

## 🛠️ Tech Stack

**Backend:** Python • FastAPI • NumPy • Lattice Cryptography  
**Frontend:** React • TypeScript • Vite  

---

## 🎯 Applications

Quantum-Resistant Communication • Secure Messaging • Cryptography Research • Privacy Systems • Future Internet Security

---

## 🧪 Status

🟢 Functional Prototype — Phase 1  
🟡 Optimization & Scaling — Planned  
🔵 Production-Ready PQC System — Future  

---

## ⚠️ Disclaimer

Educational and evaluation project. Not audited for production security.

---

## 👤 Author

**Aarush (Metamyte)**  
Engineering Physics — IIT Indore  
Quantum Computing • Cryptography • Systems Engineering  

<p align="center">
  ⭐ Star this repository if you find it interesting
</p>
