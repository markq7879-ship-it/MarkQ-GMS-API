import { createBrowserRouter } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import LoginPage from "../features/auth/LoginPage";
import ProtectedRoute from "../features/auth/ProtectedRoute";
import DashboardPage from "../features/dashboard/DashboardPage";
import BranchesPage from "../features/branches/BranchesPage";
import MembersPage from "../features/members/MembersPage";
import MemberProfilePage from "../features/members/MemberProfilePage";
import MembershipPlansPage from "../features/membershipPlans/MembershipPlansPage";
import MembershipsPage from "../features/memberships/MembershipsPage";
import PaymentsPage from "../features/payments/PaymentsPage";
import OtherIncomePage from "../features/otherIncome/OtherIncomePage";
import ReportsPage from "../features/reports/ReportsPage";
import ReportPlaceholder from "../features/reports/ReportPlaceholder";
import UsersPage from "../features/users/UsersPage";
import SettingsPage from "../features/settings/SettingsPage";
import ComingSoonPage from "../features/premium/ComingSoonPage";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "branches", element: <BranchesPage /> },
      { path: "members", element: <MembersPage /> },
      { path: "members/:id", element: <MemberProfilePage /> },
      { path: "membership-plans", element: <MembershipPlansPage /> },
      { path: "memberships", element: <MembershipsPage /> },
      { path: "payments", element: <PaymentsPage /> },
      { path: "other-income", element: <OtherIncomePage /> },
      { path: "reports", element: <ReportsPage /> },
      { path: "reports/:slug", element: <ReportPlaceholder /> },
      { path: "users", element: <UsersPage /> },
      // { path: "settings", element: <SettingsPage /> },
      { path: "pro/:slug", element: <ComingSoonPage /> },
    ],
  },
]);


