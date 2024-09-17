const fs = require("fs");
const { parse } = require("csv-parse");
const path = require("path");

const validateCnpj = (cnpj) => {
  cnpj = cnpj.replace(/[^\d]+/g, "");
  if (cnpj.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cnpj)) return false;

  let length = cnpj.length - 2;
  let numbers = cnpj.substring(0, length);
  let digits = cnpj.substring(length);
  let sum = 0;
  let pos = length - 7;

  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;

  length = length + 1;
  numbers = cnpj.substring(0, length);
  sum = 0;
  pos = length - 7;

  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(1))) return false;

  return true;
};

const validateCpf = (cpf) => {
  cpf = cpf.replace(/[^\d]+/g, "");
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  let sum = 0;
  let remainder;
  for (let i = 1; i <= 9; i++)
    sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
  remainder = (sum * 10) % 11;

  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.substring(9, 10))) return false;

  sum = 0;
  for (let i = 1; i <= 10; i++)
    sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
  remainder = (sum * 10) % 11;

  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.substring(10, 11))) return false;

  return true;
};

async function seed() {
  const fileCSV = path.join(__dirname, "data.csv");
  const fileContent = fs.readFileSync(fileCSV);

  const arrLines = [];

  const lines = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  for await (const line of lines) {
    // Work with each record
    arrLines.push(line);
  }

  console.log("Tratando linhas");

  const result = arrLines.map((line) => {
    if (validateCnpj(line?.nrCpfCnpj) || validateCpf(line?.nrCpfCnpj)) {
      return {
        ...line,
        vTotal: Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(Number(line.vTotal)),
        vlPresta: Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(Number(line.vlPresta)),
        vlMora: Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(Number(line.vlMora)),
        vlMulta: Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(Number(line.vlMulta)),
        vlAtual: Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(Number(line.vlAtual)),
        calculo:
          Number(line.vlTotal) / Number(line.qtPrestacoes) ===
          Number(line.vlPresta)
            ? "Valores corretos"
            : "Valores incorretos",
      };
    } else {
      return {
        ...line,
        vlTotal: Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(Number(line.vlTotal)),
        vlPresta: Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(Number(line.vlPresta)),
        vlMora: Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(Number(line.vlMora)),
        vlMulta: Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(Number(line.vlMulta)),
        vlAtual: Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(Number(line.vlAtual)),
        result: "Documento inválido",
        calculo:
          Number(line.vlTotal) / Number(line.qtPrestacoes) ===
          Number(line.vlPresta)
            ? "Valores corretos"
            : "Valores incorretos",
      };
    }
  });

  console.log("Linhas tratadas com sucesso!", result);
}

seed().catch((e) => {
  console.error(e);
});
