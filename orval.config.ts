import { defineConfig } from "orval";

export default defineConfig({
  api: {
    input: "http://localhost:3000/swagger/json",
    output: {
      mode: "tags-split",
      target: "./lib/services",
      client: "react-query",
      schemas: "./lib/schemas",
      mock: false,
      override: {
        mutator: {
          path: "./lib/api/axiosInstance.ts",
          name: "defaultMutator",
        },
      },
    },
  },
});
