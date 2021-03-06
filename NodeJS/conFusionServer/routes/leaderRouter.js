const express = require('express');
const createError = require('http-errors');
const Leaders = require('../models/leaders');
const auth = require('../authenticate');
const cors = require('./cors');

const leaderRouter = express.Router();

getLeaderById = (id) => {
  return new Promise((resolve, reject) => {
    Leaders.findById(id)
        .then(leader => {
          if (leader != null) {
            resolve(leader);
          } else {
            reject(createError(404, `Leader ${id} not found`));
          }
        }, err => reject(err));
  });
};

leaderRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => {
      res.sendStatus(200);
    })
    .get(cors.cors, (req, res, next) => {
      Leaders.find(req.query).then(leaders => res.json(leaders), err => next(err));
    })
    .post(cors.corsWithOptions, auth.verifyUser, auth.verifyAdmin, (req, res, next) => {
      Leaders.create(req.body).then(leaders => res.json(leaders), err => next(err));
    })
    .put(cors.corsWithOptions, auth.verifyUser, auth.verifyAdmin, (req, res) => {
      res.status(403).end(`PUT operation not supported on /leaders`);
    })
    .delete(cors.corsWithOptions, auth.verifyUser, auth.verifyAdmin, (req, res, next) => {
      Leaders.remove({}).then(resp => res.json(resp), err => next(err));
    });

leaderRouter.route('/:id')
    .options(cors.corsWithOptions, (req, res) => {
      res.sendStatus(200);
    })
    .get(cors.cors, (req, res, next) => {
      getLeaderById(req.params.id)
          .then(leader => res.json(leader))
          .catch(err => next(err));
    })
    .post(cors.corsWithOptions, auth.verifyUser, auth.verifyAdmin, (req, res) => {
      res.status(403).end(`POST operation not supported on /leaders/${req.params.id}`);
    })
    .put(cors.corsWithOptions, auth.verifyUser, auth.verifyAdmin, (req, res, next) => {
      getLeaderById(req.params.id)
          .then(leader => {
            leader.set(req.body);
            return leader.save();
          })
          .then(leader => res.json(leader))
          .catch(err => next(err));
    })
    .delete(cors.corsWithOptions, auth.verifyUser, auth.verifyAdmin, (req, res, next) => {
      getLeaderById(req.params.id)
          .then(leader => leader.remove())
          .then(leader => res.json(leader))
          .catch(err => next(err));
    });

module.exports = leaderRouter;