import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  return (
    <div style={styles.app}>
      <Navbar />

      <div style={styles.body}>
        <Sidebar />

        <main style={styles.content}>{children}</main>
      </div>
    </div>
  );
}

const styles = {
  app: {
    minHeight: "100vh",
    background: "#f5f6f8",
    fontFamily:
      "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    color: "#111827",
  },

  body: {
    display: "flex",
    minHeight: "calc(100vh - 68px)",
  },

  content: {
    flex: 1,
    minWidth: 0,
    minHeight: "calc(100vh - 68px)",
    padding: "32px",
    boxSizing: "border-box",
    background: "#f5f6f8",
  },
};
