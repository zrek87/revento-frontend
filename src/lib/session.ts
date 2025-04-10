let lastSessionCheck: number = 0;
let sessionStatus: boolean | null = null;

export async function checkSession() {
  try {
    const now = Date.now();
    if (sessionStatus !== null && now - lastSessionCheck < 60000) {
      return sessionStatus;
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE}routes/auth/check_session.php`,
      {
        credentials: "include",
      }
    );

    if (!response.ok) throw new Error("Session check failed");

    const data = await response.json();
    sessionStatus = data.loggedIn;
    lastSessionCheck = now;

    return data.loggedIn;
  } catch (error) {
    console.error("Error checking session:", error);
    return false;
  }
}

export async function extendSession() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE}routes/auth/check_session.php`,
      {
        method: "POST",
        credentials: "include",
      }
    );

    if (!response.ok) throw new Error("Failed to extend session");

    const data = await response.json();
    sessionStatus = data.loggedIn;
    lastSessionCheck = Date.now();

    console.log("Session extended:", data);
  } catch (error) {
    console.error("Error extending session:", error);
  }
}
