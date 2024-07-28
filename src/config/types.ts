import type { z } from "zod";
import type { ForkConfigSchema } from "./schema";

export type ForkConfig = z.infer<typeof ForkConfigSchema>;

export type Config = Partial<ForkConfig>;
