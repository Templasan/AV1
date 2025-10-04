// src/models/Teste.ts

import { TipoTeste, ResultadoTeste } from "../enums/enums";

export class Teste {
    tipo: TipoTeste;
    resultado?: ResultadoTeste; // O resultado pode não existir até o teste ser concluído

    constructor(tipo: TipoTeste) {
        this.tipo = tipo;
    }
    
    public registrarResultado(resultado: ResultadoTeste) {
        this.resultado = resultado;
    }
}