/**
 * Dynamic form field model
 */

module.exports = function dynamicFormFieldModel(we) {
  const model = {
    definition: {
      label: {
        type: we.db.Sequelize.STRING,
        allowNull: true
      },
      placeholder: {
        type: we.db.Sequelize.STRING,
        allowNull: true
      },
      help: {
        type: we.db.Sequelize.TEXT,
        allowNull: true
      },
      type: {
        type: we.db.Sequelize.STRING,
        allowNull: true
      },
      defaultValue: {
        type: we.db.Sequelize.STRING,
        allowNull: true
      },
      allowNull: {
        type: we.db.Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: true
      },
      weight: {
        type: we.db.Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      validate: {
        type: we.db.Sequelize.TEXT,
        skipSanitizer: true,
        get()  {
          if (this.getDataValue('validate'))
            return JSON.parse( this.getDataValue('validate') );
          return {};
        },
        set(object) {
          if (typeof object == 'object') {
            this.setDataValue('validate', JSON.stringify(object));
          } else {
            throw new Error('invalid error validate value: ', object);
          }
        }
      },
      fieldOptions:{
        type: we.db.Sequelize.TEXT,
        skipSanitizer: true,
        get()  {
          if (this.getDataValue('fieldOptions'))
            return JSON.parse( this.getDataValue('fieldOptions') );
          return {};
        },
        set(object) {
          if (typeof object == 'object') {
            this.setDataValue('fieldOptions', JSON.stringify(object));
          } else {
            throw new Error('invalid error fieldOptions value: ', object);
          }
        }
      },
      formFieldAttributes: {
        type: we.db.Sequelize.TEXT,
        skipSanitizer: true,
        get()  {
          if (this.getDataValue('formFieldAttributes'))
            return JSON.parse( this.getDataValue('formFieldAttributes') );
          return {};
        },
        set(object) {
          if (typeof object == 'object') {
            this.setDataValue('formFieldAttributes', JSON.stringify(object));
          } else {
            throw new Error('invalid error in widget formFieldAttributes value: ', object);
          }
        }
      }
    },
    associations: {
      fields: {
        type: 'hasMany',
        model: 'd-form-field',
        inverse: 'group',
        foreignKey: 'groupId'
      },
      group: {
        type: 'belongsTo',
        model: 'd-form-field',
        inverse: 'fields'
      },
      form: {
        type: 'belongsTo',
        model: 'd-form',
        inverse: 'fields'
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
