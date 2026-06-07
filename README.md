# StackMart 🛒⚡

**A decentralized storefront builder powered by Stacks (Bitcoin L2)**

StackMart is a Web3 ecommerce platform that enables merchants to create digital storefronts and accept STX payments through the Bitcoin Layer 2 network. Built for creators, developers, and entrepreneurs who want to leverage blockchain technology for secure, decentralized commerce.

## 🌟 Overview

This project establishes the foundation for a decentralized marketplace where:
- Merchants can list and sell digital products
- Customers pay with STX (Stacks tokens) 
- All transactions are secured by Bitcoin's security model
- No intermediaries or traditional payment processors required

**Live Demo:** [https://stacks-mart.vercel.app/](https://stacks-mart.vercel.app/)

## 🧰 What's Built (Month 1 Foundation)

### ✅ Core Infrastructure
- **React + Next.js + Tailwind** frontend with modern UI/UX
- **Stacks Wallet Integration** via `@stacks/connect`
- **Wallet Connection Component** for seamless user authentication
- **Project Structure** optimized for future Web3 integrations
- **Public Deployment** on Vercel with mobile/desktop compatibility

### 🔌 Wallet Features
- Connect/disconnect Hiro Wallet functionality
- User session management with local storage
- Address display and abbreviation utilities
- Secure authentication flow

### 🎨 UI Components
- Landing page with Stacks branding
- Features showcase section
- Community engagement section
- Responsive design across all devices

## 🧩 Tech Stack

| Purpose | Library/Framework |
|---------|------------------|
| Frontend Framework | Next.js 15, React 19 |
| Styling | Tailwind CSS 4 |
| Stacks Integration | @stacks/connect, @stacks/auth |
| Wallet Connection | Hiro Wallet |
| Deployment | Vercel |
| Language | TypeScript |

## 🗂️ Key Files & Structure

```
├── app/
│   ├── layout.tsx              # App layout and metadata
│   ├── page.tsx                # Main landing page
│   └── globals.css             # Global styles
├── components/
│   ├── section/                # Page sections (home, features, etc.)
│   ├── ui/                     # Reusable UI components
│   └── wallet/                 # Wallet-related components
├── lib/
│   ├── use-stacks.ts          # Stacks wallet hook
│   └── stx-utils.ts           # Utility functions for addresses
├── hooks/
│   ├── useCart.ts             # Shopping cart functionality
│   ├── useCheckout.ts         # Checkout process management
│   └── useWallet.ts           # Wallet state management
└── prisma/                    # Database schema (future)
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Hiro Wallet browser extension

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd stacks-mart
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Run the development server**
```bash
npm run dev
```

5. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

### 🔧 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 🧪 Testing & Verification

### ✅ Completed Tests
- [x] App builds and runs successfully with `npm run dev`
- [x] Hiro Wallet popup opens and connects/disconnects correctly
- [x] Public deployment tested on mobile & desktop
- [x] Wallet connection persists across page reloads
- [x] Address abbreviation and display working properly

### 🔍 Manual Testing Steps
1. Install Hiro Wallet browser extension
2. Visit the live demo or run locally
3. Click "Connect Wallet" button
4. Approve connection in Hiro Wallet popup
5. Verify wallet address displays correctly
6. Test disconnect functionality

## 🌐 Deployment

The application is automatically deployed to Vercel on every push to the main branch.

**Production URL:** [https://stacks-mart.vercel.app/](https://stacks-mart.vercel.app/)

### Manual Deployment
```bash
npm run build
# Deploy the .next folder to your preferred hosting platform
```

## 🔜 Roadmap (Next Steps)

### Month 2: Onboarding Screen
- [ ] Implement Onboarding for user to create storefront
- [ ] Add Stores page
- [ ] Add payment flow

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines and feel free to submit issues and pull requests.

### Development Guidelines
- Follow TypeScript best practices
- Use Tailwind for styling
- Ensure wallet integration compatibility
- Test on multiple browsers and devices

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🔗 Links

- **Live Demo:** [https://stacks-mart.vercel.app/](https://stacks-mart.vercel.app/)
- **Stacks Documentation:** [https://docs.stacks.co/](https://docs.stacks.co/)
- **Hiro Wallet:** [https://wallet.hiro.so/](https://wallet.hiro.so/)

## 💡 Why StackMart Matters

This project demonstrates meaningful integration with the Stacks ecosystem by:
- **Leveraging Bitcoin Security:** Built on Stacks L2 for Bitcoin-level security
- **Real Web3 Functionality:** Actual wallet integration, not just UI mockups  
- **Developer-Friendly:** Clean codebase with clear patterns for Web3 development
- **Production Ready:** Deployed, tested, and accessible to real users

StackMart represents the future of decentralized commerce - where merchants have full control, customers have privacy, and transactions are secured by the world's most trusted blockchain.

---

**Built with ❤️ for the Stacks ecosystem and Code4STX**
