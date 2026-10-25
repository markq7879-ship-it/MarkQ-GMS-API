import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { queryClient } from "../lib/query/queryClient";
import { router } from "../routes/router";
import { useBootstrapAuth } from "../features/auth/useBootstrapAuth";

function AuthBootstrap() {
  useBootstrapAuth();
  return null;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthBootstrap />
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
