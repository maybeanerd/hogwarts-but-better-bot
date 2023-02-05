const { Sequelize } = require('sequelize');

module.exports = {
  up: ({ context }) => context.sequelize.transaction(async (transaction) => {
    await context.addColumn(
      'transferredPoints',
      'reason',
      {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'The reason for transferring points.',
      },
      {
        transaction,
      },
    );

    return true;
  }),
  down: ({ context }) => context.sequelize.transaction(async (transaction) => {
    await context.removeColumn('transferredPoints', 'reason', {
      transaction,
    });

    return true;
  }),
};
