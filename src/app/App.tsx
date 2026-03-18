import { useState } from "react";
import { LandingPage } from "./pages/LandingPage";
import { AuthPage } from "./pages/AuthPage";
import { MainApp } from "./pages/MainApp";
import { Toaster } from "./components/ui/sonner";

type AppState = "landing" | "auth" | "app";

export default function App() {
  const [appState, setAppState] = useState<AppState>("landing");

  const handleGetStarted = () => {
    setAppState("auth");
  };

  const handleLogin = () => {
    setAppState("auth");
  };

  const handleAuthSuccess = () => {
    setAppState("app");
  };

  const handleBackToLanding = () => {
    setAppState("landing");
  };

  return (
    <>
      <Toaster />

      {appState === "landing" && (
        <LandingPage
          onGetStarted={handleGetStarted}
          onLogin={handleLogin}
        />
      )}

      {appState === "auth" && (
        <AuthPage
          onBack={handleBackToLanding}
          onSuccess={handleAuthSuccess}
        />
      )}

      {appState === "app" && (
        <MainApp
          onLogout={handleBackToLanding}
        />
      )}
    </>
  );
}
