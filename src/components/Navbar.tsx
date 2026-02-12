"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import Swal from "sweetalert2";

import { auth } from "../lib/auth";

const navLinks = [
  { href: "/directory", label: "Directory" },
  { href: "/directory", label: "Family Profile" },
  { href: "/dashboard", label: "Dashboard" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPass, setSignupPass] = useState("");
  const [signupPass2, setSignupPass2] = useState("");
  const [error, setError] = useState("");
  const [userName, setUserName] = useState<string | null>(null);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);

  const googleProvider = new GoogleAuthProvider();

  const openModal = (nextMode: "login" | "signup") => {
    setMode(nextMode);
    setIsOpen(true);
  };

  const closeModal = () => setIsOpen(false);

  const resetError = () => setError("");

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetError();
    if (loginEmail.length < 6 || loginPass.length < 6) {
      setError("Invalid login data.");
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPass);
      Swal.fire({ icon: "success", title: "Signed in" });
      closeModal();
    } catch (err) {
      Swal.fire({ icon: "error", title: "Login failed" });
      setError(err instanceof Error ? err.message : "Login failed.");
    }
  };

  const handleSignup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetError();
    if (signupName.length < 3 || signupEmail.length < 6 || signupPass.length < 6) {
      setError("Enter full name, email, and a 6+ character password.");
      return;
    }
    if (signupPass !== signupPass2) {
      setError("Passwords must match.");
      return;
    }
    try {
      const credential = await createUserWithEmailAndPassword(
        auth,
        signupEmail,
        signupPass,
      );
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: signupName });
        setUserName(auth.currentUser.displayName ?? credential.user.email);
      }
      Swal.fire({ icon: "success", title: "Account created" });
      closeModal();
    } catch (err) {
      Swal.fire({ icon: "error", title: "Signup failed" });
      setError(err instanceof Error ? err.message : "Signup failed.");
    }
  };

  const handleSignOut = async () => {
    resetError();
    try {
      await signOut(auth);
      Swal.fire({ icon: "success", title: "Signed out" });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Sign-out failed" });
      setError(err instanceof Error ? err.message : "Sign-out failed.");
    }
  };

  const handleGoogleSignIn = async () => {
    resetError();
    try {
      await signInWithPopup(auth, googleProvider);
      Swal.fire({ icon: "success", title: "Signed in with Google" });
      closeModal();
    } catch (err) {
      Swal.fire({ icon: "error", title: "Google sign-in failed" });
      setError(err instanceof Error ? err.message : "Google sign-in failed.");
    }
  };

  const getProfilePicUrl = (user: typeof auth.currentUser) =>
    user?.photoURL ?? null;

  const getUserName = (user: typeof auth.currentUser) =>
    user?.displayName ?? user?.email ?? null;

  const isUserSignedIn = () => !!auth.currentUser;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserName(getUserName(user));
      setUserPhoto(getProfilePicUrl(user));
    });
    return () => unsubscribe();
  }, []);

  return (
    <header className="navbar">
      <Link className="navbar__logo" href="/">
        <span className="navbar__badge">RF</span>
        Rent-A-Family
      </Link>
      <nav className="navbar__links">
        {navLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="navbar__actions">
        {!isUserSignedIn() ? (
          <>
            <button
              className="navbar__ghost"
              type="button"
              onClick={() => openModal("login")}
            >
              Login
            </button>
            <button
              className="navbar__cta"
              type="button"
              onClick={() => openModal("signup")}
            >
              Get Started
            </button>
          </>
        ) : null}
        <div id="user-container" className="navbar__user">
          {isUserSignedIn() && userName ? (
            <>
              <div className="navbar__profile">
                {userPhoto ? (
                  <img
                    src={userPhoto}
                    alt={userName}
                    className="navbar__avatar"
                  />
                ) : (
                  <div className="navbar__avatar navbar__avatar--fallback">
                    {userName.slice(0, 1).toUpperCase()}
                  </div>
                )}
                <div id="user-name" className="navbar__user-name">
                  {userName}
                </div>
              </div>
              <button id="sign-out" className="navbar__auth" onClick={handleSignOut}>
                Sign-out
              </button>
            </>
          ) : (
            <button
              id="sign-in"
              className="navbar__auth"
              onClick={handleGoogleSignIn}
            >
              <span className="navbar__icon" aria-hidden="true">
                o
              </span>
              Sign-in with Google
            </button>
          )}
        </div>
      </div>
      {isOpen ? (
        <div className="modal" role="dialog" aria-modal="true">
          <div className="modal__backdrop" onClick={closeModal} />
          <div className="modal__panel">
            <button className="modal__close" type="button" onClick={closeModal}>
              x
            </button>
            <div className="modal__tabs">
              <button
                type="button"
                className={mode === "login" ? "is-active" : ""}
                onClick={() => setMode("login")}
              >
                Login
              </button>
              <button
                type="button"
                className={mode === "signup" ? "is-active" : ""}
                onClick={() => setMode("signup")}
              >
                Signup
              </button>
            </div>
            {error ? <p className="modal__error">{error}</p> : null}
            {mode === "login" ? (
              <form className="modal__form" autoComplete="off" onSubmit={handleLogin}>
                <button
                  type="button"
                  className="modal__google"
                  onClick={handleGoogleSignIn}
                >
                  Continue with Google
                </button>
                <div className="modal__divider">
                  <span>or</span>
                </div>
                <label htmlFor="emailLogin">Email</label>
                <input
                  id="emailLogin"
                  type="email"
                  value={loginEmail}
                  onChange={(event) => setLoginEmail(event.target.value)}
                  required
                />
                <label htmlFor="passLogin">Password</label>
                <input
                  id="passLogin"
                  type="password"
                  value={loginPass}
                  onChange={(event) => setLoginPass(event.target.value)}
                  required
                />
                <button type="submit">Log In</button>
              </form>
            ) : (
              <form className="modal__form" autoComplete="off" onSubmit={handleSignup}>
                <button
                  type="button"
                  className="modal__google"
                  onClick={handleGoogleSignIn}
                >
                  Continue with Google
                </button>
                <div className="modal__divider">
                  <span>or</span>
                </div>
                <label htmlFor="name">Name</label>
                <input
                  id="name"
                  placeholder="Enter your full name"
                  value={signupName}
                  onChange={(event) => setSignupName(event.target.value)}
                  required
                />
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={signupEmail}
                  onChange={(event) => setSignupEmail(event.target.value)}
                  required
                />
                <label htmlFor="pass">Password</label>
                <input
                  id="pass"
                  type="password"
                  value={signupPass}
                  onChange={(event) => setSignupPass(event.target.value)}
                  required
                />
                <label htmlFor="pass2">Confirm Pass</label>
                <input
                  id="pass2"
                  type="password"
                  value={signupPass2}
                  onChange={(event) => setSignupPass2(event.target.value)}
                  required
                />
                <button type="submit">Sign Up</button>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
