// lib/db.ts
// This file handles the instantiation of the Prisma Client.
// It includes a common pattern to prevent creating multiple instances of Prisma Client
// in a development environment due to Next.js hot-reloading.

import { PrismaClient } from "@prisma/client";

// Declare a global variable to hold the Prisma Client instance.
declare global {
  var prisma: PrismaClient | undefined;
}

// Check if a Prisma Client instance already exists in the global scope.
// If not, create a new one. In production, this will only run once.
// In development, this prevents creating a new connection on every hot reload.
const client = globalThis.prisma || new PrismaClient();

// If we are in a development environment, assign the new client to the global variable.
if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = client;
}

// Export the single, shared instance of the Prisma Client.
export default client;
