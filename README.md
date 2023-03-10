# Database Migration Blueprint Example

Storing sensitive data in plain text format in a database poses a significant risk to both users and organizations. In the event of a security breach, this data could be accessed and exploited, potentially resulting in identity theft, financial loss, or other serious consequences. Hackers and malicious actors are constantly on the lookout for vulnerabilities in databases containing sensitive data, making it crucial for developers to take steps to secure this information.

The Basis Theory Database Migration blueprint explores how to perform API-based migration of Personal Identifiable Information (PII) from an existing database into Basis Theory platform.

We also support batch file processing for larger datasets or cases where an API-based migration isn't suitable. If you need help with your migration plan - [please reach out](https://basistheory.com/contact).

## Run this Example

Requirements:
- [Docker Desktop](https://docs.docker.com/desktop/) and [Docker Compose](https://docs.docker.com/compose/);
- [Node.js LTS](https://nodejs.org/);
- [Yarn](https://yarnpkg.com/).

Install dependencies by running:
````shell
yarn install
````

### Create a Private Application

To securely import data via Server-to-Server, you'll need a [Private Application](/docs/api/applications) to grant you an API Key used to authenticate against Basis Theory services. [Click here to create one](https://portal.basistheory.com/applications/create?name=Migration&permissions=token%3Acreate).

This will create an application with the `token:create` permission. Copy the API Key to your `.env` file:

```bash showLineNumbers title=.env
BASIS_THEORY_API_KEY=test_123456789
DATABASE_URL="postgresql://postgres:basistheory!@localhost:5432/postgres?schema=public"
```

> Replace the `test_123456789` value with your recently created API Key.

### Initialize the Database

Start the PostgreSQL docker container by running:

```shell
docker compose up -d
```

And seed the database:

```shell
yarn prisma db seed
```

### Migrate the sensitive data

Run the following command to execute the sensitive data migration:

```shell
yarn start
```

# Key Integration Spots

| File                       | Description                                                                                                                       |
|----------------------------|-----------------------------------------------------------------------------------------------------------------------------------|
| [migrate.ts](./migrate.ts) | Iterates through the `Person` table records using a cursor and tokenizes sensitive data columns `ssn`, `email` and `phoneNumber`. |
