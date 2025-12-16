# 🛡️ VulnVault - Distributed Network Vulnerability Scanner

VulnVault is a production-grade, distributed security scanning platform. It allows users to scan targets for open ports and vulnerabilities using a microservices architecture orchestrated by Docker Swarm.

## 🚀 Key Features

* **Distributed Scanning:** Decouples the UI from the scanning engine using **Redis** queues and **Node.js Workers**.
* **Secure Access:** Automatic HTTPS termination using **Traefik Reverse Proxy** and **Let's Encrypt**.
* **ChatOps Integration:** Sends real-time scan reports to **Discord** via Webhooks.
* **CI/CD Pipeline:** Fully automated deployments to AWS EC2 using **GitHub Actions**.

## 🏗️ Architecture

The system runs on **Docker Swarm** with the following services:
* **Frontend:** React.js dashboard for managing scans.
* **Backend:** Express.js API to handle requests and manage the database.
* **Worker:** Node.js/Python worker that consumes jobs from Redis and runs Nmap.
* **Redis:** Message broker for the job queue.
* **MongoDB:** NoSQL database for storing scan history.
* **Traefik:** Reverse proxy for load balancing and SSL management.

## 🛠️ Tech Stack

* **Languages:** JavaScript (Node.js, React), Python (Scripting)
* **Databases:** MongoDB, Redis
* **Infrastructure:** Docker, Docker Swarm, AWS EC2
* **DevOps:** GitHub Actions, Traefik, Prometheus (Optional)

## 🔔 Discord Integration (New!)

VulnVault supports **ChatOps**. When a scan completes, the Worker node triggers a webhook to notify your security team instantly.

**Configuration:**
The worker service reads the `DISCORD_WEBHOOK` environment variable (injected securely via Docker Swarm) to send rich embed cards containing:
* Target IP/Domain
* Scan Type
* Number of Open Ports (Color-coded: Red for danger, Green for safe)

## 🔄 CI/CD & GitHub Webhooks

Deployments are handled automatically:
1.  **Push to Main:** A GitHub Action triggers on every commit.
2.  **Build & Push:** Docker images are built and pushed to Docker Hub.
3.  **Deploy:** The pipeline SSHs into the AWS Manager node and updates the Swarm stack.
4.  **Zero Downtime:** Docker Swarm performs rolling updates to ensure the service remains available during deployment.

## 📦 Setup & Installation

### Prerequisites
* Docker & Docker Swarm
* Node.js (for local dev)

### Running Locally
```bash
# 1. Clone the repo
git clone https://github.com/RDX463/vulnvault.git

# 2. Build the stack
docker compose up --build
