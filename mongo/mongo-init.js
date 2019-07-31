db.auth(process.env.MONGO_ROOT_USERNAME, process.env.MONGO_ROOT_PASSWORD);

db = db.getSiblingDB('kado-bot');

db.createUser({
  user: 'kado',
  pwd: process.env.MONGO_DB_PASSWORD,
  roles: [
    {
      role: 'root',
      db: 'admin'
    }
  ]
});
