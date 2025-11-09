// contexts/AuthContext.tsx
"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // <-- This will be our global loader
  const router = useRouter();

  // This useEffect now *only* handles the listener
  useEffect(() => {
    // Listen to login/logout events
    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false); // Set loading to false *after* we get the session
      }
    );

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, []); // <-- FIX #1: Empty dependency array. Only runs once.

  // This useEffect *only* handles the initial session check
  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setUser(data.session.user);
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    getSession();
  }, []); // <-- FIX #2: Empty dependency array. Only runs once.

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/login"); // This is correct
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);