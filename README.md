# PujaConnect - Priest & Temple Puja Booking Application

A beautiful React TypeScript Vite application for booking pujas and connecting with priests and temples.

## 🌟 Features

- **Beautiful Landing Page**: Showcasing the platform's features and benefits
- **Mobile-First Design**: Responsive design optimized for all devices
- **Login Screen with OTP Verification**:
  - Mobile number authentication
  - 4-digit OTP verification
  - Beautiful gradient UI with smooth transitions
  - Form validation and error handling
- **Dashboard**: User dashboard after successful login
- **Modern Tech Stack**: React 19, TypeScript, Vite, Tailwind CSS

## 📁 Project Structure

```
src/
├── pages/
│   ├── LandingPage.tsx      # Hero page with features
│   ├── LoginScreen.tsx       # Mobile OTP login
│   └── Dashboard.tsx         # User dashboard
├── App.tsx                   # Main app with routing
├── App.css                   # Custom styles
├── index.css                 # Tailwind & global styles
└── main.tsx                  # Entry point
```

## 🚀 Installation & Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`

3. **Build for production**:
   ```bash
   npm run build
   ```

4. **Preview production build**:
   ```bash
   npm run preview
   ```

## 🔐 Login Credentials (Demo)

The login is currently in demo mode. You can enter:
- **Mobile Number**: Any 10-digit number (e.g., 9876543210)
- **OTP**: Any 4-digit code (e.g., 1234)

## 🛠 Technology Stack

- **React 19**: UI library
- **TypeScript**: Type safety
- **Vite**: Lightning-fast build tool
- **Tailwind CSS**: Utility-first CSS framework
- **React Router DOM**: Client-side routing
- **Lucide React**: Beautiful SVG icons

## 🎨 Key Components

### Landing Page
- Hero section with call-to-action
- Feature highlights with icons
- Navigation header
- Footer

### Login Screen
- Two-step login process:
  1. Mobile number input with formatting
  2. OTP verification
- Smooth transitions between steps
- Form validation
- Back navigation
- Terms and Privacy links

### Dashboard
- Welcome message
- Logout functionality
- Browse temples button (placeholder)

## 🎨 Styling

The application uses:
- **Tailwind CSS** for responsive, utility-first styling
- **Orange and Red gradients** for brand colors
- **Smooth transitions** and animations
- **Shadow effects** for depth
- **Mobile-first responsive design**

## 🎭 Color Scheme

- **Primary**: Orange (`#ea580c`)
- **Secondary**: Red (`#dc2626`)
- **Gradients**: Orange to Red
- **Background**: White and light orange
- **Accent**: Flame icon for branding

## 📋 Future Enhancements

- [ ] Real backend integration for OTP verification
- [ ] User registration flow
- [ ] Temple and priest listing
- [ ] Booking calendar
- [ ] Payment integration
- [ ] User profile management
- [ ] Reviews and ratings
- [ ] Push notifications

## 💡 Development Tips

- Use `npm run lint` to check code quality
- Modify `tailwind.config.js` to customize colors
- Add new pages in `src/pages/` directory
- Create reusable components in `src/components/` directory
- Use TypeScript for type safety

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📄 License

This project is part of PujaConnect - a dedicated platform for temple and priest services.

---

**Happy coding! 🙏**
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
