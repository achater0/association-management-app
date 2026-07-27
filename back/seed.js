// seed.js
require('dotenv').config();
const User = require('./models/userModel');

async function seedUsers() {
  try {
    console.log('Seeding test users...');

    // 1. Create a Normal Member (Subscriber)
    const normalMemberId = await User.create({
      name: "Youssef Member",
      email: "member@association.ma",
      password: "password123",
      cin_number: "WB111111",
      phone: "+212611111111",
      role: "Subscriber"
    });
    console.log(`✓ Normal Member created (ID: ${normalMemberId})`);

    // 2. Create a Bureau Member (President)
    const bureauMemberId = await User.create({
      name: "Amine President",
      email: "president@association.ma",
      password: "password123",
      cin_number: "WB222222",
      phone: "+212622222222",
      role: "President"
    });
    console.log(`✓ Bureau Member created (ID: ${bureauMemberId})`);

    console.log('\nAll set! You can now test login with:');
    console.log(' - Member: member@association.ma / password123');
    console.log(' - Bureau: president@association.ma / password123');

    process.exit(0);
  } catch (err) {
    console.error('Seeding error (User might already exist):', err.message);
    process.exit(1);
  }
}

seedUsers();