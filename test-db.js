const { PrismaClient } = require('./lib/generated/prisma/client');
const prisma = new PrismaClient();

async function run() {
  const messages = await prisma.chatMessage.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.log(messages);
}
run().catch(console.error).finally(() => prisma.$disconnect());
