const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const IncidentImage = sequelize.define('IncidentImage', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    incident_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    image_url: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
  }, {
    tableName: 'incident_images',
  });

  return IncidentImage;
};
