var express = require('express');
var fileUpload = require('express-fileupload');

var app = express();

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

var fs = require('fs');

// default options
app.use(fileUpload());



app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // Tipos válidos colección
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de colección no es válida',
            errors: { message: 'Tipo de colección no es válida' }
        });

    }


    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No selecciono nada',
            errors: { message: 'Debe selecciona una imagen' }
        });
    }

    // Obtener nombre del archivo

    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    // Extensiones admitidas
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extensión no válida',
            errors: { message: 'Las extensiones validas son ' + extensionesValidas.join(', ') }
        });

    }



    // Establecer nombre personalizado
    var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;

    // Mover el archivo temporal a un path

    var path = `./uploads/${tipo}/${nombreArchivo}`;

    archivo.mv(path, err => {


        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: err
            });
        }



        subirPorTipo(tipo, id, nombreArchivo, res, path);








    });









});

function subirPorTipo(tipo, id, nombreArchivo, res, path) {

    if (tipo === 'usuarios') {

        Usuario.findById(id, (err, usuario) => {

            if (err) {
                fs.unlink(path)

                return res.status(500).json({
                    ok: false,
                    mensaje: 'No se ha encontrado el usuario',
                    errors: err

                });
            }

            if (!usuario) {
                fs.unlink(path)
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Referencia encontrada no es un usuario',
                    errors: err

                });

            }




            var pathViejo = './uploads/usuarios/' + usuario.img;

            //Si existe, elimina imagen anterior

            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }

            usuario.img = nombreArchivo;

            usuario.save((err, usuarioActualizado) => {
                usuarioActualizado.password = ':)';
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    usuario: usuarioActualizado
                });
            })
        });
    }

    if (tipo === 'hospitales') {

        Hospital.findById(id, (err, hospital) => {

            if (err) {
                fs.unlink(path)
                return res.status(500).json({
                    ok: false,
                    mensaje: 'No se ha encontrado el Hospital',
                    errors: err

                });
            }

            if (!hospital) {
                fs.unlink(path)
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Referencia econotrada no es un hospital',
                    errors: err

                });

            }


            var pathViejo = './uploads/hospitales/' + hospital.img;

            // Si existe, elimina imagen anterior

            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }

            hospital.img = nombreArchivo;

            hospital.save((err, hospitalActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de hospital actualizada',
                    hospital: hospitalActualizado
                });
            })
        });
    }

    if (tipo === 'medicos') {

        Medico.findById(id, (err, medico) => {

            if (err) {
                fs.unlink(path)
                return res.status(500).json({
                    ok: false,
                    mensaje: 'No se ha encontrado el medico',
                    errors: err

                });
            }

            if (!medico) {
                fs.unlink(path)
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Referencia econotrada no es un medico',
                    errors: err

                });

            }


            var pathViejo = './uploads/medicos/' + medico.img;

            // Si existe, elimina imagen anterior

            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }

            medico.img = nombreArchivo;

            medico.save((err, medicoActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de medico actualizada',
                    medico: medicoActualizado
                });
            })
        });
    }








}




module.exports = app;