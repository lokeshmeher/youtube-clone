"use client";

import Image from "next/image";
import Link from "next/link";

import styles from "./navbar.module.css";
import SignIn from "./sign-in";
import { User } from "firebase/auth";
import { useEffect, useState } from "react";
import { onAuthStateChangedHelper } from "@/lib/firebase/auth";
import Upload from "./upload";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChangedHelper((user) => {
      setUser(user);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  });

  return (
    <nav className={styles.nav}>
      <Link href="/">
        <Image
          height={20}
          width={90}
          src="/youtube-logo.svg"
          alt="YouTube Logo"
          priority
        />
      </Link>
      {user && <Upload />}
      <SignIn user={user} />
    </nav>
  );
}
