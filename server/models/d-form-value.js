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

      // Class methods for use with: we.db.models.[yourmodel].[method]
      // classMethods: {
      //   // suport to we.js url alias feature
      //   urlAlias(record) {
      //     return {
      //       alias: '/d-form/' + record.id + '-'+  we.utils
      //         .string( record.name )
      //         .slugify().s,
      //       target: '/d-form/' + record.id,
      //     };
      //   }
      // },
      // record method for use with record.[method]
      instanceMethods: {}
    }
  };

  return model;
};
