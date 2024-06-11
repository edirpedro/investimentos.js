import { extrato, loadExtrato } from "/functions/extrato.js";

function csv(csv = []) {
  csv.unshift(
    "Entrada/Saída;Data;Movimentação;Produto;Instituição;Quantidade;Preço unitário;Valor da Operação"
  );
  return csv.join(";\n");
}

describe("extrato()", () => {
  it("Leitura #1 renda variável", () => {
    loadExtrato(
      csv([
        "CREDITO;01/02/2023;TRANSFERÊNCIA - LIQUIDAÇÃO;ABCD3;;10;100,00;1000,00", // Compra
        "CREDITO;03/03/2023;TRANSFERÊNCIA - LIQUIDAÇÃO;ABCD3;;2;100,00;200,00", // Aporte
        "DEBITO;20/05/2023;TRANSFERÊNCIA - LIQUIDAÇÃO;ABCD3;;5;110,00;550,00", // Saque
        "DEBITO;06/09/2023;TRANSFERÊNCIA - LIQUIDAÇÃO;ABCD3;;7;70,00;490,00", // Encerramento
      ])
    );
    let test = extrato();

    // Compra
    expect(test.ate("2023-02-20").quantidade).to.be(10);
    expect(test.ate("2023-02-20").investido).to.be(1000);
    expect(test.ate("2023-02-20").resgatado).to.be(0);
    // Aporte
    expect(test.ate("2023-03-20").quantidade).to.be(12);
    expect(test.ate("2023-03-20").investido).to.be(1200);
    expect(test.ate("2023-03-20").resgatado).to.be(0);
    // Saque
    expect(test.ate("2023-06-01").quantidade).to.be(7);
    expect(test.ate("2023-06-01").investido).to.be(650);
    expect(test.ate("2023-06-01").resgatado).to.be(550);
    // Atual
    expect(test.quantidade).to.be(0);
    expect(test.investido).to.be(0);
    expect(test.resgatado).to.be(1040);
    // Cálculos
    expect(test.resgatado - test.investimento).to.be(-160); // Prejuízo
    expect(Math.abs(test.vendas().valor) - test.compras().valor).to.be(-160); // Outra forma de calcular
    // Outros
    expect(test.investimento).to.be(1200);
    expect(test.precoMedio).to.be(100);
  });

  it("Leitura #2 renda fixa", () => {
    loadExtrato(
      csv([
        "CREDITO;01/02/2023;COMPRA / VENDA;Tesouro;;10;100,00;1000,00", // Compra
        "CREDITO;03/03/2023;COMPRA / VENDA;Tesouro;;2;100,00;200,00", // Aporte
        "DEBITO;20/05/2023;COMPRA / VENDA;Tesouro;;5;110,00;550,00", // Saque
        "DEBITO;06/09/2023;VENCIMENTO;Tesouro;;7;100,00;700,00", // Encerramento
      ])
    );
    let test = extrato();

    // Compra
    expect(test.ate("2023-02-20").quantidade).to.be(10);
    expect(test.ate("2023-02-20").investido).to.be(1000);
    expect(test.ate("2023-02-20").resgatado).to.be(0);
    // Aporte
    expect(test.ate("2023-03-20").quantidade).to.be(12);
    expect(test.ate("2023-03-20").investido).to.be(1200);
    expect(test.ate("2023-03-20").resgatado).to.be(0);
    // Saque
    expect(test.ate("2023-06-01").quantidade).to.be(7);
    expect(test.ate("2023-06-01").investido).to.be(650);
    expect(test.ate("2023-06-01").resgatado).to.be(550);
    // Atual
    expect(test.quantidade).to.be(0);
    expect(test.investido).to.be(0);
    expect(test.resgatado).to.be(1250);
    // Cálculos
    expect(test.resgatado - test.investimento).to.be(50); // Lucro
    // Outros
    expect(test.investimento).to.be(1200);
    expect(test.precoMedio).to.be(100);
  });
});
