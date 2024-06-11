import {
  loadIPCA,
  ipcaDadosMensais,
  ipcaMensal,
  ipcaMes,
  ipca12meses,
} from "/functions/ipca.js";

let test;

describe("ipca.js", () => {
  before(async () => {
    await loadIPCA();
  });

  it("ipcaMensal()", () => {
    test = ipcaMensal("2023-01-10", "2023-10-10");
    expect(test.length).to.be(10);
    expect(test[0].valor).to.be(0.53);
    expect(test[9].valor).to.be(0.24);
  });

  it("ipcaMes()", () => {
    expect(ipcaMes(1, 2023)).to.be(0.53);
  });

  it("ipca12meses()", () => {
    test = ipca12meses();
    let dados = ipcaDadosMensais().slice(-12);
    expect(test.length).to.be(12);
    expect(test[0].valor).to.be(dados[0].valor);
    expect(test[11].valor).to.be(dados[11].valor);
  });
});
