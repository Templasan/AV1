import { TipoTeste, ResultadoTeste } from "../enums/enums";

export class Teste {
    tipo: TipoTeste;
    resultado?: ResultadoTeste;

    constructor(tipo: TipoTeste) {
        this.tipo = tipo;
    }
    
    public registrarResultado(resultado: ResultadoTeste) {
        this.resultado = resultado;
    }
}