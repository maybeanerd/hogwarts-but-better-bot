module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.addColumn(
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
  down: (queryInterface /* , Sequelize */) => queryInterface.sequelize.transaction(
    async (transaction) => {
      await queryInterface.removeColumn('transferredPoints', 'reason', {
        transaction,
      });

      return true;
    },
  ),
};
