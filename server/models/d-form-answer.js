/**
 * Dynamic form answer model
 */

module.exports = function dynamicFormAnswerModel(we) {
  const model = {
    definition: {
      name: {
        type: we.db.Sequelize.VIRTUAL,
        get() {
          return this.getDFieldValue('name');
        }
      },
      email: {
        type: we.db.Sequelize.VIRTUAL,
        get() {
          return this.getDFieldValue('email');
        }
      },
      vCache: {
        type: we.db.Sequelize.VIRTUAL,
        get() {
          return this.values;
        }
      }
    },
    associations: {
      creator: {
        type: 'belongsTo',
        model: 'user'
      },
      values: {
        type: 'hasMany',
        model: 'd-form-value',
        inverse: 'answer',
        foreignKey: 'answerId'
      },
      form: {
        type: 'belongsTo',
        model: 'd-form',
        inverse: 'answers'
      }
    },
    options: {
      // title field, for default title record pages
      titleField: 'id',
      enableAlias: false,

      // Class methods for use with: we.db.models.[yourmodel].[method]
      classMethods: {
        createAndSaveValues(data, formId, creatorId) {
          return new Promise( (resolve, reject)=> {
            we.db.models['d-form-answer']
            .create({
              creatorId: creatorId,
              formId: formId
            })
            .then( (answer)=> {
              let saves = [];

              for (let name in data) {
                if (
                  name.indexOf('d-form-') == -1 ||
                  name.indexOf('fd_') == -1
                ) {
                  continue; // not is an d-form-field
                }

                let nameParts = name.split('_fd_');

                if (nameParts.length != 2) continue;

                let formId = Number(nameParts[0].replace('d-form-', ''));
                let fieldId = Number(nameParts[1]);

                if (!formId || !fieldId) continue;
                if (!answer.formId) answer.formId = formId;

                saves.push({
                  name: name,
                  value: String(data[name]),
                  answerId: answer.id,
                  fieldId: fieldId
                });
              }

              return we.db.models['d-form-value']
              .bulkCreate(saves)
              .spread(()=> {
                return we.db.models['d-form-answer']
                .findOne({
                  where: { id: answer.id },
                  include: [{
                    model: we.db.models['d-form-value'],
                    as: 'values'
                  }]
                })
                .then( (r)=> {
                  return answer.save()
                    .then( ()=>{ return r; });
                })
                .then( (r)=> {
                  resolve(r);
                  return null;
                });
              })
              .catch(reject);
            })
            .catch(reject);
          });
        }
      },
      // record method for use with record.[method]
      instanceMethods: {
        getDFieldValue(fieldName) {
          const dValues = this.values;
          if (!dValues) return null;
          for (var i = 0; i < dValues.length; i++) {
            if (dValues[i].name === fieldName) {
              return dValues[i].value;
            }
          }
        },
        sendEmails(req, res, next) {
          const record = this;
          const form = res.locals.data;

          let appName = we.config.appName;

          if (we.systemSettings && we.systemSettings.siteName) {
            appName = we.systemSettings.siteName;
          }

          const userEmail = record.getDFieldValue('email');
          const userName = record.getDFieldValue('name');

          const templateVariables = {
            name: userName,
            email: userEmail,
            formName: form.name,
            formTitle: form.title,
            phone: (
              record.getDFieldValue('cellPhone') ||
              record.getDFieldValue('phone')
            ),
            answerUrl: we.config.hostname+'/admin/#/d-form-answers/'+record.id,
            siteName: appName,
            siteUrl: we.config.hostname
          };

          // default to reply to institucional
          let emailContact = we.config.email.mailOptions.from;

          if (we.systemSettings && we.systemSettings.emailContact) {
            emailContact = we.systemSettings.emailContact;
          }

          emailContact = form.to;

          we.email.sendEmail('formNewAnswerAlert', {
            to: (form.to || null),
            replyTo: (form.replyTo || null),
          }, templateVariables, (err)=> {
            if (err) {
              we.log.error('formNewAnswerAlert:create:sendEmail:', err);
            }
          });

          next();
        }
      }
    }
  };

  return model;
};
