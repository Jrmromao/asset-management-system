# MVP Plan: Asset Management & Carbon Footprint Tracking

## 1. Core MVP Goals
- Enable users to add, view, update, and delete assets.
- Accurately calculate and display each asset's carbon footprint.
- Provide a dashboard for asset overview and carbon insights.
- Support user authentication and company onboarding.
- Deliver basic ESG reporting on assets and usage (with plans to increment).

---

## 2. MVP Feature Priorities

### A. Must-Have (MVP Launch)
1. **Authentication & Onboarding**
   - User registration, sign-in, and company creation.
   - Basic onboarding flow (create company, add first asset).

2. **Asset Management**
   - Asset CRUD (create, read, update, delete).
   - Asset detail view (status, category, model, location, etc.).
   - Asset list with filtering/search.

3. **Carbon Footprint Calculation**
   - Integrate LLM or rules-based engine for CO₂ estimation.
   - Store and display CO₂ score per asset.
   - Show calculation method/source for transparency.

4. **Dashboard & Basic ESG Reporting**
   - Dashboard with asset stats and carbon summary.
   - Simple charts: total assets, total CO₂, trends over time.
   - Export/download basic ESG reports (CSV/PDF) on assets and usage.

5. **Basic Audit & Error Handling**
   - Log asset changes and CO₂ calculations.
   - User-friendly error messages and validation.

---

### B. Should-Have (Post-MVP/Phase 2)
- **Accessories Management:** CRUD, assignment, and tracking.
- **Licenses Management:** CRUD, seat tracking, and alerts.
- **Advanced Reporting:** Customizable, scheduled, or regulatory reports.
- **Integrations:** ERP, IoT, or external carbon databases.
- **User Roles & Permissions:** Admin, manager, viewer, etc.

---

## 3. Action Steps & Timeline

### Week 1–2: Foundation
- Set up project, repo, and CI/CD.
- Implement authentication and onboarding.
- Design database schema for assets and CO₂ records.

### Week 3–4: Asset Management
- Build asset CRUD UI and API.
- Implement asset list, detail, and filtering.
- Add validation and error handling.

### Week 5–6: Carbon Footprint
- Integrate LLM or rules-based CO₂ calculation.
- Store calculation metadata for auditability.
- Display CO₂ scores in asset views and dashboard.

### Week 7: Dashboard & ESG Reporting
- Build dashboard with key stats and charts.
- Implement basic ESG report export (CSV/PDF) for assets and usage.

### Week 8: Polish & Test
- Add audit logs and improve error handling.
- Write unit/integration tests for core flows.
- Refine UI/UX and documentation.

---

## 4. Success Criteria for MVP
- Users can register, onboard, and add assets.
- Each asset has an accurate, transparent CO₂ score.
- Dashboard provides clear asset and carbon insights.
- Basic ESG reports can be generated and exported.
- Core flows are tested and stable.

---

## 5. After MVP: Phase 2 Roadmap
- Add accessories and licenses management.
- Expand reporting and integrations.
- Enhance user roles, notifications, and compliance features.

---

## 6. Summary Table

| Priority      | Feature/Task                        | Phase      |
|---------------|-------------------------------------|------------|
| High          | Auth & Onboarding                   | MVP        |
| High          | Asset CRUD & Detail                 | MVP        |
| High          | CO₂ Calculation & Display           | MVP        |
| High          | Dashboard & Basic ESG Reporting     | MVP        |
| Medium        | Accessories Management              | Phase 2    |
| Medium        | Licenses Management                 | Phase 2    |
| Medium        | Advanced Reporting/Integrations     | Phase 2+   | 