async function listByExpert() {
  return [];
}
async function create() {
  throw new Error("AWS adapter not implemented");
}
async function deleteById() {
  return false;
}
async function countActiveByExpert() {
  return 0;
}
module.exports = { listByExpert, create, deleteById, countActiveByExpert };
