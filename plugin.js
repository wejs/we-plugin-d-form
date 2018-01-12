/**
 * We.js dynamic forms plugin main file
 *
 * see http://wejs.org/docs/we/plugin
 */
module.exports = function loadPlugin(projectPath, Plugin) {
  const plugin = new Plugin(__dirname);

  plugin.setConfigs({
    emailTypes: {
      formNewAnswerAlert: {
        label: 'Email de aviso de nova responta em um dos formulários do sistema',
        templateVariables: {
          name: {
            example: 'Alberto Souza',
            description: 'Nome da pessoa que respondeu o formulário'
          },
          email: {
            example: 'contact@linkysysytems.com',
            description: 'Email da pessoa que respondeu o formulário'
          },
          answerUrl: {
            example: '/admin/#/d-form-answer/1',
            description: 'URL para accesso aos dados da responta'
          },
          siteName: {
            example: 'Site Name',
            description: 'Nome deste site'
          },
          siteUrl: {
            example: '/#example',
            description: 'Endereço deste site'
          }
        }
      }
    }
  });

  plugin.setRoutes({
    'get /d-form-answer-export.csv': {
      controller: 'd-form-answer',
      action: 'exportRegistration',
      responseType: 'csv'
    },
    'post /d-form/:id': {
      controller: 'd-form',
      action: 'saveAnswer',
      model: 'd-form',
      template: 'd-form/findOne'
    }
  });

  plugin.setResource({ name: 'd-form' });
  plugin.setResource({ name: 'd-form-field' });
  plugin.setResource({ name: 'd-form-answer' });

  return plugin;
};