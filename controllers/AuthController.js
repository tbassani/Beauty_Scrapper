/* eslint-disable consistent-return */
/* eslint-disable camelcase */
/* eslint-disable linebreak-style */
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const mailer = require('../modules/mailer');

const knex = require('../database');
const authConfig = require('../config/auth');

function generateToken(params = {}) {
  return jwt.sign(params, authConfig.secret, {
    expiresIn: 60 * 60 * 1000,
  });
}

function generateRefreshToken(params = {}) {
  return jwt.sign(params, authConfig.refresh_secret, {
    expiresIn: 60 * 60 * 24 * 1000,
  });
}

module.exports = {
  async authenticate(req, res, next) {
    try {
      const { email, password } = req.body;

      const user = await knex
        .column('id', 'email', 'password')
        .select()
        .from('users')
        .where({ email });
      if (!user[0]) {
        return res.status(400).send({ error: 'User not found' });
      }

      if (!(await bcrypt.compare(password, user[0].password))) {
        return res.status(400).send({ error: 'Invalid password' });
      }
      user[0].password = undefined;
      console.log(req.cookies.jid);
      if (!req.cookies.jid) {
        console.log('no cookie');
        const newRefreshToken = generateRefreshToken({ id: user[0].id });

        res.cookie('jid', newRefreshToken, {
          sign: true,
          expires: new Date(Date.now() + 60 * 60 * 24 * 1000),
          httpOnly: true,
        });
      }
      const token = generateToken({ id: user[0].id });
      res.header('X-Token', token);
      res.send({
        user,
      });
    } catch (error) {
      next(error);
    }
  },

  async checkToken(req, res, next) {
    const { token } = req.body;
    const refreshCookie = req.cookies.jid;
    console.log({ refreshCookie });
    try {
      jwt.verify(token, authConfig.secret, (error, decodedJWT) => {
        if (error) {
          jwt.verify(refreshCookie, authConfig.refresh_secret, (err, decoded) => {
            if (err) {
              res.status(401).send({ error: 'Invalid refresh Token' });
            } else {
              const newToken = generateToken({ id: decoded.id });
              res.header('X-Token', newToken);
              res.status(200).send();
            }
          });
        } else {
          res.status(200).send();
        }
      });
    } catch (error) {
      res.status(401).send({ error: 'Could not validate Token' });
    }
  },
  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      const user = await knex('users').where({ email });
      if (!user[0]) {
        return res.status(400).send({ error: 'User not found' });
      }
    } catch (error) {
      console.log(error);
      return res.status(400).send({ error: 'Error reseting password' });
      // next(error);
    }
  },
};
