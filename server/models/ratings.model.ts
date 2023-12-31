const ratingsModel = (sequelize:any, Sequelize:any) => {
    const Rating = sequelize.define("Rating", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        teamPlay: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        },
        attitude: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        },
        technicalExpertise: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        },
        codingSkills: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        },
        overAllScore: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        },
        weekNum: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        },
        year: {
            type: Sequelize.STRING,
            defaultValue: 0
        },
        createdAt:{
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.fn('NOW'),
        },
        updatedAt:{
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.fn('NOW'),
        },
    },{
        tableName: 'ratings',
    });
    return Rating;
};

export default ratingsModel;


