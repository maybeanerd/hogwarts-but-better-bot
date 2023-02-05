const { Sequelize } = require('sequelize');

module.exports = {
  up: ({ context }) => context.sequelize.transaction(async (transaction) => {
    await context.createTable(
      'transferredPoints',
      {
        id: {
          type: Sequelize.BIGINT,
          primaryKey: true,
          autoIncrement: true,
        },
        giver_id: {
          type: Sequelize.BIGINT,
          allowNull: false,
          comment: 'id of discord user that gave/took points.',
        },
        receiver_id: {
          type: Sequelize.BIGINT,
          allowNull: false,
          comment: 'id of discord user that got/lost points.',
        },
        amount: {
          type: Sequelize.INTEGER,
          allowNull: false,
          comment: 'Amount of points.',
        },
        date: {
          type: Sequelize.DATE,
          allowNull: false,
          comment: 'date.',
        },
        house: {
          type: Sequelize.INTEGER, // refers to enum hogwartsHouse
          allowNull: false,
          comment: 'Hogwarts house the receiver was part of.',
        },
        season: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 1,
          comment: 'House Cup season this occurred in.',
        },
      },
      {
        transaction,
      },
    );

    return true;
  }),
  down: ({ context }) => context.sequelize.transaction(async (transaction) => {
    await context.dropTable('transferredPoints', {
      transaction,
    });

    return true;
  }),
};
