/**
 * Dynamic form group model
 */

module.exports = function dynamicFormGroupModel(we) {
  const model = {
    definition: {
      title: {
        type: we.db.Sequelize.STRING,
        size: 1200,
        allowNull: true
      },
      type: {
        type: we.db.Sequelize.STRING,
        allowNull: true
      },
      description: {
        type: we.db.Sequelize.TEXT,
        allowNull: true
      },
      weight: {
        type: we.db.Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      }
    },
    associations: {
      // form: {
      //   type: 'belongsTo',
      //   model: 'd-form',
      //   inverse: 'groups'
      // },
      // fields: {
      //   type: 'hasMany',
      //   model: 'd-form-field',
      //   inverse: 'group'
      // }
    },
    options: {
      // title field, for default title record pages
      titleField: 'id',
      enableAlias: false,
      // record method for use with record.[method]
      instanceMethods: {}
    }
  };

  return model;
};
