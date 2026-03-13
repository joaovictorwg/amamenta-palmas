import { app } from "@/app/app";

app.listen({ port: 3333, host: "0.0.0.0" }).then(() => {
  console.log("HTTP Server running on http://localhost:3333!");
  console.log("Docs available at http://localhost:3333/docs!");
});
