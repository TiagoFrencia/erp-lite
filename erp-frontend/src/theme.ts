// RUTA: src/theme.ts
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#FF4433" },            // coral
    success: { main: "#22C55E" },
    warning: { main: "#EAB308" },
    error:   { main: "#EF4444" },
    background: {
      default: "#0F172A",                    // fondo principal
      paper:   "#1E293B",                    // sidebar/cards
    },
    text: {
      primary:   "#F8FAFC",
      secondary: "#CBD5E1",
    },
  },
  typography: {
    fontFamily: ["Inter", "system-ui", "Segoe UI", "Roboto", "Arial", "sans-serif"].join(", "),
    h1: { fontFamily: "Montserrat, Inter, system-ui, sans-serif", fontWeight: 800 },
    h2: { fontFamily: "Montserrat, Inter, system-ui, sans-serif", fontWeight: 700 },
    h3: { fontFamily: "Montserrat, Inter, system-ui, sans-serif", fontWeight: 700 },
    h4: { fontFamily: "Montserrat, Inter, system-ui, sans-serif", fontWeight: 600 },
    h5: { fontFamily: "Montserrat, Inter, system-ui, sans-serif", fontWeight: 600 },
    h6: { fontFamily: "Montserrat, Inter, system-ui, sans-serif", fontWeight: 600 },
    body1: { fontWeight: 400 },
    body2: { fontWeight: 400 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  shape: { borderRadius: 12 },               // 8–12px → elegimos 12
  shadows: [
    "none",
    "0px 1px 2px rgba(0,0,0,0.15)",
    "0px 2px 6px rgba(0,0,0,0.18)",
    "0px 4px 10px rgba(0,0,0,0.20)",
    ...Array(22).fill("0px 4px 12px rgba(0,0,0,0.20)"),
  ] as any,
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: "#0F172A" },
        "*": { scrollbarColor: "#334155 #0F172A" },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: { boxShadow: "0 4px 12px rgba(0,0,0,0.25)" },
        colorPrimary: { backgroundColor: "#1E293B" },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: "none" },
      },
      defaultProps: { elevation: 2 },
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.20)" },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 10 },
        containedPrimary: {
          ":hover": { filter: "brightness(1.05)" },
        },
      },
    },
    MuiTextField: {
      defaultProps: { size: "medium" },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: { backgroundColor: "#1E293B", color: "#F8FAFC" },
      },
    },
  },
});

export default theme;
