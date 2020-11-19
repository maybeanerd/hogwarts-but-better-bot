import Sequelize from 'sequelize';
import { productionMode } from '../shared_assets';
import transferredPointsModel from './transferredPoints';

const {
  DB_PW, DB_URL, DB_USERNAME, DB_PORT, DB_NAME,
} = process.env;

if (!DB_PW) {
  throw new Error('Missing DB credentials');
}

const sequelizeOptions = {
  dialect: 'mysql' as 'mysql', // To make sequelizes type check shut up, as string is not a compatible type to the string literals we can choose from
  logging: false && !productionMode,
  define: {
    // do not automatically add timestamps, this only helps when using sequelize to write/read
    timestamps: false,
    freezeTableName: true, // do not add "s" to all table names
  },
  host: DB_URL || 'localhost',
  port: DB_PORT ? Number(DB_PORT) : 3306,
};

export const sequelize = new Sequelize.Sequelize(
  DB_NAME || 'h31nd5_hogwarts-but-better-bot',
  DB_USERNAME || 'h31nd5',
  DB_PW,
  sequelizeOptions,
);

export const transferredPoints = transferredPointsModel(sequelize!, Sequelize);
