# DataSec Hub - Data Security Compliance Knowledge Platform

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Platform](https://img.shields.io/badge/platform-Web-orange.svg)
![React](https://img.shields.io/badge/React-18.3-61DAFB.svg?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6.svg?logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-4.0-06B6D4.svg?logo=tailwindcss)

**Enterprise-grade Data Security Compliance Knowledge Service Platform**

[Quick Start](#quick-start) · [Documentation](#documentation) · [Live Demo](https://demo.datasec-hub.com)

</div>

---

## 🎉 Project Status

✅ **Frontend Complete** - All frontend features implemented: 4 pages, 11 core modules, 40+ components
🚧 **Backend Development** - NestJS backend in progress
📚 **Documentation** - Complete system documentation and guides

**Current Features**:
- ✅ Complete UI/UX interface
- ✅ All business workflows
- ✅ Mock data support
- ✅ API interface design
- ⏳ Real backend integration (in development)

---

## 📋 Overview

DataSec Hub is a professional data security policy knowledge service platform that transforms complex laws and regulations into clear, actionable compliance requirements through an innovative **COU (Compliance Obligation Unit)** system, providing enterprises with:

- 📚 **Comprehensive Policy Library**: Covering all domestic data security laws, regulations, and standards
- 🎯 **COU System**: Structured compliance obligation units with clear requirements
- 🔍 **Intelligent Search**: Keywords, multi-dimensional filtering, tag system
- 🎨 **Scenario Builder**: Custom compliance scenarios with intelligent weight calculation
- 📊 **Visual Analytics**: Weight distribution, priority sorting, statistical reports
- 🔌 **API Services**: Support for enterprise system integration and local LLM calls

---

## 🌟 Core Features

### 1. COU (Compliance Obligation Unit) System

Innovative structured compliance knowledge approach:

```typescript
COU Example: COU-DSL-001
├── Title: Important data processors shall specify data security responsible person
├── Source: Data Security Law of PRC, Article 27
├── Type: Mandatory
├── Base Weight: 10 (Legal level)
├── Applicable Industry: General
├── Required Actions:
│   ├── 1. Designate data security responsible person
│   ├── 2. Establish data security management organization
│   └── 3. Implement data security protection responsibilities
├── Technical Measures: [Org structure design, Responsibility system]
└── Related COUs: [COU-DSL-002, COU-PIPL-015]
```

### 2. Three-tier Weight System

Scientific priority calculation:

- **Base Weight** (1-10 points)
  - Law: 10 points
  - Administrative Regulation: 9 points
  - Department Rule: 8 points
  - National Standard: 7 points
  - Industry Standard: 6 points
  - Local Regulation: 5 points
  - Guidelines: 4 points

- **Scenario Weight** (Dynamic calculation)
  - Tag match × 0.5
  - Industry match × 1.0
  - Region match × 0.8
  - User type match × 0.6

- **Final Weight** = Base Weight + Scenario Weight

### 3. Smart Scenario Builder

6 preset scenario templates + custom scenarios:

- 🎮 Gaming Overseas
- 🏦 Financial Compliance
- 🛒 E-commerce Compliance
- 🏥 Medical Data
- 🏙️ Smart City
- 📚 EdTech

**Scenario Analysis Features**:
- Weight distribution charts
- COU priority sorting
- Compliance coverage rate
- Gap analysis

### 4. Complete Version Management

Solving policy update challenges:

- 📜 Policy version history tracking
- 🔄 New vs old version comparison
- ⚠️ Repealed policy reminders
- 🔗 Version relationship mapping

### 5. Dual Tag System

Improving search precision:

- 🏷️ **Manual Tags**: Professionally annotated core tags
- 🤖 **AI Tags**: Automatically extracted auxiliary tags
- 📂 Tag Categories: Legal, Technical, Management, Industry, Scenario

---

## 🏗️ Architecture

### Frontend Stack

```
React 18.3 + TypeScript 5.x
├── UI Framework: Tailwind CSS 4.0
├── Component Library: Radix UI (40+ components)
├── Icons: Lucide React
├── Notifications: Sonner
├── State Management: React Hooks
├── Charts: Recharts
└── Build Tool: Vite 6.x
```

### Core Pages (Completed)

1. **Landing Page** - Marketing page with product introduction
2. **Auth Page** - Login/registration with 3 user types
3. **Main App** - 7 modules: COU Browser, Policy Browser, Scenario Manager, etc.
4. **Admin Dashboard** - Policy management, COU management, user management

### Backend Stack (In Development)

```
NestJS + TypeScript
├── Database: PostgreSQL 15
├── Search: Elasticsearch
├── Cache: Redis 7.x
├── Auth: JWT + Passport
└── AI Services: Multiple LLM providers
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/datasec-hub.git
cd datasec-hub

# Install dependencies
npm install

# Start dev server
npm run dev

# Open browser
# http://localhost:5173
```

### Build for Production

```bash
npm run build
```

---

## 📁 Project Structure

```
datasec-hub/
├── src/
│   ├── app/
│   │   ├── pages/              # Page components
│   │   ├── components/         # Business components
│   │   ├── types/              # Type definitions
│   │   ├── data/               # Mock data
│   │   └── services/           # API services
│   └── styles/                 # Styles
├── backend/                    # NestJS backend
├── docs/                       # Documentation
├── public/                     # Static assets
└── package.json
```

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [QUICK_START.md](./QUICK_START.md) | 5-minute quick start guide |
| [DEVELOPMENT_STATUS.md](./DEVELOPMENT_STATUS.md) | Development status report |
| [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) | Backend implementation guide |
| [API_INTEGRATION_GUIDE.md](./API_INTEGRATION_GUIDE.md) | API integration guide |
| [BUSINESS_PLAN.md](./BUSINESS_PLAN.md) | Business plan |

---

## 💡 Use Cases

- **Enterprise Compliance Teams**: Quick policy retrieval, compliance checklists
- **Legal Teams**: Latest laws and regulations, policy interpretation
- **Product Managers**: Compliance requirements for product design
- **Tech Teams**: API integration, automated compliance checks
- **Consulting Firms**: Professional compliance services

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## 📝 License

This project is licensed under the MIT License - see [LICENSE](./LICENSE) file.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) - UI component library
- [Radix UI](https://www.radix-ui.com/) - Headless UI primitives
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS

---

<div align="center">

**DataSec Hub - Making Data Compliance Simple**

Made with ❤️ by DataSec Team

</div>
