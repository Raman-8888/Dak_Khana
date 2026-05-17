# ✨ DakExport Dashboard (Frontend)

The frontend subsystem for DakExport is a premium, high-fidelity dashboard built with **React 19** and **Vite**. It features 3D visualizations and smooth animations to provide an elite user experience.

## 🗝 Key Features
- **3D Visualizations**: Real-time shipment tracking using **React Three Fiber** and **Three.js**.
- **GSAP Animations**: Fluid transitions and micro-interactions for a premium feel.
- **Tailwind 4 Styling**: Modern, high-performance styling with advanced CSS features.
- **State Management**: Lightweight and reactive state handling via **Zustand**.
- **Responsive Design**: Fully optimized for mobile (Delivery Agents) and desktop (Admin/Ops).

## 🛠 Tech Stack Details
- **Framework**: React 19 (Vite 8)
- **State**: Zustand
- **Animations**: GSAP
- **3D Engine**: Three.js (R3F)
- **API Client**: Axios
- **Styling**: Tailwind CSS 4 + PostCSS

## 🏗 Directory Overview
- `src/components`: UI components grouped by feature (home, auth, layout, etc.).
- `src/pages`: Main page components for different roles.
- `src/store`: Zustand stores for Auth and Export state.
- `src/lib`: External integrations (Supabase, API clients).
- `src/assets`: Multimedia assets including 3D models and videos.

## 🚀 Local Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Run Dev Server**
   ```bash
   npm run dev
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```

## 🎨 Design Language
- **Colors**: Deep charcoal backgrounds, vibrant action accents, and glassmorphism.
- **Typography**: Modern, geometric sans-serif fonts.
- **Motion**: Purposeful, non-distracting animations to guide user attention.
