# DevOps Todo App

A full-stack todo application (Next.js + Express + MongoDB) with a complete local DevOps pipeline demonstrating CI/CD, containerization, Kubernetes orchestration, and observability on a single machine.

## Tech Stack

| Layer           | Tools                                                    |
| --------------- | -------------------------------------------------------- |
| Application     | Next.js 16, React 19, TypeScript 5, Tailwind CSS v4     |
| Backend         | Express 5, Mongoose 9, TypeScript 6                      |
| Database        | MongoDB Atlas (or local MongoDB)                         |
| Container       | Docker (multi-stage build, Ubuntu 24.04 / Node.js 22)   |
| CI              | Jenkins (Docker container) + ngrok                       |
| CD              | ArgoCD (in Minikube)                                     |
| Orchestration   | Minikube + Kubernetes (Deployment + NodePort Service)    |
| IaC             | Terraform (Docker provider)                              |
| Code Quality    | Jenkins + SonarQube (Docker container)                   |
| Observability   | Prometheus + Grafana (Docker containers / in Minikube)   |
| Process Mgr     | PM2 (on Jenkins host)                                    |

## Local Environment

All tools run on a single local machine:

| Tool        | Runs in                | Access                                   |
| ----------- | ---------------------- | ---------------------------------------- |
| Minikube    | Local VM               | `minikube dashboard`                     |
| Jenkins     | Docker container       | `http://localhost:8080`                  |
| SonarQube   | Docker container       | `http://localhost:9000`                  |
| ArgoCD      | Minikube cluster       | `http://localhost:<nodePort>`            |
| Prometheus  | Docker / Minikube      | `http://localhost:9090`                  |
| Grafana     | Docker / Minikube      | `http://localhost:3001`                  |
| ngrok       | Local binary           | Forwards GitHub webhooks to localhost    |
| Frontend    | Docker / K8s / direct  | `http://localhost:3000`                  |
| Backend     | Docker / K8s / direct  | `http://localhost:5000`                  |

---

## Project Architecture: End-to-End Pipeline

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    PHASE 1: CI (Continuous Integration)                  │
│                                                                          │
│  Developer Push ──> GitHub ───ngrok──> Jenkins (Docker) ──> Docker Hub  │
│       │                        (webhook)         │                      │
│       │                                         ├─ SonarQube Analysis   │
│       │                                         ├─ Build (npm + docker) │
│       │                                         ├─ Push (registry)      │
│       │                                         └─ Deploy via PM2       │
│       │                                                               │
│       └────────────────── Update k8s manifests ─────────────────────────┘
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    PHASE 2: CD (ArgoCD in Minikube)                      │
│                                                                          │
│  ArgoCD polls Git ──> Detects drift ──> Auto-sync ──> kubectl apply     │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    PHASE 3: Kubernetes (Minikube)                        │
│                                                                          │
│  Deployment: todo-server + todo-client ──> Service (NodePort 32000)     │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    PHASE 4: Observability                                │
│                                                                          │
│  Prometheus (scrape /metrics) ──> Grafana (real-time dashboards)         │
│  Faro RUM (frontend Web Vitals) ──> Grafana Cloud                        │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Continuous Integration (CI)

**Goal:** Automatically analyze, build, and deploy the application.

```
Developer pushes Source_Code to main branch
         │
         ▼
GitHub webhook (via ngrok) triggers Jenkins
         │
         ├── Stage 1: Install Dependencies
         │       ├── client: npm install
         │       └── server: npm install
         │
         ├── Stage 2: Build
         │       ├── client: npm run build (Next.js)
         │       └── server: npm run build (TypeScript → tsc)
         │
         ├── Stage 3: Code Analysis
         │       ├── SonarQube static analysis (both projects)
         │       └── Quality Gate enforced (abort on failure)
         │
         └── Stage 4: Deploy
                 ├── Frontend: pm2 serve ./out on port 3000
                 └── Backend:  pm2 start dist/index.js on port 5000
```

### CI Steps

| Step              | Action                                                                 |
| ----------------- | ---------------------------------------------------------------------- |
| Checkout          | `checkout scm` — pull latest source                                   |
| Install Deps      | `npm install` in client/ and server/                                  |
| Build             | `next build` (client) + `tsc` (server)                                |
| Code Analysis     | SonarQube `sonar-scanner` — quality gate enforced (10 min timeout)    |
| Deploy            | PM2 manages both processes (`todo-frontend` + `todo-backend`)         |

### How the webhook reaches Jenkins locally

1. GitHub sends push event to ngrok URL
2. ngrok tunnels the request to `http://localhost:8080` (Jenkins)
3. Jenkins pipeline triggers automatically via `githubPush()`

---

## Phase 2: Continuous Delivery (CD) — ArgoCD

**Goal:** Detect manifest changes in Git and deploy them to Kubernetes automatically.

```
ArgoCD Polling Loop
         │
         ├── Check Git_Repo/k8s/ vs Minikube cluster state
         │
         ├── IF differ:
         │       └── Auto-Sync: kubectl apply
         │
         └── ELSE:
                 └── Sleep 3 minutes → Check again
```

ArgoCD runs inside the Minikube cluster. When CI updates the image tag in `k8s/deployment.yaml`, ArgoCD detects the drift and automatically applies the changes.

---

## Phase 3: Infrastructure & Networking (Minikube)

**Goal:** Run the containerized application on a local Kubernetes cluster and make it reachable.

| Component   | Details                                           |
| ----------- | ------------------------------------------------- |
| Cluster     | Minikube (single-node local K8s)                  |
| Backend     | `todo-server` deployment, ClusterIP on port 5000  |
| Frontend    | `todo-client` deployment, NodePort on 30000       |
| Service     | `client-service` (NodePort 30000 → port 80 → 3000)|
| Access      | `minikube service client-service`                 |

### Security Hardening

| Fix                                     | Description                              |
| --------------------------------------- | ---------------------------------------- |
| Non-root user in containers             | `nextjs` user (UID 1001), `appuser` (UID 1001) |
| Resource requests & limits              | Prevents resource starvation and leaks   |
| Secrets/ConfigMaps for sensitive data   | `db-secrets` (uri), `db-config` (name)   |

---

## Phase 4: Observability (Prometheus & Grafana)

**Goal:** Automatically monitor deployed pods.

```
Prometheus Operator Loop
         │
         ├── Scan for ServiceMonitor resources
         │
         ├── Match: Services with label "app: server"
         │
         ├── Scrape /metrics every 30 seconds
         │
         ├── IF HTTP 200 → Store metrics
         │
         └── IF HTTP Error → Trigger "Target Down" Alert
                 │
                 ▼
         Grafana queries Prometheus
                 │
                 └── Real-time dashboard (up == 1 for healthy deployment)
```

### Monitoring flow

1. Prometheus discovers `ServiceMonitor` resources across all namespaces
2. Targets services with matching label selectors
3. Scrapes `/metrics` every 30 seconds (exposed via `prom-client`)
4. Grafana dashboards query Prometheus and display real-time health

### Frontend RUM

Grafana Faro (`@grafana/faro-web-sdk`) captures real-user monitoring from the browser:
- Web Vitals (LCP, CLS, INP)
- Frontend errors and stack traces
- Session traces

---

## Dockerfile — Multi-Stage Build

### Client (Frontend)

| Stage    | Base Image      | Purpose                                  |
| -------- | --------------- | ---------------------------------------- |
| `base`   | ubuntu:24.04    | Node.js 20 via NodeSource                |
| `deps`   | base            | Install `node_modules` via `npm ci`      |
| `builder`| base            | Build Next.js production bundle          |
| `runner` | base            | **Final image** — standalone output only |

### Server (Backend)

| Stage     | Base Image      | Purpose                                  |
| --------- | --------------- | ---------------------------------------- |
| `builder` | node:22-slim    | Install deps, compile TypeScript, prune  |
| `runner`  | node:22-slim    | **Final image** — dist/ + node_modules   |

---

## Terraform — Local Docker Deployment

`terraform/` provisions local Docker containers via the `kreuzwerker/docker` provider.

```
terraform/
├── provider.tf       # Docker provider + todo-network
├── backend.tf        # todo-backend:latest image + container
└── frontend.tf       # todo-frontend:latest image + container

terraform init
terraform apply
# Backend: http://localhost:2000
# Frontend: http://localhost:1000
```

---

## Jenkins — Code Quality

The `Jenkinsfile` runs SonarQube analysis on every push:

| Stage              | Tool        | Description                    |
| ------------------ | ----------- | ------------------------------ |
| Checkout Code      | Git         | Pull latest source             |
| Install Deps       | npm         | Install dependencies           |
| Build              | npm/tsc     | Compile TypeScript + Next.js   |
| Code Analysis      | SonarQube   | Static analysis                |
| Quality Gate       | SonarQube   | Wait for gate result (abort)   |
| Deploy             | PM2         | Start/restart process          |

SonarQube projects:
- `devops-project-frontend` — client code
- `devops-project-backend` — server code

---

## Application

A full-stack todo list with create, read, update, and delete operations — a simple functional app that validates the entire DevOps pipeline end-to-end.

| Route            | Component   | Description                       |
| ---------------- | ----------- | --------------------------------- |
| `/`              | `Home`      | Todo list UI (CRUD, stats, modal) |
| `GET /api/todos` | Controller  | List all todos                    |
| `POST /api/todos`| Controller  | Create a new todo                 |
| `PUT /:id`       | Controller  | Update a todo                     |
| `DELETE /:id`    | Controller  | Delete a todo                     |
| `GET /metrics`   | prom-client | Prometheus metrics endpoint       |

---

## Project Structure

```
.
├── client/                 # Next.js frontend application
│   ├── app/
│   │   ├── layout.tsx      # Root layout with Faro RUM
│   │   ├── page.tsx        # Todo list UI (430 lines)
│   │   ├── api.ts          # API client layer
│   │   └── globals.css     # Tailwind v4 + animations
│   ├── components/
│   │   └── Faro.tsx        # Grafana Faro initialization
│   ├── Dockerfile          # Multi-stage build
│   └── Jenkinsfile         # CI pipeline (SonarQube + PM2)
├── server/                 # Express 5 backend (TypeScript, ESM)
│   ├── src/
│   │   ├── index.ts        # Entry point + Prometheus /metrics
│   │   ├── connectDB/      # MongoDB connection
│   │   ├── controllers/    # CRUD logic
│   │   ├── models/         # Mongoose Todo schema
│   │   └── routes/         # RESTful routes
│   ├── Dockerfile          # Multi-stage build
│   └── Jenkinsfile         # CI pipeline (SonarQube + PM2)
├── k8s/                    # Kubernetes manifests
│   ├── frontend-deployment.yaml
│   ├── frontend-service.yaml
│   ├── backend-deployment.yaml
│   └── backend-service.yaml
├── terraform/              # Terraform IaC for Docker
│   ├── provider.tf
│   ├── backend.tf
│   └── frontend.tf
├── docker-compose.yml      # Multi-service orchestration
├── Jenkinsfile             # Root pipeline (loads client/server)
└── .env                    # Shared env vars
```
