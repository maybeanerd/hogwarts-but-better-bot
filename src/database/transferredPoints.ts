import seq from 'sequelize';
import { hogwartsHouse } from '../types/enums';

export default (sequelize: seq.Sequelize, Sequelize: typeof seq) => {
  class transferredPoints extends seq.Model {
    public id!: string;

    public giver_id!: string;

    public receiver_id!: string;

    public amount!: number;

    public date!: Date;

    public house!: hogwartsHouse;

    public season!: number;

    public reason!: string | null;
  }
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
      reason: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'The reason for transferring points.',
      },
    },
    { sequelize },
  );
  return transferredPoints;
};
