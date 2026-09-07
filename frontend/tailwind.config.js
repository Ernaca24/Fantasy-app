/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Cambia esta paleta por la tuya para diferenciarte visualmente
        primary: "#1e3a5f",
        accent: "#f2a900",
      },
    },
  },
  plugins: [],
};
