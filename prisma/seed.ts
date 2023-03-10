import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

async function main() {
  const records = await prisma.person.createMany({
    data: Array.apply(null, Array(100)).map((_, i) => ({
      id: i + 1,
      ssn: faker.helpers.regexpStyleStringParse(
        "[0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9][0-9][0-9]"
      ),
      email: faker.internet.email().toLowerCase(),
      name: faker.name.fullName(),
      phoneNumber: faker.phone.number("###-###-###"),
      birthDate: faker.date.birthdate().toISOString(),
    })),
  });
  console.log(`${records.count} "Person" records created successfully.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
