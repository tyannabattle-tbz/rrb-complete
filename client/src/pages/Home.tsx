import { useLocation } from "wouter";
import QumusHome from "./QumusHome";

export default function Home() {
  // Bypass authentication - show Control Center directly for testing
  return <QumusHome />;
}
