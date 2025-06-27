# Healthcare Dashboard

A comprehensive, modern healthcare data dashboard built with **React**, **TypeScript**, and **Vite**. This dashboard is designed to visualize, manage, and analyze key hospital and patient metrics for healthcare administrators, clinicians, and analysts.

---

## Features

- **Live Overview**: Displays real-time statistics including total patients, active patients, appointments, bed occupancy, staff on duty, revenue, expenses, and patient satisfaction scores.
- **Patient Demographics**: Visualize patient population by age, gender, and department.
- **Appointment Management**: Track, filter, and manage patient appointments with full details and timelines.
- **Secure Patient Data**: Handles patient data securely, with masking and no PII exposed in the frontend. Supports both API and local mock data fallback.
- **Department & Staff Management**: Lists departments, department-specific staff, and supports secure staff listing (no PII).
- **Alerts and Activities**: Surface critical alerts (vital sign changes, emergencies) and recent activity logs for audit and monitoring.
- **Financial & Quality Metrics**: Analyze hospital revenue, expenses, quality scores, and operational costs.
- **Inventory Tracking**: Monitor medication, supply, and equipment inventory.
- **Robust Data Layer**: Uses a service layer (`dataService.ts`) for all data access, supporting both live API and mock data.
- **Performance**: Built with Vite for fast development and production builds. Includes in-memory caching for efficient data retrieval.
- **Developer Experience**: TypeScript-first, extensive ESLint configuration, modular services, and ready for production expansion.

---

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **State & Data**: React hooks, custom services, in-memory cache
- **Linting**: ESLint with recommended and strict TypeScript rules
- **Testing**: (Add details if tests are present)
- **API**: Pluggable backend API (with mock fallback)

---

## Project Structure

- `src/data/healthcareData.js` — Rich mock data for all dashboard features.
- `src/services/dataService.ts` — Centralized service for data access, API fallback, and data normalization.
- `src/services/cacheService.ts` — Simple in-memory cache for reducing redundant API calls.
- `src/features/` — Modular React components for patients, appointments, departments, alerts, and more.
- `src/components/` — Shared UI components and layout.
- `src/types/schema.ts` — TypeScript types for all major entities.

---

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

4. **Lint the code:**
   ```bash
   npm run lint
   ```

---

## Data Flow

- The dashboard calls methods from `dataService.ts` to fetch all data.
- The service tries to connect to a backend API; if unavailable, it uses rich local mock data (from `healthcareData.js`).
- All patient and staff data is masked in the frontend to protect PII.
- Caching is applied per data type for performance.

---

## Extending ESLint

For stricter linting, update your `eslint.config.js`:
```js
export default tseslint.config({
  extends: [
    ...tseslint.configs.recommendedTypeChecked,
    ...tseslint.configs.strictTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```
For React-specific rules, consider:
```js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'
export default tseslint.config({
  plugins: {
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```

---

## License

MIT

---

## Author

- [Gaurav Pandey](https://github.com/GauravPandey05)
