# 🛡️ VulnVault - Enterprise Vulnerability Dashboard

VulnVault is a self-hosted, modular vulnerability scanning platform designed for security teams. It bridges a secure **Node.js API Gateway** with a high-performance **Python Scanning Engine** (Nmap), managed via a modern **React Dashboard**.

![CI/CD Status](https://github.com/RDX463/vulnvault/actions/workflows/main.yml/badge.svg)

## 🚀 Key Features

* **Microservices Architecture:** Decoupled Frontend (React/Vite), Backend (Node.js), and Engine (Python).
* **Daemonless Infrastructure:** Built for **Podman** (Rootless) and Docker.
* **Security First:**
    * Strict Input Validation (`Joi`) & Rate Limiting.
    * Non-root container execution (UID 1000).
    * Automated Vulnerability Scanning (Trivy) in CI pipeline.
* **Automated CI/CD:** GitHub Actions pipeline for Linting, Security Gates, and Container Builds.

## 🏗️ Architecture

| Service | Tech Stack | Role |
| :--- | :--- | :--- |
| **Frontend** | React, Tailwind, Vite | Operations Dashboard & Visualization |
| **Backend** | Node.js, Express, Helmet | API Gateway, Auth, & Process Management |
| **Engine** | Python 3, Nmap, Subprocess | Isolated Security Scanner Worker |
| **Infra** | Docker/Podman, Nginx | Container Orchestration & Reverse Proxy |

## 🛠️ Installation (Local)

**Prerequisites:** Docker or Podman installed.

```bash
# 1. Clone the repository
git clone [https://github.com/](https://github.com/)RDX463/vulnvault.git
cd vulnvault

# 2. Start the suite (Production Mode)
docker-compose up --build
