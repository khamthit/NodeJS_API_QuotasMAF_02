const express = require("express");
const router = express.Router();
const { DataTypes } = require("sequelize");

const RequestQuotasController = require("../controllers/RequestQuotasController");
const RequestQuotasService = require("../services/RequestQuotasService");

const requestquotasService = new RequestQuotasService();
const requestquotasController = new RequestQuotasController(requestquotasService);

router.get("/", requestquotasController.getAllRequestQuotas.bind(requestquotasController));
router.post("/", requestquotasController.newrequestquotas.bind(requestquotasController));

module.exports = router;