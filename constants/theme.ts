export type ThemeColors = {
  background: string;
  surface: string;
  surfaceSubtle: string;
  card: string;
  foreground: string;
  muted: string;
  subtle: string;
  border: string;
  primary: string;
  primarySoft: string;
  success: string;
  successSoft: string;
  warning: string;
  error: string;
  dialogBackdrop: string;
};

export const lightColors: ThemeColors = {
  background: "#F6F8F5",
  surface: "#FFFFFF",
  surfaceSubtle: "#F0F4F1",
  card: "#FFFFFF",
  foreground: "#26312E",
  muted: "#899590",
  subtle: "#A3ADA8",
  border: "#E5EBE7",
  primary: "#EB6F61",
  primarySoft: "#FFF0ED",
  success: "#5A9E7E",
  successSoft: "#EDF8F1",
  warning: "#D18B38",
  error: "#C95751",
  dialogBackdrop: "rgba(38, 49, 46, 0.48)",
};

export const darkColors: ThemeColors = {
  background: "#121B18",
  surface: "#1A2723",
  surfaceSubtle: "#23332E",
  card: "#1A2723",
  foreground: "#EEF4F1",
  muted: "#97ACA3",
  subtle: "#6D8179",
  border: "#283B34",
  primary: "#EB6F61",
  primarySoft: "#362220",
  success: "#5A9E7E",
  successSoft: "#1B3127",
  warning: "#E09540",
  error: "#E06862",
  dialogBackdrop: "rgba(0, 0, 0, 0.72)",
};
