const fs = require('fs');
const path = require('path');

const countriesFilePath = path.join(__dirname, '../data/countries.json');

// Function to load countries data
function loadCountries() {
  const data = fs.readFileSync(countriesFilePath, 'utf-8');
  return JSON.parse(data).countries;
}

// Function to find a country by name
function findCountryByName(name) {
  const countries = loadCountries();
  return countries.find(country => country.name === name);
}

// Function to add a new country
function addCountry(country) {
  const countries = loadCountries();
  countries.push(country);
  fs.writeFileSync(countriesFilePath, JSON.stringify({ countries }, null, 2));
}

// Function to validate country password
function validateCountryPassword(name, password) {
  const country = findCountryByName(name);
  if (country && country.password === password) {
    return true;
  }
  return false;
}

module.exports = {
  loadCountries,
  findCountryByName,
  addCountry,
  validateCountryPassword
};
