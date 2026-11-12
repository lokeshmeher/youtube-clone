import { signInWithGoogle, signOut } from "../../lib/firebase/auth";
import styles from "./sign-in.module.css";
import { User } from "firebase/auth";
import { Fragment } from "react";

interface SignInProps {
  user: User | null;
}

export default function SignIn({ user }: SignInProps) {
  return (
    <Fragment>
      {user ? (
        <button className={styles.signin} onClick={signOut}>
          Sign Out
        </button>
      ) : (
        <button className={styles.signin} onClick={signInWithGoogle}>
          Sign In
        </button>
      )}
    </Fragment>
  );
}
