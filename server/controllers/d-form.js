module.exports = {
  /**
   * Default find action
   *
   * @param  {Object} req express.js request
   * @param  {Object} res express.js response
   */
  find(req, res) {
    return res.locals.Model
    .findAndCountAll(res.locals.query)
    .then(function afterFindAndCount (record) {
      res.locals.metadata.count = record.count;
      res.locals.data = record.rows;
      res.ok();
      return null;
    })
    .catch(res.queryError);
  },

  /**
   * Default count action
   *
   * Built for only send count as JSON
   *
   * @param  {Object} req express.js request
   * @param  {Object} res express.js response
   */
  count(req, res) {
    return res.locals.Model
    .count(res.locals.query)
    .then( (count)=> {
      res.status(200).send({ count: count });
      return null;
    })
    .catch(res.queryError);
  },
  /**
   * Default findOne action
   *
   * Record is preloaded in context loader by default and is avaible as res.locals.data
   *
   * @param  {Object} req express.js request
   * @param  {Object} res express.js response
   */
  findOne(req, res, next) {
    if (!res.locals.data) {
      return next();
    }

    res.locals.data
    .getFields({
      order: [
        ['weight', 'ASC']
      ]
    })
    .then( (fields)=> {
      res.locals.data.fields = fields;
      return res.locals.data;
    })
    .then( ()=> {
      return res.ok();
    });
  },
  /**
   * Create and create page actions
   *
   * @param  {Object} req express.js request
   * @param  {Object} res express.js response
   */
  create(req, res) {
    if (!res.locals.template) {
      res.locals.template = res.locals.model + '/' + 'create';
    }

    if (!res.locals.data) {
      res.locals.data = {};
    }

    if (req.method === 'POST') {
      if (req.isAuthenticated && req.isAuthenticated()) {
        req.body.creatorId = req.user.id;
      }

      req.we.utils._.merge(res.locals.data, req.body);

      return res.locals.Model
      .create(req.body)
      .then(function afterCreate (record) {
        res.locals.data = record;
        res.created();
        return null;
      })
      .catch(res.queryError);
    } else {
      res.ok();
    }
  },
  saveAnswer(req, res) {
    const Model = req.we.db.models['d-form'];
    res.locals.Model = Model;
    res.locals.loadCurrentRecord = true;
    res.locals.id = req.params.id;

    Model.contextLoader(req, res, (err)=> {
      if (err) return res.queryError(err);

      if (req.method != 'POST') {
        return res.goTo(req.url);
      }

      if (!res.locals.data) {
        return res.goTo(req.url);
      }

      req.body.ip = req.ip;
      // TODO1 add anti spam code here!

      delete req.body.ip;
      delete req.body['g-recaptcha-response'];

      let creatorId;
      if (req.isAuthenticated()) {
        creatorId = req.user.id;
      }

      req.we.db.models['d-form-answer']
      .createAndSaveValues(req.body, res.locals.id, creatorId)
      .then( (answer)=> {
        res.locals.successMessage = 'Dados enviados com sucesso.';
        res.addMessage('success', 'Dados enviados com sucesso');

        answer.sendEmails(req, res, ()=> {
          // successs
          if (res.locals.data.redirectToOnSuccess) {
            res.goTo(res.locals.data.redirectToOnSuccess);
          } else {
            res.goTo('/d-form/'+res.locals.data.id);
          }

          return null;
        });

      })
      .catch(res.queryError);
    });
  },
  /**
   * Edit, edit page and update action
   *
   * Record is preloaded in context loader by default and is avaible as res.locals.data
   *
   * @param  {Object} req express.js request
   * @param  {Object} res express.js response
   */
  edit(req, res) {
    if (!res.locals.template) {
      res.locals.template = res.local.model + '/' + 'edit';
    }

    let record = res.locals.data;

    if (req.we.config.updateMethods.indexOf(req.method) >-1) {
      if (!record) {
        return res.notFound();
      }

      record.update(req.body)
      .then(function reloadAssocs(n) {
        return n.reload()
        .then(function() {
          return record.getFields()
          .then( (fields)=> {
            record.fields = fields;
            return n;
          });
        });
      })
      .then(function afterUpdate (newRecord) {
        res.locals.data = newRecord;
        res.updated();
        return null;
      })
      .catch(res.queryError);
    } else {
      res.ok();
    }
  },
  /**
   * Delete and delete action
   *
   * @param  {Object} req express.js request
   * @param  {Object} res express.js response
   */
  delete(req, res) {
    if (!res.locals.template) {
      res.locals.template = res.local.model + '/' + 'delete';
    }

    let record = res.locals.data;

    if (!record) {
      return res.notFound();
    }

    res.locals.deleteMsg = res.locals.model + '.delete.confirm.msg';

    if (req.method === 'POST' || req.method === 'DELETE') {
      record
      .destroy()
      .then(function afterDestroy () {
        res.locals.deleted = true;
        res.deleted();
        return null;
      })
      .catch(res.queryError);
    } else {
      res.ok();
    }
  },
  // form(req, res) {
  //   const we = req.we;

  //   // console.log('req.body>', req.body);

  //   res.locals.data = req.body;

  //   const form = we.form.forms.ev1;

  //   // console.log('form>', form);

  //   if (req.method === 'POST') {
  //     req.body.ip = req.ip;

  // //    req.we.antiSpam.recaptcha.verify(req, res, function afterCheckSpam(err, isSpam) {
  //   //    if (err) return res.queryError(err);

  //       // if (isSpam) {
  //       //   req.we.log.warn('cfmessage.create: spambot found in recaptcha verify: ', req.ip, req.body.email);

  //       //   res.addMessage('warning', {
  //       //     text: 'auth.register.spam',
  //       //     vars: { email: req.body.email }
  //       //   });
  //       //   return res.badRequest();
  //       // }

  //       // console.log('we-form', we.form);
  //       // we.form.validateData(form, req.body, (err, validationErrors)=> {
  //         // we.log.warn('<>', err, validationErrors);

  //         // if (err) {
  //         //   // error that dont are from validation:
  //         //   res.serverError(err);
  //         //   return null;
  //         // }

  //         // if (validationErrors) {
  //         //   res.locals.validationErrors = validationErrors;
  //         //   res.badRequest();
  //         //   return null;
  //         // }

  //         // valid ...
  //         req.we.db.models['d-form-answer']
  //         .createAndSaveValues(req.body)
  //         .then( (answer)=> {
  //           res.locals.successMessage = 'Dados enviados com sucesso.';

  //           res.addMessage('success', 'Dados enviados com sucesso');

  //           answer.sendEmails(req, res, ()=> {
  //             // successs

  //             res.goTo('/content/22');
  //             // res.ok();
  //             return null;
  //           });

  //         })
  //         .catch(res.queryError);
  //       // });
  //     // });
  //   }  else {
  //     res.ok();
  //   }

  // }
};