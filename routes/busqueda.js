var express = require('express');

var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');



// =====================================================
// Búsqueda específica
// =====================================================

app.get('/coleccion/:tabla/:busqueda', (req, res) => {

    var tabla = req.params.tabla;
    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');


    switch (tabla) {
        case "usuarios":
            promesa = buscarUsuarios(busqueda, regex);
            // buscarHospitales(busqueda, regex).then(respuestas => {
            //     res.status(200).json({
            //         usuarios: respuestas
            //     })
            // });
            break;
        case "medicos":
            promesa = buscarMedicos(busqueda, regex);
            // buscarMedicos(busqueda, regex).then(respuestas => {
            //     res.status(200).json({
            //         medicos: respuestas
            //     })
            // });
            break;
        default:
            promesa = buscarHospitales(busqueda, regex);
            // buscarHospitales(busqueda, regex).then(respuestas => {
            //     res.status(200).json({
            //         hospitales: respuestas
            //     })
            // });
    }

    promesa.then(respuestas => {
        res.status(200).json({
            ok: true,
            [tabla]: respuestas
        });
    });
});

// =====================================================
// Búsqueda gene
// =====================================================
app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');

    Promise.all([
        buscarHospitales(busqueda, regex),
        buscarMedicos(busqueda, regex),
        buscarUsuarios(busqueda, regex)
    ]).then(respuestas => {
        res.status(200).json({
            ok: true,
            hospitales: respuestas[0],
            medicos: respuestas[1],
            usuarios: respuestas[2]
        });
    });
});



function buscarHospitales(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .exec((err, hospitales) => {
                if (err) {
                    reject('Error al cargar hospitales', err);
                } else {
                    resolve(hospitales);
                }
            });

    });
}

function buscarMedicos(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Medico.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .populate('hospital', 'nombre')
            .exec((err, medicos) => {
                if (err) {
                    reject('Error al cargar medicos', err);
                } else {
                    resolve(medicos);
                }
            });

    });
}

function buscarUsuarios(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Usuario.find({}, 'nombre email role')
            .or([{ nombre: regex }, { email: regex }])
            .exec((err, medicos) => {
                if (err) {
                    reject('Error al cargar medicos', err);
                } else {
                    resolve(medicos);
                }
            });
    });
}

module.exports = app;