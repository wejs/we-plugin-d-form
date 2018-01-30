/**
 * We.js dynamic forms plugin main file
 *
 * see http://wejs.org/docs/we/plugin
 */
module.exports = function loadPlugin(projectPath, Plugin) {
  const plugin = new Plugin(__dirname);

  plugin.setConfigs({
    permissions: {
      'access_form_unpublished': {
        'title': 'Access unpublished form'
      }
    },
    emailTypes: {
      formNewAnswerAlert: {
        defaultSubject: '[{{siteName}}] Nova resposta no formulário {{formName}}',
        defaultText: `O site {{siteName}} acaba de receber uma nova resposta no formulário {{formTitle}}.

Url de visualização dos dados: {{answerUrl}}

Enviada por:
- Nome: {{name}}
- Email {{email}}


{{siteName}}
{{siteUrl}}`,
        defaultHTML: `<p>O site {{siteName}} acaba de receber uma nova resposta no formul&aacute;rio {{formTitle}}.</p>
<p>Url de visualiza&ccedil;&atilde;o dos dados: {{answerUrl}}</p>
<p>Enviada por:<br />- Nome: {{name}}<br />- Email {{email}}<br /><br /></p>
<p>{{siteName}}<br />{{siteUrl}}</p>`,
        label: 'Email de aviso de nova responta em um dos formulários do sistema',
        templateVariables: {
          formName: {
            example: 'Form1',
            description: 'Nome do formulário preenchido no editar formulário'
          },
          formTitle: {
            example: 'Form 1',
            description: 'Título do formulário'
          },
          name: {
            example: 'Alberto Souza',
            description: 'Nome da pessoa que respondeu o formulário caso um campo com "name" nome exista no formulário'
          },
          email: {
            example: 'contact@linkysysytems.com',
            description: 'Email da pessoa que respondeu o formulário caso um campo com "name" email exista no formulário'
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