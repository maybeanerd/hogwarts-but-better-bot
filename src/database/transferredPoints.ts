import seq from 'sequelize';

export default (sequelize: seq.Sequelize, Sequelize: typeof seq) => {
  class transferredPoints extends Sequelize.Model {}
  transferredPoints.init(
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
    { sequelize },
  );
  return transferredPoints;
};
