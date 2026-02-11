import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().default("3000").transform(Number).pipe(z.number().int().positive()),
});

export const env = EnvSchema.parse(process.env);
