require('dotenv').config(); // Load environment variables from .env
const Sequelize = require('sequelize');

// const sequelize = new Sequelize(
//     process.env.DB_NAME,     // Use DB_NAME from .env
//     process.env.DB_USER,     // Use DB_USER from .env
//     process.env.DB_PASSWORD, // Use DB_PASSWORD from .env
//     {
//         dialect: 'mysql',
//         host: process.env.DB_HOST,  // Use DB_HOST from .env (RDS Endpoint)
//         port: process.env.DB_PORT,  // Use DB_PORT from .env (3306 for AWS RDS)
//         logging: false
//     }
// );

// const sequelize = new Sequelize(
//   process.env.DB_NAME,
//   process.env.DB_USER,
//   process.env.DB_PASSWORD,
//   {
//     host: process.env.DB_HOST,
//     port: process.env.DB_PORT,
//     dialect: 'postgres',
//     logging: false
//   }
// );


const sequelize = new Sequelize('narender_t', 'narender_t_user', 'hPPzCWZR3wt3oG66p62EJXBns9JtAU3A', {
  host: 'dpg-d1iilare5dus739teip0-a',
  dialect: 'postgres',
  port: 5432,
  logging: false,
});

module.exports = sequelize;
