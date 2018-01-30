module.exports = {
  /**
   * Default find action
   *
   * @param  {Object} req express.js request
   * @param  {Object} res express.js response
   */
  find(req, res) {
    // if (!res.locals.query.include)
    //   res.locals.query.include = [];

    // res.locals.query.include.push({
    //   model: req.we.db.models['d-form-value'],
    //   as: 'values',
    //   required: false
    // });

    // console.log('<>', res.locals.query);

    return res.locals.Model
    .findAll(res.locals.query)
    .then( (records)=> {
      // get count
      return res.locals.Model
      .count(res.locals.query)
      .then( (count)=> {
        res.locals.metadata.count = count;
        return records;
      });
    })
    .then( (records)=> {
      // TODO improve this subqueryes:
      const querys = [];
      records.forEach( (r)=> {
        req.we.db.models['d-form-value']
        .findAll({
          where: {
            answerId: r.id
          }
        })
        .then( (values)=> {
          r.values = values;
          return null;
        });
      });

      return Promise
      .all(querys)
      .then( ()=> {
        return records;
      });
    })
    .then(function afterFindAndCount (records) {
      res.locals.data = records;

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

    // check if can access contents unpublished
    if (!res.locals.data.published) {
      if (!req.we.acl.canStatic('access_form_unpublished', req.userRoleNames)) {
        return res.forbidden();
      }
    }

    req.we.db.models['d-form-value']
    .findAll({
      where: {
        answerId: res.locals.data.id
      }
    })
    .then( (values)=> {
      res.locals.data.values = values;
      // by default record is preloaded in context load
      res.ok();
      return null;
    })
    .catch(res.queryError);
  },
  /**
   * Create and create page actions
   *
   * @param  {Object} req express.js request
   * @param  {Object} res express.js response
   */
  create(req, res) {
    const _ = req.we.utils._;

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

      _.merge(res.locals.data, req.body);

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

      record.updateAttributes(req.body)
      .then(function reloadAssocs(n) {
        return n.reload()
        .then(function() {
          return n;
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

  /**
   * Export event registration list
   */
  exportRegistration(req, res) {
    const we = req.we;

    if (!we.plugins['we-plugin-csv']) {
      return res.serverError('we-plugin-d-form:we-plugin-csv plugin is required for export registrations');
    }

    if (!req.query.formId || !Number(req.query.formId)) {
      return res.serverError('we-plugin-d-form formId query param is required');
    }

    we.db.models['d-form-field']
    .findAll({
      where: { formId: req.query.formId },
      order: [['weight', 'ASC']]
    })
    .then( (fields)=> {
      const fieldsById = {};
      for (let i = 0; i < fields.length; i++) {
        fieldsById[ fields[i].id ] = fields[i];
      }

      return we.db.models['d-form-answer']
      .findAll({
        where: {
          formId: req.query.formId
        },
        include: [{
          model: we.db.models['d-form-value'],
          as: 'values'
        }],
        limit: 10000
      })
      .then( (answers)=> {
        let CSVR = { id: 'ID' };

        res.locals.csvResponseColumns = CSVR;

        let parsedAnswers = [];

        for (let i = 0; i < answers.length; i++) {
          let answer = answers[i];

          let pa = {};
          pa.id = answer.id;
          let values = answer.values;

          for (let j = 0; j < values.length; j++) {
            let value = values[j];
            if (!value.fieldId) continue;
            let field = fieldsById[ value.fieldId ];
            const label = field.label || value.name;
            pa[ label ] = value.value;

            if ( !CSVR[ label ] ) {
              CSVR[ label ] = label;
            }
          }

          parsedAnswers.push(pa);
        }

        res.locals.data = parsedAnswers;

        res.ok();
      });
    })
    .catch(res.queryError);
  }
};

