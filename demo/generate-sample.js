const { faker } = require('@faker-js/faker')
const fs = require('fs')

const sample = []

for (let i = 0; i < 1000; i++) {
    sample.push({
        Name: faker.name.findName(),
        Age: Math.floor(Math.random() * (90 - 5 + 1) + 5),
        Address: {
            Street: faker.address.streetName(),
            ZipCode: faker.address.zipCode().slice(0,5),
            City: faker.address.cityName()
        }
    })
}

fs.writeFileSync('sample.json', JSON.stringify(sample), 'utf8');
