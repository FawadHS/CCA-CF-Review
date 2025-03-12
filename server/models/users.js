const fs = require('fs');
const path = require('path');

const usersFilePath = path.join(__dirname, '../data/users.json');

// Function to load users data
function loadUsers() {
  const data = fs.readFileSync(usersFilePath, 'utf-8');
  return JSON.parse(data).users;
}

// Function to add a new user
function addUser(user) {
  const users = loadUsers();
  users.push(user);
  fs.writeFileSync(usersFilePath, JSON.stringify({ users }, null, 2));
}

// Function to find a user by ID
function findUserById(userId) {
  const users = loadUsers();
  return users.find(user => user.id === userId);
}

module.exports = {
  loadUsers,
  addUser,
  findUserById
};
