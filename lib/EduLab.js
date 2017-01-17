
var express = require('express')

var EduLab = function(opts) {
    var that = this;
    this.opts = opts || {};
    this.router = express.Router()
    this.router.get('/', (req, res)  => this.frontpage(req, res) );
    this.router.get('/debug', (req, res)  => this.debug(req, res) );
    this.router.get('/machines', (req, res)  => this.machines(req, res) );
    this.router.get('/machines-admin', (req, res)  => this.machinesAdmin(req, res) );
    this.router.get('/create-lab', (req, res)  => this.createLab(req, res) );
}

EduLab.prototype.getCommonAttributes = function(req) {
    var data = {};
    data.authenticated = !!req.user;
    if (req.user) {
        data.user = req.user.data;
        data.groups = req.groups;
    }
    return data;
}


EduLab.prototype.frontpage = function(req, res) {
    var data = this.getCommonAttributes(req);
    data.x = JSON.stringify(data, undefined, 1);
    res.render('frontpage', data);
}

EduLab.prototype.createLab = function(req, res) {
    var data = this.getCommonAttributes(req);
    res.render('create-lab', data);
}

EduLab.prototype.machines = function(req, res) {
    var data = this.getCommonAttributes(req);
    res.render('machines', data);
}

EduLab.prototype.machinesAdmin = function(req, res) {
    var data = this.getCommonAttributes(req);
    res.render('machines-admin', data);
}

EduLab.prototype.debug = function(req, res) {
    var data = this.getCommonAttributes(req);
    data.x = JSON.stringify(data, undefined, 1);
    res.render('debug', data);
}


EduLab.prototype.getRouter = function() {
    return this.router;
}
exports.EduLab = EduLab
