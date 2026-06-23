import { createServer } from './server';

async function start() {
  try {
    const server = await createServer();
    process.on('unhandledRejection', (err) => {
      console.error(err);
      process.exit(1);
    });

    const port = parseInt(String(process.env.API_PORT || '3000'), 10);
    const host = process.env.API_HOST || '0.0.0.0';
    await server.listen({ host, port }).then(() => {
      console.log(`Server listening at http://${host}:${port}`);
    });

    for (const signal of ['SIGINT', 'SIGTERM']) {
      process.on(signal, () =>
        server.close().then((err) => {
          console.log(`close application on ${signal}`);
          process.exit(err ? 1 : 0);
        })
      );
    }
  } catch (err) {
    console.log(err);
  }
}

start().catch((err) => console.log(err));
