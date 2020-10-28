import Sequelize from 'sequelize';
import transferredPointsModel from './transferredPoints';

const dbPw = process.env.DATABASE_PW;
if (!dbPw) {
  throw new Error('Missing DB URL');
}

const sequelizeOptions = {
  dialect: 'mysql' as 'mysql', // To make sequelizes type check shut up, as string is not a compatible type to the string literals we can choose from
  logging: false && Boolean(process.env.NODE_ENV === 'development'),
  define: {
    // do not automatically add timestamps, this only helps when using sequelize to write/read
    timestamps: false,
    freezeTableName: true, // do not add "s" to all table names
  },
  schema: 'public',
  host: 'localhost',
};

export const sequelize = new Sequelize.Sequelize(
  'h31nd5_hogwarts-but-better-bot',
  'h31nd5',
  dbPw,
  sequelizeOptions,
);

export const transferredPoints = transferredPointsModel(sequelize, Sequelize);
