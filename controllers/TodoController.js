/* eslint-disable linebreak-style */
/* eslint-disable consistent-return */
/* eslint-disable camelcase */
/* eslint-disable linebreak-style */
const knex = require('../database');

module.exports = {
  async index(req, res, next) {
    try {
      const { email, page } = req.query;
      const query = knex('todo')
        .join('users', 'users.id', '=', 'todo.user_id')
        .where({ 'users.deleted_at': null, 'todo.deleted_at': null })
        .orderBy('id')
        .limit(5)
        .offset((page - 1) * 5);

      const countObj = knex('todo')
        .join('users', 'users.id', '=', 'todo.user_id')
        .where({ 'users.deleted_at': null, 'todo.deleted_at': null })
        .count();

      if (email) {
        query.where({ email }).select('todo.*', 'users.name').where('todo.deleted_at', null);

        countObj.where({ email });
      } else {
        query
          .select('todo.*', 'users.name')
          .where({ 'users.deleted_at': null, 'todo.deleted_at': null });

        countObj.where('users.deleted_at', null);
      }

      const [count] = await countObj;

      // res.header('Access-Control-Expose-Headers', '*');
      res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
      res.header('X-Total-Count', count.count);
      res.header('X-Per-Page', 5);

      const results = await query;
      return res.json(results);
    } catch (error) {
      next(error);
    }
  },

  async getTodos(req, res, next) {
    console.log(`GET TODOS FOR USER: ${req.userId}`);
    try {
      const { page } = req.query;
      const query = knex('todo')
        .join('users', 'users.id', '=', 'todo.user_id')
        .select('todo.id', 'todo.desc')
        .where({ 'users.deleted_at': null, 'todo.deleted_at': null, 'users.id': req.userId })
        .orderBy('todo.id')
        .limit(5)
        .offset((page - 1) * 5);

      const countObj = knex('todo')
        .join('users', 'users.id', '=', 'todo.user_id')
        .where({ 'users.deleted_at': null, 'todo.deleted_at': null, 'users.id': req.userId })
        .count();

      const [count] = await countObj;

      // res.header('Access-Control-Expose-Headers', '*');
      res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
      res.header('X-Total-Count', count.count);
      res.header('X-Per-Page', 5);

      console.log('TOTAL COUNT');
      console.log(count.count);

      const results = await query;
      return res.json(results);
    } catch (error) {
      next(error);
    }
  },
  async create(req, res, next) {
    console.log('CREATE');
    try {
      const { desc } = req.body;
      const [returned] = await knex('todo')
        .insert({
          desc,
          user_id: req.userId,
        })
        .returning(['id']);
      const countObj = knex('todo')
        .join('users', 'users.id', '=', 'todo.user_id')
        .where({ 'users.deleted_at': null, 'todo.deleted_at': null, 'users.id': req.userId })
        .count();

      const [count] = await countObj;
      console.log('TOTAL COUNT');
      console.log([returned]);

      // res.header('Access-Control-Expose-Headers', '*');
      res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
      res.header('X-Total-Count', count.count);
      res.header('X-Per-Page', 5);
      return res.status(201).send({
        id: [returned],
        desc,
      });
    } catch (error) {
      next(error);
    }
  },
  async delete(req, res, next) {
    try {
      const { id } = req.body;
      console.log(id);
      // Checar se usuário deletando é o dono
      /* const {user_id} = req.userId
      const query = await knex('todos').where({id, user_id}).update('deleted_at', new Date());
      if(!query[0]){
        return res.status(400).send({ error: 'Todo does not exist' });
      }
      */
      await knex('todo')
        .where({ id })
        // .del();
        .update('deleted_at', new Date());
      console.log('deleted');
      res.send();
    } catch (error) {
      next(error);
    }
  },
  async update(req, res, next) {
    try {
      const { id, desc } = req.body;
      // Checar se usuário deletando é o dono
      /* const {user_id} = req.userId
      const query = await knex('todos').where({id, user_id}).update('deleted_at', new Date());
      if(!query[0]){
        return res.status(400).send({ error: 'Todo does not exist' });
      }
      */
      console.log('UPDATE');
      await knex('todo')
        .update({
          desc,
        })
        .where({ user_id: req.userId, id });
      return res.status(200).send();
    } catch (error) {
      next(error);
    }
  },
};
