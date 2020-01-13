/**
 * Dynamic form Value model
 */

module.exports = function dynamicFormValueModel(we) {
  const model = {
    definition: {
      name: {
        type: we.db.Sequelize.TEXT
      },
      value: {
        type: we.db.Sequelize.TEXT
      },
      fieldRender: {
        type: we.db.Sequelize.STRING('100'),
        allowNull: true,
        defaultValue: null
      },
      resolvedValue: {
        type: we.db.Sequelize.TEXT
      }
    },
    associations: {
      field: {
        type: 'belongsTo',
        model: 'd-form-field'
      },
      answer: {
        type: 'belongsTo',
        model: 'd-form-answer',
        inverse: 'values'
      }
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
