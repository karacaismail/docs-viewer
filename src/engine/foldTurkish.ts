// 13A §2 — tek deterministik fold; adım sırası sözleşmenin parçası.
// 1) İ/I/ı -> i (lowercase'ten ÖNCE)  2) lowercase  3) NFD  4) combining mark temizliği
export function foldTurkish(term: string): string {
  return term.replace(/[İIı]/g, "i").toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
}
