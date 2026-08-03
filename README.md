# 🔐 Request-System-DevSecOps

<div align="center">

![DevSecOps](https://img.shields.io/badge/DevSecOps-Security-red?style=for-the-badge)
![Jenkins](https://img.shields.io/badge/Jenkins-CI%2FCD-D24939?style=for-the-badge&logo=jenkins&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Containers-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Kubernetes](https://img.shields.io/badge/Kubernetes-Orchestration-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white)
![SonarQube](https://img.shields.io/badge/SonarQube-Code%20Quality-4E9BCD?style=for-the-badge&logo=sonarqube&logoColor=white)
![Trivy](https://img.shields.io/badge/Trivy-Vulnerability%20Scanner-1904DA?style=for-the-badge)
![Prometheus](https://img.shields.io/badge/Prometheus-Monitoring-E6522C?style=for-the-badge&logo=prometheus&logoColor=white)
![Grafana](https://img.shields.io/badge/Grafana-Dashboards-F46800?style=for-the-badge&logo=grafana&logoColor=white)

</div>

---

# 📌 Overview

**Request-System-DevSecOps** demonstrates the implementation of a complete **DevSecOps CI/CD pipeline** for a Request Management System.

The project integrates **code quality analysis, security scanning, containerization, automated deployment, monitoring, and observability** using industry-standard DevSecOps tools.

---

# 🏗 Architecture

```
Developer
      │
      ▼
GitHub Repository
      │
      ▼
GitHub Webhook
      │
      ▼
Jenkins Pipeline
      │
      ├──────────────┐
      ▼              ▼
 SonarQube      Trivy Secret Scan
      │              │
      └──────┬───────┘
             ▼
      Docker Build
             │
             ▼
      Trivy Image Scan
             │
             ▼
      Docker Hub
             │
             ▼
 Kubernetes Deployment
             │
             ▼
     NGINX Ingress
             │
             ▼
 Application
             │
             ▼
 Prometheus Metrics
             │
             ▼
 Grafana Dashboard
```

---

# 🚀 Features

- Jenkins Declarative Pipeline
- GitHub Webhook Integration
- Shared Jenkins Library
- SonarQube Static Code Analysis
- Quality Gate Validation
- Trivy Secret Scanning
- Trivy Container Image Scanning
- Docker Multi-stage Builds
- Docker Hub Integration
- Kubernetes Deployment
- Rolling Update Strategy
- NGINX Ingress
- Prometheus Metrics
- Grafana Dashboards
- Health Probes
- ConfigMaps & Secrets
- High Availability (2 Replicas)

---

# 🛠 Tech Stack

| Category | Technologies |
|----------|--------------|
| Source Control | Git, GitHub |
| CI/CD | Jenkins |
| Code Quality | SonarQube |
| Security | Trivy |
| Containerization | Docker |
| Registry | Docker Hub |
| Orchestration | Kubernetes |
| Ingress | NGINX Ingress Controller |
| Monitoring | Prometheus |
| Visualization | Grafana |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |

---

# 📂 Repository Structure

```
Request-System-DevSecOps
│
├── client/
├── server/
│
├── docker/
│   ├── backend/
│   └── frontend/
│
├── k8s/
│   ├── backend/
│   ├── frontend/
│   ├── ingress/
│   ├── monitoring/
│   ├── config/
│   └── secrets/
│
├── vars/
├── src/
├── tools/
├── reports/
│
├── Jenkinsfile
├── README.md
└── .dockerignore
```

---

# ⚙ CI/CD Pipeline

```
Git Push
    │
    ▼
GitHub Webhook
    │
    ▼
Checkout Source
    │
    ▼
Install Dependencies
    │
    ▼
SonarQube Analysis
    │
    ▼
Quality Gate
    │
    ▼
Build Docker Images
    │
    ▼
Trivy Image Scan
    │
    ▼
Trivy Secret Scan
    │
    ▼
Push Images to Docker Hub
    │
    ▼
Deploy to Kubernetes
```

---

# 🔒 Security

- SonarQube Static Code Analysis
- Trivy Secret Scanning
- Trivy Image Vulnerability Scanning
- Kubernetes Secrets
- Non-root Containers
- Readiness Probe
- Startup Probe
- Liveness Probe

---

# 📊 Monitoring

The application exposes Prometheus metrics and visualizes them using Grafana.

### Metrics

- HTTP Requests
- Response Time
- Active Requests
- User Login Count
- User Registration Count
- Database Queries
- Server Errors
- Request Creation Metrics

---

# 🚀 Deployment Strategy

The project uses **Rolling Update** deployment.

```yaml
strategy:
  type: RollingUpdate

  rollingUpdate:
    maxUnavailable: 0
    maxSurge: 1
```

### Benefits

- Zero Downtime
- High Availability
- Automatic Health Checks
- Smooth Updates
- Production Ready

---

# 📈 Monitoring Stack

```
Backend
    │
    ▼
Prometheus
    │
    ▼
Grafana
```

---

# 📌 Future Enhancements


- SSL/TLS using NGINX
- Email Notifications
- Slack Notifications
- Automated Rollback
- Terraform Infrastructure Provisioning

---

# 👨‍💻 Author

**Shakthivel K**

Computer Science & Engineering

DevOps | DevSecOps | Cloud | Full Stack Development

---

# ⭐ Support

If you found this project helpful, consider giving it a ⭐ on GitHub.