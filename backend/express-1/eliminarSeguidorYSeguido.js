const usuarios = require('./usuarios.js');

function eliminarSeguidorYSeguido(idSeguidor, idSeguido) {
    const seguidorIndex = usuarios.findIndex(usuario => usuario.id === parseInt(idSeguidor));
    const seguidoIndex = usuarios.findIndex(usuario => usuario.id === parseInt(idSeguido));

    if(seguidorIndex === -1 || seguidoIndex === -1) {
        throw new Error('Seguidor o seguido no encontrado');
    }

    usuarios[seguidorIndex].seguidos = usuarios[seguidorIndex].seguidos.filter(seguido => seguido.id !== parseInt(idSeguido));
    usuarios[seguidorIndex].seguidores = usuarios[seguidorIndex].seguidores.filter(seguidor => seguidor.id !== parseInt(idSeguido));

    usuarios[seguidoIndex].seguidos = usuarios[seguidoIndex].seguidos.filter(seguido => seguido.id !== parseInt(idSeguidor));
    usuarios[seguidoIndex].seguidores = usuarios[seguidoIndex].seguidores.filter(seguidor => seguidor.id !== parseInt(idSeguidor));
}

module.exports = eliminarSeguidorYSeguido;