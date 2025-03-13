module.exports = async function teardown() {
  await global.redis.stop();
  await global.db.stop();
};
