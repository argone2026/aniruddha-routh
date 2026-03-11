import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function GET(request: Request) {
  const isProduction = process.env.NODE_ENV === "production";
  const providedSeedSecret = request.headers.get("x-seed-secret");
  const configuredSeedSecret = process.env.SEED_SECRET;
  const isAuthorizedBySecret =
    Boolean(configuredSeedSecret) && providedSeedSecret === configuredSeedSecret;

  // Prevent public abuse of the seed endpoint in production.
  if (isProduction && !isAuthorizedBySecret) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@example.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "admin123";

  // Avoid creating weak default admin credentials in production.
  if (
    isProduction &&
    (adminEmail === "admin@example.com" || adminPassword === "admin123")
  ) {
    return NextResponse.json(
      { message: "Set strong ADMIN_EMAIL and ADMIN_PASSWORD before seeding" },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existing) {
    return NextResponse.json({ message: "Admin already exists" });
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 12);
  await prisma.user.create({
    data: {
      email: adminEmail,
      password: hashedPassword,
      name: "Admin",
    },
  });

  return NextResponse.json({ message: "Admin user created successfully" });
}
