/**
 * Render we.js d-form
 *
 * usage: {{{d-form formRecord data validationError}}}
 */

module.exports = function(we) {
  /**
   * Form json helper
   * @param  {String} formName Form name, ex: user
   * @param  {Object} values    Ex: record object from sequelize result
   * @param  {Object} errors    res.locals.validationError variable
   * @return {String}           html
   */
  return function renderFormHelper (form, values, errors) {
    if (!form || !form.id) {
      we.log.warn('form is required for d-form helper.');
      return '';
    }

    let options = arguments[arguments.length-1];
    if (!errors) errors = {};

    let formId = 'd-form-'+form.id;
    let formName = form.id;
    if (!values) values = {};

    let theme = options.data.root.theme;
    if (!theme) theme = we.view.themes[we.view.appTheme];

    let html = '';
    let fields = '<div class="we-form-fields">';

    // form fields
    let attrs = form.fields;

    for (let i = 0; i < attrs.length; i++) {
      let attr = attrs[i];
      let attrName = formId+'_fd_'+attr.id;
      if (!attr) continue;// skip if this attr is null

      let formFieldAttributes = attr.formFieldAttributes;

      formFieldAttributes.label = attr.label;
      formFieldAttributes.placeholder = attr.placeholder;
      formFieldAttributes.help = attr.help;

      attr.formFieldAttributes = formFieldAttributes;

      fields += we.form.renderField (
        attrName,
        attr,
        attrs,
        values,
        errors,
        theme,
        options.data.root,
        formId,
        formName
      );
    }

    // recaptcha field:

    fields += we.form.renderField (
      'recaptcha',
      { 'type': 'recaptcha' },
      attrs,
      values,
      errors,
      theme,
      options.data.root,
      formId,
      formName
    );

    // close we.js form fields
    fields += '</div>';

    // action fields
    const ac = {
      submit: {
        type: 'submit',
        defaultValue: 'save',
        formFieldAttributes: {
          label: 'Enviar'
        }
      }
    };

    fields += '<div class="we-form-actions">';
    for (let attrName in ac) {
      let attr = ac[attrName];
      fields += we.form.renderField (
        attrName, attr, ac, values, errors, theme, options.data.root, formId, formName
      );
    }
    // close we.js form actions
    fields += '</div>';

    fields += we.form.renderRedirectField(options.data.root);

    if (!form.method) form.method = 'POST';

    html += we.view.renderTemplate('forms/form', theme, {
      formId: formId,
      formName: formName,
      form: form,
      action: options.hash.action || options.data.root.req.url || null,
      fields: fields,
      context: this,
       __: this.__ ,
      controllAttrs: '',
      locals: options.data.root,
      uuid: formId
    });

    return new we.hbs.SafeString(html);
  };
};
