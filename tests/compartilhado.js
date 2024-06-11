import { calculaAcumulado, preparaData } from "/functions/compartilhado.js";

let test;

describe("compartilhado.js", () => {
  it("calculaAcumulado()", () => {
    let dados = [{ valor: 1 }, { valor: 1 }, { valor: 1 }];
    test = calculaAcumulado(dados, "valor");
    expect(test[0].valor).to.be(1.0000000000000009);
    expect(test[2].valor).to.be(3.030099999999991);
  });

  it("preparaData()", () => {
    // ISO
    test = preparaData("2023-01-10");
    expect(test).to.be.a(luxon.DateTime);
    expect(test.day).to.be(10);
    expect(test.month).to.be(1);
    expect(test.year).to.be(2023);
    // Timestamp
    test = preparaData(luxon.DateTime.fromISO("2023-01-10").toMillis());
    expect(test).to.be.a(luxon.DateTime);
    expect(test.day).to.be(10);
    expect(test.month).to.be(1);
    expect(test.year).to.be(2023);
    // DateTime
    test = luxon.DateTime.fromISO("2023-01-10");
    expect(test).to.be.a(luxon.DateTime);
    expect(test.day).to.be(10);
    expect(test.month).to.be(1);
    expect(test.year).to.be(2023);
  });
});
