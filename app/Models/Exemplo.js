'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Exemplo extends Model {
  static get table(){
    return 'NomeDaTabela';
  }
  static get primaryKey(){
    return 'idTabela';
  }
}

module.exports = Exemplo
