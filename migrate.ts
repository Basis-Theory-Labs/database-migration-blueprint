import { PrismaClient, Person } from "@prisma/client";
import { BasisTheory } from "@basis-theory/basis-theory-js";

const prisma = new PrismaClient();

const chunkSize = 10;

async function iteratePersonTable(cursor?: number): Promise<Person[]> {
  return prisma.person.findMany({
    take: chunkSize,
    orderBy: {
      id: "asc",
    },
    ...(cursor
      ? {
          skip: 1,
          cursor: {
            id: cursor,
          },
        }
      : {}),
  });
}

function createSsnTokenPayload(data: string) {
  return {
    type: "social_security_number",
    id: "{{ data | alias_preserve_format }}",
    data,
    containers: ["/pii/high/"],
    privacy: {
      classification: "pii",
      impact_level: "high",
      restriction_policy: "mask",
    },
  };
}

function createEmailTokenPayload(data: string) {
  return {
    type: "token",
    id: '{{ data | split: "@" | first | alias_preserve_length }}@{{ data | split: "@" | last }}',
    data,
    mask: '{{ data | slice: 0 }}XXXXX@{{ data | split: "@" | last }}',
    containers: ["/pii/high/"],
    privacy: {
      classification: "pii",
      impact_level: "high",
      restriction_policy: "mask",
    },
  };
}

function createPhoneNumberTokenPayload(data: string) {
  return {
    type: "token",
    id: "{{ data | alias_preserve_format }}",
    data,
    mask: "{{ data | reveal_last: 3 }}",
    containers: ["/pii/high/"],
    privacy: {
      classification: "pii",
      impact_level: "high",
      restriction_policy: "mask",
    },
  };
}

async function migrate() {
  process.stdout.write("Starting migration...\n");
  const bt = await new BasisTheory().init(process.env.BASIS_THEORY_API_KEY);

  let cursor = undefined;

  do {
    const chunk: Person[] = await iteratePersonTable(cursor);
    cursor = chunk[chunkSize - 1]?.id;
    if (chunk.length > 0) {
      process.stdout.write(
        `Tokenizing ${chunk.length} records from ${chunk[0].id} to ${
          chunk[chunk.length - 1].id
        }... `
      );

      const tokens = await bt.tokenize(
        chunk.map((p) => ({
          ssn: createSsnTokenPayload(p.ssn),
          email: createEmailTokenPayload(p.email),
          phoneNumber: createPhoneNumberTokenPayload(p.phoneNumber),
        }))
      );

      process.stdout.write(`Done.\nUpdating DB... `);

      const updates = chunk.map((person, i) => {
        const token = (tokens as any[])[i];

        return prisma.person.update({
          where: {
            id: person.id,
          },
          data: {
            ssn: token.ssn.id,
            email: token.email.id,
            phoneNumber: token.phoneNumber.id,
          },
        });
      });

      await Promise.all(updates);
      process.stdout.write(`Done.\n`);
    }
  } while (cursor !== undefined);
}

migrate()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e: any) => {
    console.error(e?.data?.errors || e);
    await prisma.$disconnect();
    process.exit(1);
  });
