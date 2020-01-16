/**
 * Dynamic form model
 */

module.exports = function dynamicFormModel(we) {
  const model = {
    definition: {
      name: {
        type: we.db.Sequelize.STRING,
        allowNull: false
      },
      title: {
        type: we.db.Sequelize.STRING(1200),
        size: 1200,
        allowNull: true
      },
      subject: {
        type: we.db.Sequelize.TEXT,
        allowNull: true
      },
      formName: {
        type: we.db.Sequelize.STRING,
        allowNull: true
      },
      replyTo: {
        type: we.db.Sequelize.TEXT,
        allowNull: true,
        skipSanitizer: true
      },
      to: {
        type: we.db.Sequelize.TEXT,
        allowNull: true,
        skipSanitizer: true
      },
      type: {
        type: we.db.Sequelize.STRING,
        allowNull: true
      },
      published: {
        type: we.db.Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: true
      },
      publishedAt: {
        type: we.db.Sequelize.DATE,
        allowNull: true
      },
      setAlias: {
        type: we.db.Sequelize.VIRTUAL
      },
      redirectToOnSuccess: {
        type: we.db.Sequelize.TEXT,
        allowNull: true
      }
    },
    associations: {
      creator: {
        type: 'belongsTo',
        model: 'user'
      },
      fields: {
        type: 'hasMany',
        model: 'd-form-field',
        inverse: 'form',
        foreignKey: 'formId'
      },
      answers: {
        type: 'hasMany',
        model: 'd-form-answer',
        inverse: 'form',
        foreignKey: 'formId'
      }
    },
    options: {
      // title field, for default title record pages
      titleField: 'title',
      // Class methods for use with: we.db.models.[yourmodel].[method]
      classMethods: {
        // suport to we.js url alias feature
        urlAlias(record) {
          let slugPart2 = we.utils.slugifyAndTruncate (record.name, 30, '');
          return {
            alias: '/d-form/' + record.id + '-' + slugPart2,
            target: '/d-form/' + record.id,
          };
        }
      },
      // record method for use with record.[method]
      instanceMethods: {}
    }
  };

  return model;
};
