import { prisma } from "@/lib/prisma";

export type JsonRecord = Record<string, unknown>;

function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL);
}

export async function getSettingValue<T>(key: string, fallback: T): Promise<T> {
  if (!hasDatabaseUrl()) {
    return fallback;
  }

  try {
    const setting = await prisma.setting.findUnique({
      where: { key },
      select: { value: true },
    });

    if (!setting) {
      return fallback;
    }

    return setting.value as T;
  } catch {
    return fallback;
  }
}

export async function getSettingsByKeys(keys: string[]) {
  if (!hasDatabaseUrl()) {
    return new Map<string, unknown>();
  }

  try {
    const rows = await prisma.setting.findMany({
      where: { key: { in: keys } },
      select: { key: true, value: true },
    });

    const map = new Map<string, unknown>();
    for (const row of rows) {
      map.set(row.key, row.value);
    }

    return map;
  } catch {
    return new Map<string, unknown>();
  }
}

export async function upsertSettingValue(key: string, value: unknown, description?: string) {
  return prisma.setting.upsert({
    where: { key },
    update: {
      value: value as never,
      description,
    },
    create: {
      key,
      value: value as never,
      description,
    },
  });
}
