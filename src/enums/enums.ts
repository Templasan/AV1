// src/enums/enums.ts

export enum TipoAeronave {
    COMERCIAL = "COMERCIAL",
    MILITAR = "MILITAR"
}

export enum TipoPeca {
    NACIONAL = "NACIONAL",
    IMPORTADA = "IMPORTADA"
}

export enum StatusPeca {
    EM_PRODUCAO = "EM PRODUÇÃO",
    EM_TRANSPORTE = "EM TRANSPORTE",
    PRONTA = "PRONTA"
}

export enum StatusEtapa {
    PENDENTE = "PENDENTE",
    EM_ANDAMENTO = "EM ANDAMENTO",
    CONCLUIDA = "CONCLUÍDA"
}

export enum NivelPermissao {
    ADMINISTRADOR = "ADMINISTRADOR",
    ENGENHEIRO = "ENGENHEIRO",
    OPERADOR = "OPERADOR"
}

export enum TipoTeste {
    ELETRICO = "ELÉTRICO",
    HIDRAULICO = "HIDRÁULICO",
    AERODINAMICO = "AERODINÂMICO"
}

export enum ResultadoTeste {
    APROVADO = "APROVADO",
    REPROVADO = "REPROVADO"
}